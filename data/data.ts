import {Token} from '../models/token';
import {User} from '../models/user';
import * as constants from '../constants'

class Data {
    currentToken: Token;
    user : User
   
    constructor(token: Token,user: User) {
      this.currentToken= token;
      this.user = user;
    }
  }
  const mainUser = new User(constants.wallet);
 const GlobalData = new Data(new Token("7wXoc387BC9UtHTcGi6HtvzkGwcB2QYGLTm5CmH71UKk", "DvYrvEuMEqMTJV5dmPFLD8s54H59hcHHU1DtNmfr1k8","DWbMsHH7D94s5DPtGXXdt2G6UcV15A1Q99yEwMvRcb79" ),mainUser);

export {Data,GlobalData}