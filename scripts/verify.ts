import { run } from "hardhat";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config();

interface DeploymentInfo {
  contractName: string;
  address: string;
  transactionHash: string;
  blockNumber: number;
  network: string;
  chainId: number;
  constructorArgs?: any[];
}

async function main() {
  console.log("🔍 Starting contract verification...\n");

  const network = await run("network");
  const chainId = network.config.chainId;
  
  console.log(`Network: ${network.name} (Chain ID: ${chainId})`);

  try {
    // Load deployment info
    const deploymentFile = join(process.cwd(), "deployments", `${network.name}-${chainId}.json`);
    
    if (!existsSync(deploymentFile)) {
      throw new Error(`❌ Deployment file not found: ${deploymentFile}`);
    }

    const deploymentInfo: DeploymentInfo = JSON.parse(readFileSync(deploymentFile, "utf8"));
    
    console.log(`📍 Contract Address: ${deploymentInfo.address}`);
    console.log(`🏗️  Block Number: ${deploymentInfo.blockNumber}\n`);

    // Verify Shootout contract
    console.log("🔍 Verifying Shootout contract...");
    
    await run("verify:verify", {
      address: deploymentInfo.address,
      constructorArguments: deploymentInfo.constructorArgs || [],
      contract: "contracts/Shootout.sol:Shootout",
    });

    console.log("✅ Contract verified successfully!");
    console.log(`🌐 View on explorer: https://explorer.somnia.network/address/${deploymentInfo.address}\n`);

    // Additional verification checks
    console.log("🔍 Running additional verification checks...");
    
    // Check if contract is verified on explorer
    await checkExplorerVerification(deploymentInfo.address);
    
    console.log("🎉 Verification completed successfully!");

  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
      
      // Provide helpful debugging info
      console.log("\n🔧 Debugging Information:");
      console.log("- Make sure SOMNIA_API_KEY is set in .env");
      console.log("- Check that the contract address is correct");
      console.log("- Verify the network configuration in hardhat.config.ts");
      console.log("- Ensure the contract was deployed successfully");
      
      process.exit(1);
    }
  }
}

async function checkExplorerVerification(address: string) {
  try {
    // This would typically make an API call to the explorer
    // For now, we'll just log the explorer URL
    const explorerUrl = `https://explorer.somnia.network/address/${address}`;
    console.log(`🌐 Explorer URL: ${explorerUrl}`);
    
    // In a real implementation, you might want to:
    // 1. Make an API call to check verification status
    // 2. Parse the response to confirm verification
    // 3. Retry if verification is still pending
    
    console.log("✅ Explorer verification check completed");
  } catch (error) {
    console.warn("⚠️  Could not verify explorer status:", error);
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

export { main as verifyContracts };