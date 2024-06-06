import {
  Program,
  AnchorProvider,
  web3,
  BN,
  Wallet,
} from "@project-serum/anchor";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Connection,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Account,
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import {
  idl,
  global,
  feeRecipient,
  eventAuthority,
  connectionQuickNode,
  connectionHelius,
  wallet,
  programId,
} from "../constants";
import { Token } from "../models/token";
import { Trade } from "../models/trade";
import { AppCodes } from "../models/app_resp_codes";

const max_tries_for_associated_token_account = 3;
const max_tries_for_trade = 3;

class SolanaCommunicator {
  async buy_trade_from_pump(
    trade: Trade,
    max_tries = max_tries_for_trade
  ): Promise<any> {
    if (max_tries == 0) {
      return AppCodes.FAILED_BUY_TRADE;
    }

    const max_sol_to_invest = trade.sol_amount / LAMPORTS_PER_SOL;

    try {
      const transaction_signature = await this.buy_token_from_pump(
        max_sol_to_invest,
        trade.token_amount,
        trade.mint,
        new PublicKey(trade.assocaited_token_account)
      );
      return transaction_signature;
    } catch (e) {
      console.error("Error buying tokens:", e);
      console.log(`retrying again...`);

      this.buy_trade_from_pump(trade, max_tries - 1);
    }
  }

  provider: AnchorProvider;
  program: Program;

  constructor() {
    this.provider = new AnchorProvider(connectionQuickNode, wallet, {
      preflightCommitment: "confirmed",
    });

    this.program = new Program(idl, programId, this.provider);
  }

  async buy_token_from_pump(
    amount: BN,
    maxSolCost: BN,
    token: Token,
    associatedUserTokenAccount: PublicKey
  ) {
    const tx = new Transaction().add(
      this.program.instruction.buy(amount, maxSolCost, {
        accounts: {
          global: global,
          feeRecipient: feeRecipient,
          mint: token.mint,
          bondingCurve: token.bondingCurve,
          associatedBondingCurve: token.associatedbBondingCurve,
          associatedUser: associatedUserTokenAccount,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: web3.SYSVAR_RENT_PUBKEY,
          eventAuthority,
          program: programId,
        },
      })
    );

    // Send transaction
    try {
      const promises = [];
      const blockHash = (
        await connectionQuickNode.getLatestBlockhash("finalized")
      ).blockhash;
      // const signature = await provider.sendAndConfirm(tx);
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = blockHash;
      const serializedTransaction = tx.serialize({
        requireAllSignatures: false,
        verifySignatures: true,
      });
      const transactionBase64 = serializedTransaction.toString("base64");
      const recoveredTransaction = Transaction.from(
        Buffer.from(transactionBase64, "base64")
      );
      recoveredTransaction.partialSign(wallet.payer);
      const txnSignature = await connectionQuickNode.sendRawTransaction(
        recoveredTransaction.serialize()
      );
      return txnSignature;

      console.log("Transaction signature", txnSignature);
    } catch (err) {
      console.error("Transaction failed", err);
    }
  }

  async getOrCreateAssociatedTokenAccountX(
    mint: PublicKey,
    owner: PublicKey,
    max_tries = max_tries_for_associated_token_account
  ): Promise<any> {
    let associatedTokenAccountStr = "";

    const promises = [
      this.getOrCreateAssociatedTokenAccountWithMetadata(
        connectionQuickNode,
        "QuickNode",
        mint,
        owner
      ),
      this.getOrCreateAssociatedTokenAccountWithMetadata(
        connectionHelius,
        "Helius",
        mint,
        owner
      ),
    ];
    if (max_tries == 0) {
      return AppCodes.FAILED_GET_ASSOCIATED_TOKEN_ACCOUNT;
    }

    try {
      const result = await Promise.race(promises);
      console.log(
        "Associated token account from",
        result.connectionName,
        ":",
        result.address
      );

      const associatedTokenAccount = result.address;
      associatedTokenAccountStr = associatedTokenAccount;
      return associatedTokenAccountStr;
    } catch (err) {
      console.error(`Retrying... Try Limit${max_tries}`, err);
      this.getOrCreateAssociatedTokenAccountX(mint, owner, max_tries - 1);
    }

    return associatedTokenAccountStr;
  }

  async getOrCreateAssociatedTokenAccountWithMetadata(
    connection: Connection,
    connectionName: string,
    mint: PublicKey,
    owner: PublicKey
  ): Promise<{ connectionName: string; address: string }> {
    const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet.payer,
      mint,
      owner,
      false,
      "confirmed"
    );
    return {
      connectionName,
      address: associatedTokenAccount.address.toString(),
    };
  }

  async sell_token_from_pump(
    amount: BN,
    minSolOutput: BN,
    token: Token,
    associatedUserTokenAccount: PublicKey
  ) {
    const tx = new Transaction().add(
      this.program.instruction.sell(amount, minSolOutput, {
        accounts: {
          global: global,
          feeRecipient: feeRecipient,
          mint: token.mint,
          bondingCurve: token.bondingCurve,
          associatedBondingCurve: token.associatedbBondingCurve,
          associatedUser: associatedUserTokenAccount,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          eventAuthority,
          program: programId,
        },
      })
    );

    // Send transaction
    try {
      const blockHash = (
        await connectionQuickNode.getLatestBlockhash("finalized")
      ).blockhash;
      // const signature = await provider.sendAndConfirm(tx);
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = blockHash;
      const serializedTransaction = tx.serialize({
        requireAllSignatures: false,
        verifySignatures: true,
      });
      const transactionBase64 = serializedTransaction.toString("base64");
      const recoveredTransaction = Transaction.from(
        Buffer.from(transactionBase64, "base64")
      );
      recoveredTransaction.partialSign(wallet.payer);
      const txnSignature = await connectionQuickNode.sendRawTransaction(
        recoveredTransaction.serialize()
      );

      console.log("Transaction signature", txnSignature);
    } catch (err) {
      console.error("Transaction failed", err);
    }
  }
}

export { SolanaCommunicator };
