import { Token } from "../models/token";

import { SetWithContentEquality, Stack } from "../models/data_structures";
import { Trade } from "../models/trade";

class Data {
  pendingTrades = new Stack<Trade>(100);

  currentToken?: Token;

  tokenSet = new SetWithContentEquality<Token>((token) =>
    token.mint.toString()
  );

  token_stack = new Stack<Token>(100);

  constructor() {}
}
const appData = new Data();
export { appData, Data };
