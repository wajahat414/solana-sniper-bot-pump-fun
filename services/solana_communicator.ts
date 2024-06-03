import { Program, AnchorProvider, web3, BN, Wallet } from '@project-serum/anchor';
import {  PublicKey,Transaction, SystemProgram } from "@solana/web3.js";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    Account,
    TOKEN_PROGRAM_ID,
    getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import { idl,global,feeRecipient,eventAuthority,connection, wallet, programId } from '../constants';
import { Token } from '../models/token';


class SolanaCommunicator {


    provider: AnchorProvider;
    program: Program;



    constructor() {


        this.provider =  new AnchorProvider(connection, wallet, {
            preflightCommitment: 'confirmed',
        });
        
        this.program = new Program(idl, programId, this.provider);
    }





    async  buy_token_from_pump(amount: BN, maxSolCost: BN,token:Token,associatedUserTokenAccount: PublicKey) {
         

  
    
          const tx = new Transaction().add(
              this.program.instruction.buy(amount, maxSolCost,{
                  accounts: {
                      global: global,
                      feeRecipient: feeRecipient,
                      mint:token.mint,
                      bondingCurve: token.bondingCurve,
                      associatedBondingCurve: token.associatedbBondingCurve,
                      associatedUser:associatedUserTokenAccount,
                      user:wallet.publicKey,
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



      async getOrCreateAssociatedTokenAccount(mint: PublicKey, owner: PublicKey): Promise<Account>{
        const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          wallet.payer,
          mint,
          owner,
        );
        return associatedTokenAccount;
      }

      async sell_token_from_pump(amount: BN, minSolOutput: BN,token:Token,associatedUserTokenAccount: PublicKey){
        const tx = new Transaction().add(
            this.program.instruction.sell(amount, minSolOutput,{
                accounts: {
                    global: global,
                    feeRecipient: feeRecipient,
                    mint:token.mint,
                    bondingCurve: token.bondingCurve,
                    associatedBondingCurve: token.associatedbBondingCurve,
                    associatedUser:associatedUserTokenAccount,
                    user:wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
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
      
      
}


export {SolanaCommunicator}

