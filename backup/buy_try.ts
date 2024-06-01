import * as anchor from '@project-serum/anchor';
import { PublicKey, Connection, SystemProgram, clusterApiUrl,Keypair } from '@solana/web3.js';
import fs from "fs";
// Constants (replace these with actual values)
const keypairPath = './sol_wallet/mainWallet.json';

const walletSec = loadKeypairFromFile(keypairPath);
const wallet = new anchor.Wallet(walletSec);

const GLOBAL_PUBLIC_KEY = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
const FEE_RECIPIENT_PUBLIC_KEY = new PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM");
const MINT_PUBLIC_KEY = new PublicKey("2aqhUvR8sU2oFgkEdUKWKkepwtNrTGdZNsXU1Zmzo1b2");
const BONDING_CURVE_PUBLIC_KEY = new PublicKey("376fD5sFqBNf3eKnuUe52ZSBcqgtydp6r4icbfMgiRpK");
const ASSOCIATED_BONDING_CURVE_PUBLIC_KEY = new PublicKey("BErxBnz5bFYrVCEQzvMR6rBL4nov3PDEKq3GXVkmonjr");
const ASSOCIATED_USER_PUBLIC_KEY = new PublicKey("DhYbonR9LSbjt6cs7u441x1bp3M7BX4SXBUsU7WVNjj6");
const USER_PUBLIC_KEY = new PublicKey("DhYbonR9LSbjt6cs7u441x1bp3M7BX4SXBUsU7WVNjj6");
const EVENT_AUTHORITY_PUBLIC_KEY = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1");
const PUMP_PROGRAM_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");

// Establish connection
const quickNodeRpc = "https://floral-responsive-aura.solana-mainnet.quiknode.pro/27668ddeedee2cab8681e0847d72968cb6d495da/";

const connection = new Connection(quickNodeRpc, 'confirmed');

// Load wallet keypair

const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());

async function loadPumpProgramFromJson(): Promise<anchor.Program | null> {
    try {
        const idl = JSON.parse(fs.readFileSync('idlpump.json', 'utf8'));
        return new anchor.Program(idl, PUMP_PROGRAM_ID, provider);
    } catch (error) {
        console.error("Error loading IDL from JSON:", error);
        return null;
    }
}
async function buyTokens(amount: number, maxSolCost: number) {
  const program = await loadPumpProgramFromJson();
  if (!program) {
    console.error("Pump program is not available");
    return;
  }

  try {
    // Build the transaction
    const txId = await program.methods.buy(
      new anchor.BN(amount),
      new anchor.BN(maxSolCost)
    ).accounts({
      global: GLOBAL_PUBLIC_KEY,
      feeRecipient: FEE_RECIPIENT_PUBLIC_KEY,
      mint: MINT_PUBLIC_KEY,
      bondingCurve: BONDING_CURVE_PUBLIC_KEY,
      associatedBondingCurve: ASSOCIATED_BONDING_CURVE_PUBLIC_KEY,
      associatedUser: ASSOCIATED_USER_PUBLIC_KEY,
      user: wallet.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      eventAuthority: EVENT_AUTHORITY_PUBLIC_KEY,
      program: PUMP_PROGRAM_ID,
    }).signers([wallet.payer]).rpc();

    console.log("Transaction ID:", txId);
  } catch (error) {
    console.error("Error buying tokens:", error);
  }
}

// Example usage
const amountToBuy = 100;  // Amount of tokens you want to buy
const maxSolCost = 1 * anchor.web3.LAMPORTS_PER_SOL;  // Maximum SOL cost you are willing to pay
buyTokens(amountToBuy, maxSolCost);



function loadKeypairFromFile(filename: string): Keypair {
    const secret = JSON.parse(fs.readFileSync(filename).toString()) as number[];
    const secretKey = Uint8Array.from(secret);
    return Keypair.fromSecretKey(secretKey);
}
