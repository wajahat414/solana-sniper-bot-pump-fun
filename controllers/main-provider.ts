import *  as constX from '../constants' 
import {Data} from '../data/data'
import { Token } from '../models/token';
import { SolanaCommunicator } from '../services/solana_communicator';

class MainController {
   setTokenDataFromTransactions() {
    return this.data.setTokenDataFromTransactions();
  }
   data: Data ;
   solanaCommunicator: SolanaCommunicator;

   constructor (data:Data){
    this.data = data;
    this.solanaCommunicator = new SolanaCommunicator();
   }

  


  }


 export {MainController}