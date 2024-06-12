import { Keypair } from "@solana/web3.js";

import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

function loadKeypairFromFile(filename: string): Keypair {
  const secret = JSON.parse(fs.readFileSync(filename).toString()) as number[];
  const secretKey = Uint8Array.from(secret);
  return Keypair.fromSecretKey(secretKey);
}

function loadIdl() {
  const idl = JSON.parse(fs.readFileSync("./res/pumpidl/idlpump.json", "utf8"));
  return idl;
}

export { loadKeypairFromFile, loadIdl };

export class Helpers {
  static showAlert(title: string, message: string) {
    console.log(`${title}: ${message}`);
  }
}
