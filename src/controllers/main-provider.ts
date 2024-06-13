import * as constX from "../../constants";
import { Data } from "../data/data";
import { EventType } from "../events/app_event_manager";
import logger from "../helpers/app_logger";
import { AppCodes } from "../models/app_resp_codes";
import { Token } from "../models/token";
import { TokenData } from "../models/token_data";
import { Trade } from "../models/trade";
import { get_data_from_transaction } from "../network/helius_api";
import { PumpPortalCommunicator } from "../network/pump_portal_communicator";
import { SolanaCommunicator } from "../network/solana_communicator";

class MainController {
  async postBuyTradeAction() {
    const signature = this.data.currentToken!.tradeSignatures[0];

    try {
      const postTradeData = await get_data_from_transaction(signature);
      if (postTradeData) {
        const token_bought = postTradeData["tokenAmountTransferred"];
        const sol_deducted = postTradeData["nativeBalanceChangeSol"];
        const token_post_price = postTradeData["rate"];
        const token_id = this.data.currentToken!.mint;
        PubSub.publish(EventType.TRACK_BOUGHT_TOKEN, {
          token_id,
          token_bought,
          sol_deducted,
          token_post_price,
        });
      }
    } catch (e) {
      logger.error(
        ` Failed to get Buy trade information from Signature ${signature}`
      );
    }
  }
  async setTokenInfo(payload: any) {
    let tokenInfo: TokenData;
    try {
      tokenInfo = new TokenData(payload);
      logger.info(
        `Successfully Parsed Token Data using constructor from new Mint Info ${tokenInfo}`
      );
    } catch (e) {
      logger.error(
        `failed to Parse Token Data using constructor from new Mint Info ${e}`
      );
      return AppCodes.FAILED_SETTING_TOKEN_INFO;
    }
    const assocaitedBondingCurve =
      await this.solanaCommunicator.getAssocaitedBondingCurve(
        tokenInfo.signature
      );
    if (assocaitedBondingCurve != AppCodes.FAILED_GETTING_BONDING_CURVE) {
      const token = new Token(
        tokenInfo.mint,
        tokenInfo.bondingCurveKey,
        assocaitedBondingCurve
      );
      token.initialPrice =
        tokenInfo.vTokensInBondingCurve / tokenInfo.vSolInBondingCurve;

      this.data.tokenSet.add(token);
      this.data.currentToken = token;
    } else {
      logger.error(
        `Failed to get Assocaited Bonding Curve from Signatsure ${tokenInfo.signature}`
      );
      return AppCodes.FAILED_SETTING_TOKEN_INFO;
    }
  }
  data: Data;
  solanaCommunicator: SolanaCommunicator;
  pumpPortalCommunicator: PumpPortalCommunicator;

  constructor(data: Data) {
    this.data = data;
    this.solanaCommunicator = new SolanaCommunicator();
    this.pumpPortalCommunicator = PumpPortalCommunicator.getInstance();
  }
  // async testfunctions() {
  //   const result = await get_data_from_transaction(
  //     "5Kn6qvuz2nb1P6zyFPqXBpNQbkFB4hSTCsoisCQvxhLVsTZQhGyuFQ9unwfCYJjxgipQvE3WTkif5zJJWU5M9m7v"
  //   );
  //   logger.info(result);
  //   const test = result;
  // }
  async executeBuyTrade(): Promise<AppCodes> {
    const trade = this.data.pendingTrades.pop();
    if (trade) {
      const resp = await this.solanaCommunicator.buy_trade_from_pump(trade);
      if (resp != AppCodes.FAILED_BUY_TRADE) {
        this.data.currentToken!.tradeSignatures.push(resp);
        if (this.data.currentToken) {
          this.data.tokenSet.add(this.data.currentToken);
        }

        return AppCodes.SUCCESS_BUY_TRADE;
      }
    }

    return AppCodes.FAILED_BUY_TRADE;
  }
  setupBuyTrade() {
    const sol_per_trade = 0.001;
    const token_rate = this.data.currentToken!.initialPrice;
    const token_per_sol = sol_per_trade / token_rate;

    if (
      this.data.currentToken!.associatedTokenAccount &&
      token_rate != 0 &&
      this.data.currentToken
    ) {
      const trade = new Trade(
        sol_per_trade,
        token_per_sol,
        this.data.currentToken,
        this.data.currentToken!.associatedTokenAccount.toString(),
        true
      );
      this.data.pendingTrades.push(trade);
      return AppCodes.SUCCESS;
    }

    //  this.solanaCommunicator.buy_token_from_pump(this.get_price_from_transaction
  }

  async setup_assocaited_token_account(): Promise<AppCodes> {
    try {
      if (this.data.currentToken) {
        const resp =
          await this.solanaCommunicator.getOrCreateAssociatedTokenAccountX(
            this.data.currentToken!.mint,
            constX.wallet.publicKey
          );

        if (
          resp != AppCodes.FAILED_GET_ASSOCIATED_TOKEN_ACCOUNT &&
          resp != ""
        ) {
          this.data.currentToken!.associatedTokenAccount = resp;
          return AppCodes.SUCCESS_SETUP_ASSOCIATED_TOKEN_ACCOUNT;
        }
        return AppCodes.FAILED_SETUP_ASSOCIATED_TOKEN_ACCOUNT;
      } else {
        logger.error("Failed to get current Token");
        return AppCodes.FAILED_SETUP_ASSOCIATED_TOKEN_ACCOUNT;
      }
    } catch (e) {
      console.log(e);
      return AppCodes.FAILED_SETUP_ASSOCIATED_TOKEN_ACCOUNT;
    }
  }
}

export { MainController };
