import {  BN, Wallet } from '@project-serum/anchor';
import {PublicKey, Connection } from "@solana/web3.js";
import { loadKeypairFromFile,loadIdl } from './helpers/helpers';

const rpcURl = "https://lb.drpc.org/ogrpc?network=solana&dkey=AieoLqQV-UyrpLOR2Ir6a0BVT2QzHZgR764stigucSjy";
const rpcurlHelius = "https://mainnet.helius.rpc.com/?api-key=ee3680cf-196e-475b-8f62-812d6b540435";

const quickNodeRpc = "https://floral-responsive-aura.solana-mainnet.quiknode.pro/27668ddeedee2cab8681e0847d72968cb6d495da/";

const connection = new Connection(quickNodeRpc, 'confirmed');

const keypairPath = './resources/wallets/mainWallet.json';

const walletSec = loadKeypairFromFile(keypairPath);
const wallet = new Wallet(walletSec);

const idl = loadIdl();

const programId = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');

// Accounts required for the buy instruction
const global = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf"); // PublicKey of the global account
const feeRecipient = new PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM"); // PublicKey of the fee recipient account
const eventAuthority = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1");
// PublicKey of the associated user account
const user = wallet.publicKey;

const amount = new BN(35528); // Amount to buy
const maxSolCost = new BN(1000000); // Maximum SOL cost


export {connection,wallet}