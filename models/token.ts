import {PublicKey} from "@solana/web3.js";
class Token {
    mint: PublicKey;
    bondingCurve: PublicKey;
    associatedbBondingCurve: PublicKey;
    associatedTokenAccount?: PublicKey;
    initialPrice: number = 0;
    currentPrice: number = 0;
    tradeSignatures: string[] = [];
   
    constructor(mintAddress: String,bondingCurve:String,associatedBondingCurve:String) {
      this.mint = new PublicKey( mintAddress);
      this.bondingCurve =new PublicKey( bondingCurve);
      this.associatedbBondingCurve =new PublicKey( associatedBondingCurve);
    }
    setAssociatedTokenAccount(associatedTokenAccount: String) {
      this.associatedTokenAccount =new PublicKey( associatedTokenAccount);
    }
   
  }


  export {Token}