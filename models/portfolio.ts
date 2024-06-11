import { Asset } from "./asset";

export class Portfolio {
  public assets: { [tokenId: string]: Asset } = {};

  constructor(public userId: string) {}

  addAsset(asset: Asset) {
    this.assets[asset.tokenId] = asset;
  }

  updateAssetPrice(tokenId: string, price: number) {
    if (this.assets[tokenId]) {
      this.assets[tokenId].currentPrice = price;
    }
  }
}
