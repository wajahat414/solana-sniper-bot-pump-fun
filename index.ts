import { getTransactions } from "./services/get_new_token";
import {Transaction} from "./models/transaction"; 
import { Data } from "./data/data";
import { User } from "./models/user";
import { wallet } from "./constants";
import { MainController } from "./controllers/main-provider";

const coreController = new MainController(new Data(new User(wallet)));

async function start() {

    getTokenData();
    setUpTrade();
}


start();



async function getTokenData() {

  const  data = await getTransactions();
  if (data!=-1){
    const transactions = Transaction.fromJSONArray(data);
    coreController.data.setTransactions(transactions);
     coreController.setTokenDataFromTransactions();
console.log(transactions);

  }
    
}
function setUpTrade() {
   
}

