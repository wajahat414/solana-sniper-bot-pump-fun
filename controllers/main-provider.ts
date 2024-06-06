import * as constX from "../constants";
import { Data } from "../data/data";
import { AppCodes } from "../models/app_resp_codes";
import { Token } from "../models/token";
import { Trade } from "../models/trade";
import { get_price_from_transaction } from "../services/get_price_from_transaction";
import { SolanaCommunicator } from "../services/solana_communicator";

class MainController {
  async executeBuyTrade(): Promise<AppCodes> {
    const trade = this.data.currentTrade;
    if (trade) {
      const resp = await this.solanaCommunicator.buy_trade_from_pump(trade);
      if (resp != AppCodes.FAILED_BUY_TRADE) {
        this.data.currentToken!.tradeSignatures.push(resp);
        if (this.data.currentToken) {
          this.data.tokenList.set(
            this.data.currentToken!.mint.toBase58(),
            this.data.currentToken
          );
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
        this.data.currentToken!.associatedTokenAccount.toBase58(),
        true
      );
      this.data.currentTrade = trade;
    }

    //  this.solanaCommunicator.buy_token_from_pump(this.get_price_from_transaction
  }
  async getIntitialPriceTick(): Promise<number> {
    const initial_price_x = await get_price_from_transaction(
      this.data.currentToken!.mint.toBase58()
    );
    if (initial_price_x == -1) {
      return -1;
    }
    this.data.currentToken!.initialPrice = initial_price_x;
    return 1;
  }

  async setup_assocaited_token_account(): Promise<AppCodes> {
    try {
      const resp =
        await this.solanaCommunicator.getOrCreateAssociatedTokenAccountX(
          this.data.currentToken!.mint,
          constX.wallet.publicKey
        );
      if (resp != AppCodes.FAILED_GET_ASSOCIATED_TOKEN_ACCOUNT) {
        this.data.currentToken!.associatedTokenAccount = resp;
      }
      return AppCodes.SUCCESS_SETUP_ASSOCIATED_TOKEN_ACCOUNT;
    } catch (e) {
      console.log(e);
      return AppCodes.FAILED_SETUP_ASSOCIATED_TOKEN_ACCOUNT;
    }
  }
  setTokenDataFromTransactions(): AppCodes {
    return this.data.setTokenDataFromTransactions();
  }
  data: Data;
  solanaCommunicator: SolanaCommunicator;

  constructor(data: Data) {
    this.data = data;
    this.solanaCommunicator = new SolanaCommunicator();
  }
}

export { MainController };
