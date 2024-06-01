import *  as constX from '../constants' 
import {GlobalData,Data} from '../data/data'
import { Token } from '../models/token';

class MainController {
   data: Data;

   constructor (data:Data){
    this.data = data;
   }

  
    getToken():Token {
      
      return this.data.currentToken;
    }

  }

 const  mainController = new MainController(GlobalData);


 export {mainController}