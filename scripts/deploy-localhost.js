const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying to localhost...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Deploy Shootout contract
  const Shootout = await ethers.getContractFactory("Shootout");
  const shootout = await Shootout.deploy();
  
  await shootout.waitForDeployment();
  const address = await shootout.getAddress();
  
  console.log("✅ Shootout deployed to:", address);
  console.log("🔧 Update your .env file:");
  console.log(`NEXT_PUBLIC_SHOOTOUT_ADDRESS=${address}`);
  
  // Test the contract
  const matchCounter = await shootout.matchCounter();
  const feeBps = await shootout.feeBps();
  
  console.log("📊 Contract verification:");
  console.log("- Match counter:", matchCounter.toString());
  console.log("- Fee BPS:", feeBps.toString());
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });