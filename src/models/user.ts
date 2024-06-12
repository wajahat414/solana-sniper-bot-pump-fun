import {PublicKey} from "@solana/web3.js";
import {  BN, Wallet } from '@project-serum/anchor';
class User {
    wallet: Wallet;
    associatedTokenAccount ?: Map<String,  PublicKey>;
    constructor (wallet:Wallet){
        this.wallet =wallet;

    }
  
}

export {User}