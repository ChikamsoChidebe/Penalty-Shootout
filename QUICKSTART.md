# ▶️ Quick Start Guide - Penalty Shootout Duel

Get up and running with the Penalty Shootout Duel in under 5 minutes!

## ✓ Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **MetaMask** or compatible Web3 wallet
- **Somnia Testnet ETH** (get from [faucet](https://faucet.somnia.network))

## ⚙️ One-Command Setup

```bash
# Clone, install, and setup everything
git clone <your-repo-url> penalty-shootout-duel
cd penalty-shootout-duel
make install
cp .env.sample .env
```

## ⚙️ Environment Configuration

Edit `.env` with your settings:

```bash
# Required for deployment
SOMNIA_RPC_URL=https://rpc.somnia.network
PRIVATE_KEY=your_private_key_without_0x_prefix

# Optional: For contract verification
SOMNIA_API_KEY=your_somnia_explorer_api_key

# Frontend will be auto-configured after deployment
```

## ▶️ Deploy & Run

### Option 1: Full Deployment (Recommended)
```bash
# Deploy contracts to Somnia Testnet
make deploy-somnia

# Verify contracts (optional but recommended)
make verify-somnia

# Start frontend
make dev
```

### Option 2: Local Development
```bash
# Start local blockchain
make node

# Deploy to local network (in another terminal)
make deploy-local

# Start frontend
make dev
```

## ▶️ Start Playing

1. **Open** http://localhost:3000
2. **Connect** your wallet (MetaMask)
3. **Switch** to Somnia Testnet (Chain ID: 50312)
4. **Get** testnet ETH from [faucet](https://faucet.somnia.network)
5. **Create** or join a penalty shootout match!

## ⚡ Run Tests

```bash
# Run all tests
make test

# Run specific test types
make test-unit      # Unit tests only
make test-fuzz      # Fuzz testing
make test-gas       # Gas analysis
make test-coverage  # Coverage report
```

## 📖 Learn More

- **Tutorial:** Click "How to Play" in the app
- **Demo Script:** See `DEMO_SCRIPT.md` for 120-second walkthrough
- **Architecture:** Check `PROJECT_STRUCTURE.md` for detailed overview
- **Security:** Review `SECURITY.md` for security analysis

## ⚠️ Troubleshooting

### Common Issues

**❌ "Network not supported"**
```bash
# Make sure you're on Somnia Testnet
Chain ID: 50312
RPC: https://rpc.somnia.network
```

**❌ "Insufficient funds"**
```bash
# Get testnet ETH from faucet
curl -X POST https://faucet.somnia.network/api/faucet \
  -H "Content-Type: application/json" \
  -d '{"address":"YOUR_ADDRESS"}'
```

**❌ "Contract not deployed"**
```bash
# Redeploy contracts
make clean
make deploy-somnia
```

**❌ "Transaction failed"**
```bash
# Check gas settings in .env
GAS_LIMIT=30000000
GAS_PRICE=1000000000
```

### Getting Help

1. **Check logs:** Browser console and terminal output
2. **Verify setup:** Run `make info` to check configuration
3. **Reset environment:** Run `make clean && make install`
4. **Check network:** Ensure Somnia Testnet is accessible

## 📋 Quick Commands Reference

```bash
# Development
make dev              # Start development server
make build            # Build for production
make test             # Run all tests
make lint             # Run linting

# Deployment
make deploy-local     # Deploy to local network
make deploy-somnia    # Deploy to Somnia Testnet
make verify-somnia    # Verify contracts

# Utilities
make clean            # Clean build artifacts
make format           # Format code
make help             # Show all commands
```

## 🎥 Demo Mode

Want to show off the project? Use demo mode:

```bash
# Setup complete demo environment
make demo-setup

# Reset demo environment
make demo-reset
```

This will:
- Install all dependencies
- Deploy contracts locally
- Start the frontend
- Provide demo wallets with funds

## 🌍 Network Information

### Somnia Testnet
- **Chain ID:** 50312
- **RPC URL:** https://rpc.somnia.network
- **Explorer:** https://shannon-explorer.somnia.network
- **Faucet:** Check https://quest.somnia.network for testnet ETH

### Add to MetaMask
```json
{
  "chainId": "0xC468",
  "chainName": "Somnia Testnet",
  "rpcUrls": ["https://rpc.somnia.network"],
  "nativeCurrency": {
    "name": "Somnia ETH",
    "symbol": "ETH",
    "decimals": 18
  },
  "blockExplorerUrls": ["https://shannon-explorer.somnia.network"]
}
```

## 📱 Mobile Testing

The app is mobile-first! Test on mobile:

1. **Start dev server:** `make dev`
2. **Get local IP:** `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. **Access on mobile:** `http://YOUR_IP:3000`
4. **Use mobile wallet:** WalletConnect or mobile MetaMask

## ⚙️ CI/CD Pipeline

For automated deployment:

```bash
# Run CI tests
make ci-test

# Deploy with CI
make ci-deploy
```

## 📈 Monitoring

After deployment, monitor your contracts:

- **Explorer:** https://explorer.somnia.network/address/YOUR_CONTRACT
- **Events:** Filter by contract address
- **Gas usage:** Check transaction costs
- **Error logs:** Monitor for failed transactions

## ✅ You're Ready!

That's it! You now have a fully functional, on-chain penalty shootout game running on Somnia Testnet. 

**Next steps:**
- Invite friends to play
- Customize the UI
- Add new features
- Deploy to mainnet (when ready)

---

**Need help?** Check the full documentation or open an issue on GitHub.

**Happy gaming!** ⚽