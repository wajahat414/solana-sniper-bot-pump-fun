import WebSocket from "ws";

export class PumpPortalCommunicator {
  ws_new_token = new WebSocket("wss://pumpportal.fun/api/data");
  ws_trade = new WebSocket("wss://pumpportal.fun/api/data");

  constructor() {}

  subscribeTokenTrade(tokenAddress: string) {
    const payload = {
      method: "subscribeTokenTrade",
      keys: [tokenAddress],
    };
    this.ws_trade.on("open", function open() {});

    this.ws_trade.send(JSON.stringify(payload));
  }
  subscribeNewToken() {
    const payload = {
      method: "subscribeNewToken",
    };
    this.ws_new_token.send(JSON.stringify(payload));
  }

  messageFromNewTokenSocket(
    callback: (this: WebSocket, data: WebSocket.Data) => void
  ) {
    this.ws_new_token.on("message", callback);
  }
  messageFromTradeSocket(callback: any) {
    this.ws_trade.on("message", function message(data) {
      const testData = JSON.parse(data.toString());
      const marketCapSol = testData["marketCapSol"];
      const vitualToken = testData["vTokensInBondingCurve"];
      const virtualSol = testData["vSolInBondingCurve"];
      console.log(testData);
      const tokenPrice = virtualSol / vitualToken;
      console.log(
        `Token Price: ${tokenPrice}   marketCapSol: ${marketCapSol}   vitualToken: ${vitualToken}`
      );
    });
    this.ws_trade.on("message", callback);
  }

  stop() {
    this.ws_new_token.close();
    this.ws_trade.close();
  }
  start() {
    this.ws_new_token.on("open", function open() {});
    this.ws_trade.on("open", function open() {});
  }
}
