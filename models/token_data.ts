interface ITokenData {
  signature: string;
  mint: string;
  traderPublicKey: string;
  txType: string;
  initialBuy: number;
  bondingCurveKey: string;
  vTokensInBondingCurve: number;
  vSolInBondingCurve: number;
  marketCapSol: number;
}

export class TokenData implements ITokenData {
  signature: string;
  mint: string;
  traderPublicKey: string;
  txType: string;
  initialBuy: number;
  bondingCurveKey: string;
  vTokensInBondingCurve: number;
  vSolInBondingCurve: number;
  marketCapSol: number;

  constructor(data: ITokenData) {
    this.signature = data.signature;
    this.mint = data.mint;
    this.traderPublicKey = data.traderPublicKey;
    this.txType = data.txType;
    this.initialBuy = data.initialBuy;
    this.bondingCurveKey = data.bondingCurveKey;
    this.vTokensInBondingCurve = data.vTokensInBondingCurve;
    this.vSolInBondingCurve = data.vSolInBondingCurve;
    this.marketCapSol = data.marketCapSol;
  }

  static fromJSON(json: string): TokenData {
    const data = JSON.parse(json);
    return new TokenData(data);
  }
}
