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
import logger from "../helpers/app_logger";
import { delay } from "../helpers/helpers";
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
    const max_sol_to_invest_bn = new BN(max_sol_to_invest);
    const max_token_to_invest_bn = new BN(trade.token_amount);

    try {
      const transaction_signature = await this.buy_token_from_pump(
        max_sol_to_invest_bn,
        max_token_to_invest_bn,
        trade.token,
        new PublicKey(trade.assocaited_token_account)
      );
      return transaction_signature;
    } catch (e) {
      console.error("Error buying tokens:", e);
      console.log(`retrying again...`);

      return this.buy_trade_from_pump(trade, max_tries - 1);
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
    } catch (err) {
      logger.error(`Error in buying Token from Pump`, err);
    }
  }

  async getOrCreateAssociatedTokenAccountX(
    mint: PublicKey,
    owner: PublicKey,
    max_tries = max_tries_for_associated_token_account
  ): Promise<any> {
    let associatedTokenAccountStr = "";
    const resp = await this.createAssoicatedTokenAccountHeliusSdk(mint, owner);
    if (resp != AppCodes.FAILED_GET_ASSOCIATED_TOKEN_ACCOUNT && resp) {
      logger.info(
        "success from helius sdk in creating associated token account"
      );
      return resp;
    } else {
      logger.error(
        "error creating associated token from helius sdk Trying with QuickNode"
      );

      const resp = await this.getOrCreateAssociatedTokenAccountWithMetadata(
        connectionQuickNode,
        "QuickNode",
        mint,
        owner
      );
      if (resp.address == "") {
        logger.error(
          "error creating associated token from QuickNode Trying with Helius Rpc"
        );
        const resp = await this.getOrCreateAssociatedTokenAccountWithMetadata(
          connectionHelius,
          "Helius",
          mint,
          owner
        );
        if (resp.address == "") {
          logger.error("error creating associated token from Helius Rpc");
          return AppCodes.FAILED_GET_ASSOCIATED_TOKEN_ACCOUNT;
        }
        return resp.address;
      }
      return resp.address;
    }
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
      return AppCodes.FAILED_GET_ASSOCIATED_TOKEN_ACCOUNT;
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
    try {
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
    } catch (e) {
      logger.error(
        `Error creating associated token account from ${connectionName}`,
        e
      );
      return {
        connectionName,
        address: "",
      };
    }
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

  async getAssocaitedBondingCurve(
    signature: string,
    max_tries = 3
  ): Promise<any> {
    try {
      const res = await connectionQuickNode.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      const accounts = res!.transaction.message.accountKeys;

      const associatedBondingCurve = accounts[4].pubkey.toString(); //corrected
      return associatedBondingCurve;
    } catch (err) {
      logger.error(`Retrying after 1 second getting bondingCurve `);
      await delay(1000);
      if (max_tries == 0) {
        return AppCodes.FAILED_GETTING_BONDING_CURVE;
      }
      return await this.getAssocaitedBondingCurve(signature, max_tries - 1);
    }
  }
}

export { SolanaCommunicator };
