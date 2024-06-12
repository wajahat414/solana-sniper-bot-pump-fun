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
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
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
  helius_api_key,
} from "../../constants";
import { Token } from "../models/token";
import { Trade } from "../models/trade";
import { AppCodes } from "../models/app_resp_codes";
import { Helius, DAS } from "helius-sdk";
const max_tries = 3;
const max_tries_for_associated_token_account = max_tries;
const max_tries_for_trade = max_tries;
let assocaited_bonding_curve_max_tries = max_tries;

const helius = new Helius(helius_api_key);
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
      await new Promise((f) => setTimeout(f, 1000));
      this.getOrCreateAssociatedTokenAccountX(mint, owner, max_tries - 1);
    }

    return associatedTokenAccountStr;
  }

  async createAssoicatedTokenAccountHeliusSdk(
    mint: PublicKey,
    owner: PublicKey
  ): Promise<any> {
    const programId = TOKEN_PROGRAM_ID;
    const associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID;
    const associatedToken = getAssociatedTokenAddressSync(
      mint,
      owner,
      false,
      programId,
      associatedTokenProgramId
    );

    try {
      const transInstruction = createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedToken,
        owner,
        mint,
        programId,
        associatedTokenProgramId
      );

      const signature = await helius.rpc.sendSmartTransaction(
        [transInstruction],
        [wallet.payer]
      );
      const promises = [
        this.getAccountWrapper(
          "QuickNode",

          associatedToken.toString(),
          connectionQuickNode
        ),
        this.getAccountWrapper(
          "HELIUS",
          associatedToken.toString(),
          connectionHelius
        ),
      ];
      const [respCode, connName, account] = await Promise.all(promises);
      if (respCode == AppCodes.SUCCESS) {
        const accountx = account as Account;
        console.log(
          "Associated token account from",
          connName,
          ":",
          accountx.address.toBase58()
        );

        return new PublicKey(accountx.address.toBase58());
      }
    } catch (e) {
      console.error(
        "Error creating associated token account from helius SDK",
        e
      );
      AppCodes.FAILED_GET_ASSOCIATED_TOKEN_ACCOUNT;
    }
  }
  async getAccountWrapper(
    connectionName: String,
    address: String,
    connection: Connection
  ): Promise<any> {
    try {
      const account = await getAccount(connection, new PublicKey(address));

      return [AppCodes.SUCCESS, connectionName, account];
    } catch (e) {
      console.error(
        "Error fetching account from connection",
        connectionName,
        e
      );
      return [AppCodes.FAILED_GET_ASSOCIATED_TOKEN_ACCOUNT, "", ""];
    }
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

  async getAssocaitedBondingCurve(signature: string): Promise<any> {
    try {
      const promises = [
        connectionHelius.getParsedTransaction(signature, {
          maxSupportedTransactionVersion: 0,
        }),
      ];
      const res = await connectionQuickNode.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      const accounts = res!.transaction.message.accountKeys;

      const mint_ = accounts[1].pubkey.toString(); //corrected

      const bondingCurve = accounts[3].pubkey.toString(); //corrected
      const associatedBondingCurve = accounts[4].pubkey.toString(); //corrected
      const tokenDataFromTrxSig = {
        mint: mint_,
        bondingCurve: bondingCurve,
        associatedBondingCurve: associatedBondingCurve,
      };
      return associatedBondingCurve;
    } catch (err) {
      console.error("getting Token Data fromTransaction  signaturefailed", err);
      return AppCodes.FAILED_GETTING_TOKEN_DATA_FROM_TRANSACTION_SIGNATURE;
    }
  }
}

export { SolanaCommunicator };
