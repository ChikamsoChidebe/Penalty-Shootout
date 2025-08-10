import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "@nomicfoundation/hardhat-foundry"; // Disabled for Windows
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 30000000,
      gasPrice: 1000000000, // 1 gwei
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 20,
      },
    },
    
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    somnia: {
      url: process.env.SOMNIA_RPC_URL || "https://rpc.somnia.network",
      chainId: 50312,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  
  etherscan: {
    apiKey: {
      somnia: process.env.SOMNIA_API_KEY || "dummy",
    },
    customChains: [
      {
        network: "somnia",
        chainId: 50312,
        urls: {
          apiURL: "https://explorer.somnia.network/api",
          browserURL: "https://explorer.somnia.network",
        },
      },
    ],
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 1, // 1 gwei
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    excludeContracts: ["test/", "mock/"],
  },
  
  typechain: {
    outDir: "src/types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["externalArtifacts/*.json"],
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  mocha: {
    timeout: 60000,
  },
};

export default config;