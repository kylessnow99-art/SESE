import { Connection } from '@solana/web3.js';

// Use ONLY extrnode.com - proven working
const RPC_ENDPOINTS = [
  'https://solana-mainnet.rpc.extrnode.com',
  'https://solana-mainnet.rpc.extrnode.com' // Same endpoint, retry handles failures
];

export const getConnection = () => {
  return new Connection(RPC_ENDPOINTS[0], {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000
  });
};

export const executeWithRetry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};
