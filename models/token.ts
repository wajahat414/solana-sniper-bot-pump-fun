import {PublicKey} from "@solana/web3.js";
class Token {
    mint: PublicKey;
    bondingCurve: PublicKey;
    associatedbBondingCurve: PublicKey;
   
    constructor(mintAddress: String,bondingCurve:String,associatedBondingCurve:String) {
      this.mint = new PublicKey( mintAddress);
      this.bondingCurve =new PublicKey( bondingCurve);
      this.associatedbBondingCurve =new PublicKey( associatedBondingCurve);
    }
   
  }


  export {Token}