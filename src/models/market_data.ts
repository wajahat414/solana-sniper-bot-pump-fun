export class MarketData {
  constructor(
    public tokenId: string,
    public priceHistory: number[] = [],
    public currentPrice?: number
  ) {}
}
