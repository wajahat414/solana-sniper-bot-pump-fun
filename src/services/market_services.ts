import { EventType } from "../events/app_event_manager";
import logger from "../helpers/app_logger";
import { Portfolio } from "../models/portfolio";

import { PumpPortalCommunicator } from "../network/pump_portal_communicator";

import PubSub from "pubsub-js";
export class MarketService {
  private _marketData: { [tokenId: string]: number } = {};
  private activeTokens: Set<string> = new Set();
  tokenSubscriptionList = [];

  get marketData(): { [tokenId: string]: number } {
    return this._marketData;
  }

  // Setter for marketData
  set marketData(data: { [tokenId: string]: number }) {
    this._marketData = data;
  }
  addTokenForPriceUpdate(tokenId: string): void {
    this.activeTokens.add(tokenId);
    PumpPortalCommunicator.getInstance().subscribeTokenTrade(tokenId);
  }

  // Method to remove a token from marketData
  removeTokenFromPriceUpdate(tokenId: string): void {
    this.activeTokens.delete(tokenId);
    PumpPortalCommunicator.getInstance().unsubscribeTokenTrade(tokenId);
  }

  constructor() {
    this.fetchCurrentPrices();
  }

  async fetchCurrentPrices() {
    this.subscribeAllTokenPrices();
    try {
      PumpPortalCommunicator.getInstance().listenPriceUpdateFromNewTrade(
        (data) => {
          console.log("Price update received:", data);
          const token_id = data["token_id"];
          const price = data["price"];
          this._marketData[token_id] = price;
          PubSub.publish(EventType.PRICE_UPDATE, data);
        }
      );
    } catch (error) {
      logger.error("Error fetching market prices:", error);
    }
  }

  checkSellConditions(userPortfolio: Portfolio) {
    for (const tokenId in userPortfolio.assets) {
      const asset = userPortfolio.assets[tokenId];
      if (
        asset.currentPrice &&
        asset.currentPrice > asset.purchasePrice * 1.2
      ) {
        // Example condition
        PubSub.publish(EventType.SELL_CONDITION_MET, asset);
      }
    }
  }

  subscribeAllTokenPrices() {
    this.activeTokens.forEach((tokenId) => {
      PumpPortalCommunicator.getInstance().subscribeTokenTrade(tokenId);
    });
  }

  unsubscribeAllTokenPrices() {
    this.activeTokens.forEach((tokenId) => {
      PumpPortalCommunicator.getInstance().unsubscribeTokenTrade(tokenId);
    });
  }
}

async function testMarketService() {
  const marketService = new MarketService();
  marketService.addTokenForPriceUpdate(
    "FBskidiY8rBPAdS4EhcVxSJ8yymPGQZzSWbmMPJHpump"
  );
}
