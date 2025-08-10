# 🎬 Demo Setup Guide

## Quick Demo Account Setup

### 1. Generate Demo Accounts
Run this in your browser console or Node.js:

```javascript
// Generate 3 demo accounts
for (let i = 1; i <= 3; i++) {
  const wallet = crypto.getRandomValues(new Uint8Array(32));
  const privateKey = Array.from(wallet, byte => byte.toString(16).padStart(2, '0')).join('');
  console.log(`Demo Account ${i}:`);
  console.log(`Private Key: ${privateKey}`);
  console.log('---');
}
```

### 2. Get Testnet ETH
- Visit: https://quest.somnia.network
- Connect each demo account
- Request testnet ETH (usually 1-5 ETH per request)

### 3. Add to MetaMask
1. Open MetaMask
2. Click "Import Account"
3. Paste private key
4. Add Somnia Testnet:
   - Network Name: Somnia Testnet
   - RPC URL: https://dream-rpc.somnia.network
   - Chain ID: 50312
   - Currency Symbol: ETH
   - Block Explorer: https://shannon-explorer.somnia.network

### 4. Demo Script (2 minutes)

**[0-30s] Setup**
- "Let me show you this penalty shootout game on Somnia"
- Connect Account 1 with 1 ETH balance
- Show the interface

**[30-60s] Create Match**
- Click "Create Match"
- Set 0.1 ETH wager
- Submit transaction
- Show match in "Available Matches"

**[60-90s] Join Match**
- Switch to Account 2
- Join the match with 0.1 ETH
- Show both players committed

**[90-120s] Play & Win**
- Both accounts commit choices (L/C/R for 3 rounds)
- Reveal phase shows results
- Winner gets ~0.199 ETH (minus 1% fee)
- Show transaction on explorer

### 5. Troubleshooting

**MetaMask Connection Issues:**
- Refresh page
- Disconnect/reconnect wallet
- Clear browser cache
- Try different browser

**Network Issues:**
- Ensure Somnia Testnet is added
- Check RPC URL: https://dream-rpc.somnia.network
- Verify Chain ID: 50312

**No Testnet ETH:**
- Visit faucet: https://quest.somnia.network
- Try different social accounts
- Ask in Somnia Discord for help

### 6. Demo Tips

- Keep transactions small (0.01-0.1 ETH)
- Have 2-3 accounts ready
- Test everything before recording
- Show explorer links for transparency
- Emphasize "fully on-chain" and "no backend"