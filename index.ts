import { Transaction } from "./models/transaction";
import { Data } from "./data/data";
import { User } from "./models/user";
import { connectionHelius, connectionQuickNode, wallet } from "./constants";
import { MainController } from "./controllers/main-provider";
import { Helpers } from "./helpers/helpers";
import { AppCodes } from "./models/app_resp_codes";
import PubSub from "pubsub-js";
import { EventType } from "./events/app_event_manager";
// Subscribe to events

const coreController = new MainController(new Data(new User(wallet)));

async function start() {
  subscribeAppEvents();
  PubSub.publish(EventType.GET_NEW_MINT, {});
  // const sol_per_trade = 0.001;
  // const token_rate = 3.771623497871014e-8;
  // const token_per_sol = sol_per_trade / token_rate;
  // console.log(token_per_sol);

  const res = await coreController.solanaCommunicator.testFunction();
  console.log(res);
}

start();

async function subscribeAppEvents() {
  PubSub.subscribe(EventType.GET_NEW_MINT, (_, payload) =>
    handleGetNewMint(payload)
  );

  PubSub.subscribe(EventType.CREATE_ASSOCIATED_TOKEN_ACCOUNT, (_, payload) =>
    handleCreateAssociatedTokenAccount(payload)
  );
  PubSub.subscribe(EventType.GET_INTITIAL_PRICE, (_, payload) =>
    handleGetInitialTokenPrice(payload)
  );
  PubSub.subscribe(EventType.SETUP_BUY_TRADE, (_, payload) =>
    handleSetupBuyTrade(payload)
  );
  PubSub.subscribe(EventType.EXECUTE_BUY_TRADE, (_, payload) =>
    handleExecuteBuyTrade(payload)
  );
}

async function handleCreateAssociatedTokenAccount(payload: any): Promise<void> {
  console.log("create_associated_token_account recieved in subscribeAppEvents");
  const res = await coreController.setup_assocaited_token_account();
  if (res == 1) {
    PubSub.publish(EventType.GET_INTITIAL_PRICE, {});
  }
}

async function handleGetInitialTokenPrice(payload: any): Promise<void> {
  console.log("get_intitial_price recieved in subscribeAppEvents");
  const res = await coreController.getIntitialPriceTick();

  if (res == 1) {
    PubSub.publish(EventType.SETUP_BUY_TRADE, {});
  }
}

async function handleGetNewMint(payload: any): Promise<void> {
  console.log("get New Mint from Pump Portal");

  const data = await getTransactions();

  if (
    data != AppCodes.FAILED &&
    data != AppCodes.FAILED_FETCHING_TRANSACTIONS
  ) {
    const transactions = Transaction.fromJSONArray(data);
    coreController.data.setTransactions(transactions);
    const resp = coreController.setTokenDataFromTransactions(); // getting new Token data from transactions'

    if (resp == AppCodes.SUCCESS) {
      console.log("new token data recieved");
      PubSub.publish(EventType.CREATE_ASSOCIATED_TOKEN_ACCOUNT, {});
    } else {
      Helpers.showAlert(
        "Error",
        `Failed to get token data from transactions ${resp}`
      );
    }
  }
}

function handleSetupBuyTrade(payload: any): void {
  console.log("setup_buy_trade recieved in subscribeAppEvents");
  coreController.setupBuyTrade();
}

async function handleExecuteBuyTrade(payload: any): Promise<void> {
  console.log("execute_buy_trade recieved in subscribeAppEvents");
  const resp = await coreController.executeBuyTrade();
  if (resp == AppCodes.SUCCESS_BUY_TRADE) {
    console.log("token bought");
    PubSub.publish(EventType.TOKEN_BOUGHT, {});
  } else {
    Helpers.showAlert("Error", `Failed to buy token ${resp}`);
  }
}
