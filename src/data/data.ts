import {Token} from '../models/token';
import {User} from '../models/user';
import { Transaction } from '../models/transaction';
import { SetWithContentEquality, Stack } from '../models/data_structures';
import { AppCodes } from '../models/app_resp_codes';
import { Trade } from '../models/trade';

class Data {
  currentTrade: Trade | undefined;
  setTokenDataFromTransactions() : AppCodes {
   
    if(this.transactions !== undefined){
      if(this.transactions.length > 0){
        const mint = this.transactions[0].tokenTransfers[0].mint;
        const bondingCurve = this.transactions[0].tokenTransfers[0].toUserAccount;
        const associatedBondingCurve = this.transactions[0].tokenTransfers[0].toTokenAccount;
     
        const token = new Token(mint,bondingCurve,associatedBondingCurve);
        if(this.tokenSet.has(token)){
         return AppCodes.TOKEN_ALREADY_EXISTS;

        }
        this.currentToken = token;
        this.tokenList.set(mint, token);
        this.token_stack.push(token);
        return AppCodes.SUCCESS;
      }
    }
    return AppCodes.FAILED;
  }
    currentToken?: Token;
    tokenList: Map<string, Token> = new Map();
   tokenSet = new SetWithContentEquality<Token>(token => token.mint.toString());  

    token_stack = new Stack<Token>(100);
    user : User;
    transactions?: Transaction[];
   
    constructor(user: User) {

      this.user = user;
    }

    getTransactions(): Transaction[] | undefined {
      return this.transactions;
  }

  setTransactions(transactions: Transaction[]): void {
      this.transactions = transactions;
  }

    
  }

export {Data}



