import { ethers } from "hardhat";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config();

interface DeploymentResult {
  contractName: string;
  address: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  deployedAt: string;
  network: string;
  chainId: number;
}

interface DeploymentConfig {
  network: string;
  chainId: number;
  gasLimit: number;
  gasPrice: string;
  confirmations: number;
}

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
  const minBalance = ethers.parseEther("0.1"); // Minimum 0.1 ETH
  
  if (balance < minBalance) {
    throw new Error(`❌ Insufficient balance. Need at least 0.1 ETH, have ${ethers.formatEther(balance)} ETH`);
  }

  try {
    // Deploy Shootout contract
    console.log("📦 Deploying Shootout contract...");
    const ShootoutFactory = await ethers.getContractFactory("Shootout");
    
    const shootout = await ShootoutFactory.deploy({
      gasLimit: 3000000, // 3M gas limit
    });

    console.log("⏳ Waiting for deployment confirmation...");
    const deploymentReceipt = await shootout.deploymentTransaction()?.wait();
    
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

    // Prepare deployment result
    const deploymentResult: DeploymentResult = {
      contractName: "Shootout",
      address: contractAddress,
      transactionHash: deploymentReceipt.hash,
      blockNumber: deploymentReceipt.blockNumber,
      gasUsed: deploymentReceipt.gasUsed.toString(),
      deployedAt: new Date().toISOString(),
      network: network.name,
      chainId: Number(network.chainId),
    };

    // Save deployment info
    await saveDeploymentInfo(deploymentResult);
    
    // Generate frontend config
    await generateFrontendConfig(deploymentResult);
    
    // Generate ABI
    await generateABI();

    console.log("🎉 Deployment completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("1. Update .env with the contract address");
    console.log("2. Run 'npm run verify:somnia' to verify on explorer");
    console.log("3. Start the frontend with 'npm run dev'");
    console.log("4. Test the deployment with 'npm run test:integration'\n");

    return deploymentResult;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

async function saveDeploymentInfo(result: DeploymentResult) {
  const deploymentsDir = join(process.cwd(), "deployments");
  
  if (!existsSync(deploymentsDir)) {
    mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save individual deployment
  const deploymentFile = join(deploymentsDir, `${result.network}-${result.chainId}.json`);
  writeFileSync(deploymentFile, JSON.stringify(result, null, 2));
  
  // Save to addresses.json for frontend
  const addressesFile = join(process.cwd(), "addresses.json");
  const addresses = existsSync(addressesFile) 
    ? JSON.parse(require("fs").readFileSync(addressesFile, "utf8"))
    : {};
    
  addresses[result.chainId] = {
    Shootout: result.address,
    deployedAt: result.deployedAt,
    blockNumber: result.blockNumber,
  };
  
  writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));
  
  console.log(`💾 Deployment info saved to ${deploymentFile}`);
  console.log(`💾 Addresses saved to ${addressesFile}`);
}

async function generateFrontendConfig(result: DeploymentResult) {
  const config = {
    contractAddress: result.address,
    chainId: result.chainId,
    network: result.network,
    deployedAt: result.deployedAt,
    blockNumber: result.blockNumber,
  };

  const configDir = join(process.cwd(), "src", "config");
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  const configFile = join(configDir, "contracts.json");
  writeFileSync(configFile, JSON.stringify(config, null, 2));
  
  console.log(`⚙️  Frontend config saved to ${configFile}`);
}

async function generateABI() {
  try {
    const artifactPath = join(process.cwd(), "artifacts", "contracts", "Shootout.sol", "Shootout.json");
    
    if (existsSync(artifactPath)) {
      const artifact = JSON.parse(require("fs").readFileSync(artifactPath, "utf8"));
      
      const abiDir = join(process.cwd(), "src", "lib");
      if (!existsSync(abiDir)) {
        mkdirSync(abiDir, { recursive: true });
      }
      
      const abiFile = join(abiDir, "abi.ts");
      const abiContent = `// Auto-generated ABI - Do not edit manually
export const SHOOTOUT_ABI = ${JSON.stringify(artifact.abi, null, 2)} as const;

export const SHOOTOUT_BYTECODE = "${artifact.bytecode}";
`;
      
      writeFileSync(abiFile, abiContent);
      console.log(`📄 ABI exported to ${abiFile}`);
    }
  } catch (error) {
    console.warn("⚠️  Could not generate ABI file:", error);
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

export { main as deployShootout };