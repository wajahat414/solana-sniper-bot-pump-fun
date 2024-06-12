export class Asset {
  constructor(
    public tokenId: string,
    public name: string,
    public amount: number,
    public purchasePrice: number,
    public currentPrice?: number
  ) {}
}
