import {Token} from '../models/token';
import {User} from '../models/user';
import * as constants from '../constants'
import { Transaction } from '../models/transaction';

class Data {
  setTokenDataFromTransactions() {
   
    if(this.transactions !== undefined){
      if(this.transactions.length > 0){
        const mint = this.transactions[0].tokenTransfers[0].mint;
        const bondingCurve = this.transactions[0].tokenTransfers[0].toUserAccount;
        const associatedBondingCurve = this.transactions[0].tokenTransfers[0].toTokenAccount;
        const token = new Token(mint,bondingCurve,associatedBondingCurve);
        this.currentToken = token;
        this.tokenList.set(mint, token);
        return token;
      }
    }
  }
    currentToken?: Token;
    tokenList: Map<string, Token> = new Map();
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