const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Penalty Shootout Duel deployment...\n");

  // Get network info
  const network = await ethers.provider.getNetwork();
  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Deployment Configuration:");
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH\n`);

  // Check minimum balance
  const balance = await deployer.provider.getBalance(deployer.address);
  const minBalance = ethers.parseEther("0.0001"); // Minimum 0.0001 ETH
  
  if (balance < minBalance) {
    throw new Error(`❌ Insufficient balance. Need at least 0.0001 ETH, have ${ethers.formatEther(balance)} ETH`);
  }

  try {
    // Deploy Shootout contract
    console.log("📦 Deploying Shootout contract...");
    const ShootoutFactory = await ethers.getContractFactory("Shootout");
    
    const shootout = await ShootoutFactory.deploy();

    console.log("⏳ Waiting for deployment confirmation...");
    const deploymentReceipt = await shootout.deploymentTransaction().wait();
    
    if (!deploymentReceipt) {
      throw new Error("❌ Deployment transaction failed");
    }

    const contractAddress = await shootout.getAddress();
    
    console.log("✅ Shootout deployed successfully!");
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🧾 Transaction Hash: ${deploymentReceipt.hash}`);
    console.log(`⛽ Gas Used: ${deploymentReceipt.gasUsed.toString()}`);
    console.log(`🏗️  Block Number: ${deploymentReceipt.blockNumber}\n`);

    // Verify contract is working
    console.log("🔍 Verifying contract deployment...");
    const matchCounter = await shootout.matchCounter();
    const feeBps = await shootout.feeBps();
    const owner = await shootout.owner();
    
    console.log(`Match Counter: ${matchCounter}`);
    console.log(`Protocol Fee: ${feeBps} bps (${Number(feeBps) / 100}%)`);
    console.log(`Owner: ${owner}\n`);

    // Save deployment info
    const deploymentResult = {
      contractName: "Shootout",
      address: contractAddress,
      transactionHash: deploymentReceipt.hash,
      blockNumber: deploymentReceipt.blockNumber,
      gasUsed: deploymentReceipt.gasUsed.toString(),
      deployedAt: new Date().toISOString(),
      network: network.name,
      chainId: Number(network.chainId),
    };

    // Save to addresses.json
    const addressesFile = path.join(process.cwd(), "addresses.json");
    let addresses = {};
    
    if (fs.existsSync(addressesFile)) {
      addresses = JSON.parse(fs.readFileSync(addressesFile, "utf8"));
    }
    
    addresses[deploymentResult.chainId] = {
      Shootout: deploymentResult.address,
      deployedAt: deploymentResult.deployedAt,
      blockNumber: deploymentResult.blockNumber,
    };
    
    fs.writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));
    console.log(`💾 Addresses saved to ${addressesFile}`);

    // Update .env file
    const envFile = path.join(process.cwd(), ".env");
    if (fs.existsSync(envFile)) {
      let envContent = fs.readFileSync(envFile, "utf8");
      envContent = envContent.replace(
        /NEXT_PUBLIC_SHOOTOUT_ADDRESS=.*/,
        `NEXT_PUBLIC_SHOOTOUT_ADDRESS=${contractAddress}`
      );
      fs.writeFileSync(envFile, envContent);
      console.log("💾 Updated .env with contract address");
    }

    console.log("🎉 Deployment completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("1. Run 'npm run dev' to start the frontend");
    console.log("2. Connect MetaMask to Somnia Testnet");
    console.log("3. Get testnet ETH from https://quest.somnia.network");
    console.log("4. Start playing penalty shootouts!\n");

    return deploymentResult;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };