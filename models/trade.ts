import { Token } from "./token";

export class Trade {
   sol_amount: number ;
     token_amount: number ;
     mint: Token;
     assocaited_token_account: String;
     isBuy: boolean
    
    constructor(
        sol_amount: number,
        token_amount: number,
        mint: Token,
        assocaited_token_account: String,
        isBuy: boolean = true,
    ) {
        this.sol_amount = sol_amount;
        this.token_amount = token_amount;
        this.mint = mint;
        this.assocaited_token_account = assocaited_token_account;
        this.isBuy = isBuy;

    }

}