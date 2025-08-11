# 🚀 Local Development Setup

## Quick Start (3 steps)

### 1. Start Local Blockchain
```bash
# Terminal 1 - Keep this running
npx hardhat node
```

### 2. Deploy Contract
```bash
# Terminal 2 - Run once
npm run deploy:localhost
```

### 3. Update Contract Address
Copy the deployed contract address and update your `.env` file:
```bash
NEXT_PUBLIC_SHOOTOUT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 4. Start Frontend
```bash
# Terminal 3
npm run dev
```

## Testing the Game

1. **Connect MetaMask to Localhost**
   - Network: `Localhost 8545`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

2. **Import Test Account**
   - Use one of the private keys from Hardhat node output
   - Each account has 10,000 ETH for testing

3. **Create Match**
   - Go to http://localhost:3000
   - Connect wallet
   - Create match with 0.01 ETH stake

4. **Join Match (Different Browser/Account)**
   - Open incognito/different browser
   - Connect with different test account
   - Join the available match

5. **Play Game**
   - Both players choose directions (L/C/R) for 3 rounds
   - Best of 3 wins the pot

## Troubleshooting

### Port 8545 Already in Use
```bash
# Find process using port
netstat -ano | findstr :8545

# Kill process (replace PID with actual number)
taskkill /PID 12524 /F

# Then restart Hardhat node
npx hardhat node
```

### Contract Not Found
- Make sure you deployed to localhost: `npm run deploy:localhost`
- Update `.env` with correct contract address
- Restart frontend: `npm run dev`

### MetaMask Issues
- Reset MetaMask account (Settings > Advanced > Reset Account)
- Make sure you're on localhost network (Chain ID 31337)
- Import fresh test account from Hardhat

## Demo Video Setup

1. **Browser 1 (Creator)**
   - Connect with Account #0
   - Create match with 0.1 ETH

2. **Browser 2 (Joiner)**  
   - Connect with Account #1
   - Join the match

3. **Play Game**
   - Both commit choices
   - Show results
   - Winner claims prize

## Network Configuration

Current setup uses **localhost** for development:
- Chain ID: 31337
- RPC: http://localhost:8545
- No gas fees, instant transactions
- Perfect for demo and testing

To switch to Somnia Testnet later, update `.env`:
```bash
NEXT_PUBLIC_CHAIN_ID=50312
NEXT_PUBLIC_RPC_URL=https://dream-rpc.somnia.network
```