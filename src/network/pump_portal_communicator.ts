import WebSocket from "ws";

import PubSub from "pubsub-js";
import { EventType } from "../events/app_event_manager";
import logger from "../helpers/app_logger";

export class PumpPortalCommunicator {
  ws_new_token = new WebSocket("wss://pumpportal.fun/api/data");
  ws_trade = new WebSocket("wss://pumpportal.fun/api/data");
  private static instance: PumpPortalCommunicator;

  constructor() {}

  public static getInstance(): PumpPortalCommunicator {
    if (!PumpPortalCommunicator.instance) {
      PumpPortalCommunicator.instance = new PumpPortalCommunicator();
    }
    return PumpPortalCommunicator.instance;
  }
  subscribeTokenTrade(tokenAddress: string) {
    const payload = {
      method: "subscribeTokenTrade",
      keys: [tokenAddress],
    };
    this.ws_trade.on("open", function open() {
      this.send(JSON.stringify(payload));
    });
  }

  unsubscribeTokenTrade(tokenAddress: string) {
    const payload = {
      method: "unsubscribeTokenTrade",
      keys: [tokenAddress],
    };
    this.ws_trade.send(JSON.stringify(payload));
  }
  subscribeNewToken() {
    const payload = {
      method: "subscribeNewToken",
    };
    this.ws_new_token.on("open", function open() {
      this.send(JSON.stringify(payload));
    });
    this.ws_new_token.on("message", function message(data) {
      const jsondata = JSON.parse(data.toString());
      if (jsondata["signature"]) {
        PubSub.publish(EventType.GET_NEW_MINT, jsondata);
        logger.info(jsondata);
      }
    });
  }
  listenPriceUpdateFromNewTrade(callback: (data: any) => void) {
    this.ws_trade.on("message", function message(data) {
      const jsonData = JSON.parse(data.toString());
      const marketCapSol = jsonData["marketCapSol"];
      const vitualToken = jsonData["vTokensInBondingCurve"];
      const virtualSol = jsonData["vSolInBondingCurve"];
      const tokenPrice = virtualSol / vitualToken;

      logger.info(
        `Token Price: ${tokenPrice}   marketCapSol: ${marketCapSol}   vitualToken: ${vitualToken}`
      );

      // Call the callback function with the price update data
      callback({
        token_id: jsonData["mint"],
        price: tokenPrice,
        marketCapSol,
        vitualToken,
        virtualSol,
      });
    });
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
