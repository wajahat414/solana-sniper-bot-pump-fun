import { EventType } from "../events/app_event_manager";
import { Asset } from "../models/asset";
import { Portfolio } from "../models/portfolio";
import { TokenTransaction } from "../models/token_transaction";
import { MarketService } from "../services/market_services";

export class PortfolioController {
  private marketService: MarketService;
  private userPortfolio: Portfolio;

  constructor(userPortfolio: Portfolio, marketService: MarketService) {
    this.userPortfolio = userPortfolio;
    this.marketService = marketService;
    PubSub.subscribe(EventType.PRICE_UPDATE, (data: any) => {
      this.userPortfolio.updateAssetPrice(data["token_id"], data["price"]);
      this.marketService.checkSellConditions(this.userPortfolio);
    });

    PubSub.subscribe(EventType.SELL_CONDITION_MET, (data: any) => {
      this.sellAsset(data["token_id"], data["amount"], data["price"]);
    });
  }

  //   buyAsset(tokenId: string, amount: number, currentPrice: number) {
  //     const asset = new Asset(tokenId, "Solana Token", amount, currentPrice);
  //     this.userPortfolio.addAsset(asset);
  //     const transaction = new TokenTransaction(
  //       "tx123",
  //       asset,
  //       "buy",
  //       amount,
  //       currentPrice
  //     );
  //     console.log("Bought asset:", transaction);
  //   }

  sellAsset(tokenId: string, amount: number, currentPrice: number) {
    const asset = this.userPortfolio.assets[tokenId];
    if (asset) {
      const transaction = new TokenTransaction(
        "tx124",
        asset,
        "sell",
        amount,
        currentPrice
      );
      console.log("Sold asset:", transaction);
      // Implement actual sell logic here
    }
  }
}
