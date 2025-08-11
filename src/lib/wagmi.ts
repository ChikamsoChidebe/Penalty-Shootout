import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'viem';
import { metaMask, injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// Localhost configuration
export const localhost: Chain = {
  id: 31337,
  name: 'Localhost 8545',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  testnet: true,
};

// Somnia Testnet configuration
export const somniaTestnet: Chain = {
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://dream-rpc.somnia.network'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://shannon-explorer.somnia.network',
    },
  },
  testnet: true,
};

// Wagmi configuration
export const config = getDefaultConfig({
  appName: 'Penalty Shootout Duel',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '0e2ef18355053573e228757c5dcc36b3',
  chains: [somniaTestnet, localhost], // Prioritize Somnia Testnet
  ssr: true,
});

// Chain configuration
export const SUPPORTED_CHAINS = [somniaTestnet, localhost];

// Default chain - use Somnia Testnet
export const DEFAULT_CHAIN = somniaTestnet;

// Network utilities
export const isValidChain = (chainId: number): boolean => {
  return SUPPORTED_CHAINS.some(chain => chain.id === chainId);
};

export const getChainById = (chainId: number): Chain | undefined => {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
};

export const formatChainName = (chainId: number): string => {
  const chain = getChainById(chainId);
  return chain?.name || `Chain ${chainId}`;
};