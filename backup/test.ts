import {
    // enums
    Address,
    TransactionType,
  
    // lib
    Helius,
  } from "helius-sdk";
  
  const helius = new Helius("YOUR_API_KEY");
  
  helius.createWebhook({
    accountAddresses: [Address.MAGIC_EDEN_V2],
    transactionTypes: [TransactionType.TOKEN_MINT],
    webhookURL: "my-webhook-handler.com/handle",
  });