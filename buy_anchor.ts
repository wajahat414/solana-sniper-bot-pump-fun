import { Program, AnchorProvider, web3, BN, Wallet } from '@project-serum/anchor';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, Connection, Transaction, SystemProgram } from "@solana/web3.js";
import fs from "fs";
import {
    TOKEN_PROGRAM_ID,
    getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';

async function main() {

    await buy_token_from_pump();
}

async function buy_token_from_pump() {

  const associatedUserAccount =   await getOrCreateAssociatedTokenAccount(
        connection,
        wallet.payer,
        mint,
        wallet.publicKey,
        false,
        'confirmed',
    );
    console.log('associatedUser', associatedUserAccount.address.toBase58());

   const  associatedUser = new PublicKey(associatedUserAccount.address.toBase58());
   
    
    const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: 'confirmed',
    });
    
    const program = new Program(idl, programId, provider);
    
    const tx = new Transaction().add(
        program.instruction.buy(amount, maxSolCost, {
            accounts: {
                global,
                feeRecipient,
                mint,
                bondingCurve,
                associatedBondingCurve,
                associatedUser,
                user,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: web3.SYSVAR_RENT_PUBKEY,
                eventAuthority,
                program:programId,
            },
        })
    );

    // Send transaction
    try {
        const blockHash = (await connection.getLatestBlockhash('finalized')).blockhash;
        // const signature = await provider.sendAndConfirm(tx);
        tx.feePayer = wallet.publicKey;
        tx.recentBlockhash = blockHash;
        const serializedTransaction = tx.serialize({ requireAllSignatures: false, verifySignatures: true });
        const transactionBase64 = serializedTransaction.toString('base64');
        const recoveredTransaction = Transaction.from(Buffer.from(transactionBase64, 'base64'));
        recoveredTransaction.partialSign(wallet.payer);
        const txnSignature = await connection.sendRawTransaction(
            recoveredTransaction.serialize(),
          );


        console.log('Transaction signature', txnSignature);
    } catch (err) {
        console.error('Transaction failed', err);
    }
}


main();




