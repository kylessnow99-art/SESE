export const validateSolanaBalance = (balance) => {
  const MIN_SOL = 0.003 * 1e9;
  return balance >= MIN_SOL;
};

export const validateEthereumBalance = (balance) => {
  const MIN_ETH = ethers.parseEther('0.001');
  return balance >= MIN_ETH;
};

export const formatErrorMessage = (error) => {
  if (error.message.includes('User rejected')) {
    return 'Transaction cancelled';
  }
  if (error.message.includes('insufficient balance')) {
    return 'Insufficient balance for gas';
  }
  if (error.message.includes('network')) {
    return 'Network congestion. Please try again.';
  }
  return 'An error occurred. Please try again.';
};
