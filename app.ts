import { Data } from "./src/data/data";
import { User } from "./src/models/user";
import { wallet } from "./constants";
import { MainController } from "./src/controllers/main-provider";
import { Helpers } from "./src/helpers/helpers";
import { AppCodes } from "./src/models/app_resp_codes";
import PubSub from "pubsub-js";
import { EventType } from "./src/events/app_event_manager";
import logger from "./src/helpers/app_logger";
import dotenv from "dotenv";
import { BUY_STRATEGY_TYPE } from "./src/logic/strategy";
dotenv.config();
// Subscribe to events

const coreController = new MainController(new Data(new User(wallet)));

async function start() {
  const strategy = process.env.BUY_STRATEGY;
  const buy_strategy = strategy as BUY_STRATEGY_TYPE;
  if (buy_strategy == BUY_STRATEGY_TYPE.INTITIAL_BUY_VOL_ZERO) {
    logger.info("Buy strategy  is Initail Volume Zero");
  } else {
    logger.info("Buy strategy  is not Initail Volume Zero");
  }
  const wallettest = wallet;
  logger.debug(`wallet ${wallet.publicKey}`);
  subscribeAppEvents();
  coreController.pumpPortalCommunicator.subscribeNewToken();
}

start();

async function subscribeAppEvents() {
  PubSub.subscribe(EventType.GET_NEW_MINT, (_, payload) =>
    handleGetNewMint(payload)
  );

  PubSub.subscribe(EventType.CREATE_ASSOCIATED_TOKEN_ACCOUNT, (_, payload) =>
    handleCreateAssociatedTokenAccount(payload)
  );

  PubSub.subscribe(EventType.SETUP_BUY_TRADE, (_, payload) =>
    handleSetupBuyTrade(payload)
  );
  PubSub.subscribe(EventType.EXECUTE_BUY_TRADE, (_, payload) =>
    handleExecuteBuyTrade(payload)
  );

  PubSub.subscribe(EventType.POST_BUY_TRADE, (_, payload) =>
    handlePostBuyTrade(payload)
  );
}

async function handleCreateAssociatedTokenAccount(payload: any): Promise<void> {
  logger.debug(
    "create_associated_token_account recieved in subscribeAppEvents"
  );
  try {
    const res = await coreController.setup_assocaited_token_account();
    if (res == 1) {
      PubSub.publish(EventType.SETUP_BUY_TRADE, {});
    }
  } catch (e) {
    logger.error("error in create_associated_token_account", e);
  }
}

async function handleGetNewMint(payload: any): Promise<void> {
  try {
    if (payload["initialBuy"] == 0) {
      logger.info(
        `initialBuy is zero ${payload["mint"]}  initialBuy ${payload["initialBuy"]}`
      );
      const resp = await coreController.setTokenInfo(payload);
      if (resp != AppCodes.FAILED_SETTING_TOKEN_INFO) {
        logger.info("Success Setting Token Info");
        PubSub.publish(EventType.CREATE_ASSOCIATED_TOKEN_ACCOUNT, {});
      }
    } else {
      logger.info(
        `initialBuy is not zero ${payload["mint"]}  initialBuy ${payload["initialBuy"]}`
      );
    }
  } catch (e) {
    logger.error("error in handleGetNewMint", e);
  }
}

function handleSetupBuyTrade(payload: any): void {
  console.log("setup_buy_trade recieved in subscribeAppEvents");
  if (coreController.setupBuyTrade() == AppCodes.SUCCESS) {
    console.log("buy trade setup");
    PubSub.publish(EventType.EXECUTE_BUY_TRADE, {});
  }
}

async function handleExecuteBuyTrade(payload: any): Promise<void> {
  logger.debug("execute_buy_trade recieved in subscribeAppEvents");
  const resp = await coreController.executeBuyTrade();
  if (resp == AppCodes.SUCCESS_BUY_TRADE) {
    logger.info("Success Buy Trade");
    PubSub.publish(EventType.POST_BUY_TRADE, {});
  } else {
    Helpers.showAlert("Error", `Failed to buy token ${resp}`);
    logger.error(`Failed to buy token ${resp}`);
  }
}

async function handlePostBuyTrade(payload: any): Promise<void> {
  coreController.postBuyTradeAction();
  logger.debug("post_buy_trade recieved in subscribeAppEvents");
}
