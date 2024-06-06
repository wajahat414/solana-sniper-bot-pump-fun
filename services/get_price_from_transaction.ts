import axios from 'axios';

interface RawTokenAmount {
  tokenAmount: string;
  decimals: number;
}

interface TokenBalanceChange {
  userAccount: string;
  tokenAccount: string;
  rawTokenAmount: RawTokenAmount;
  mint: string;
}

interface AccountData {
  account: string;
  nativeBalanceChange: number;
  tokenBalanceChanges: TokenBalanceChange[];
}

interface TokenTransfer {
  fromTokenAccount: string;
  toTokenAccount: string;
  fromUserAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  mint: string;
  tokenStandard: string;
}

interface Transaction {
  description: string;
  type: string;
  source: string;
  fee: number;
  feePayer: string;
  signature: string;
  slot: number;
  timestamp: number;
  tokenTransfers: TokenTransfer[];
  nativeTransfers: any[];
  accountData: AccountData[];
  transactionError: any;
  instructions: any[];
  events: any;
}


async function get_price_from_transaction(mint: String ) : Promise<number> {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.helius.xyz/v0/addresses/${mint}/transactions?api-key=ee3680cf-196e-475b-8f62-812d6b540435&limit=1`,
        headers: {}
      };

    let rate =-1;
   await axios.request(config)
.then((response) => {
  const jsonData: Transaction[] = response.data;
  console.log(jsonData);

  // Extract native balance changes
  const nativeBalanceChanges = jsonData.flatMap(transaction =>
    transaction.accountData.map(account => ({
      account: account.account,
      nativeBalanceChange: account.nativeBalanceChange,
    }))
  );

  // Extract token transfers
  const tokenTransfers = jsonData.flatMap(transaction =>
    transaction.tokenTransfers.map((transfer: { fromTokenAccount: any; toTokenAccount: any; fromUserAccount: any; toUserAccount: any; tokenAmount: any; mint: any; }) => ({
      fromTokenAccount: transfer.fromTokenAccount,
      toTokenAccount: transfer.toTokenAccount,
      fromUserAccount: transfer.fromUserAccount,
      toUserAccount: transfer.toUserAccount,
      tokenAmount: transfer.tokenAmount,
      mint: transfer.mint,
    }))
  );

  console.log("Native Balance Changes:", nativeBalanceChanges);
  console.log("Token Transfers:", tokenTransfers);

  // Calculate rate (price per token in SOL)
  const nativeBalanceChangeLamports = jsonData[0].accountData.find(account =>
    account.nativeBalanceChange < 0
  )?.nativeBalanceChange;

  const tokenAmountTransferred = jsonData[0].tokenTransfers[0].tokenAmount;

  if (nativeBalanceChangeLamports && tokenAmountTransferred) {
    const nativeBalanceChangeSol = nativeBalanceChangeLamports / 1_000_000_000;
    const rate_up = nativeBalanceChangeSol / tokenAmountTransferred;
    console.log(`tokenAmountTransferred: ${tokenAmountTransferred}, nativeBalanceChangeSol: ${nativeBalanceChangeSol}`)
    console.log("Rate (SOL per token):", rate_up);
    rate = rate_up;

  } else {
    console.log("Required data for rate calculation is missing");
  }
  return rate;
})
.catch((error) => {
  console.log(error);
  return rate;
});
return rate;
}

export {
  get_price_from_transaction

}
