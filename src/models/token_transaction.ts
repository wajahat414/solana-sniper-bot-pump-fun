import { Asset } from "./asset";

export class TokenTransaction {
  constructor(
    public transactionId: string,
    public asset: Asset,
    public type: "buy" | "sell",
    public amount: number,
    public price: number,
    public timestamp: Date = new Date()
  ) {}
}
