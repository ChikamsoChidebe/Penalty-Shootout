import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { somniaTestnet } from '@/lib/wagmi';
import { IoWarning } from 'react-icons/io5';

export default function NetworkGuard() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) {
    return null;
  }

  const isCorrectNetwork = chainId === somniaTestnet.id || chainId === 31337;

  if (!isConnected) {
    return null;
  }

  if (isCorrectNetwork) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        Connected to {chainId === 31337 ? 'Local Network' : 'Somnia Testnet'}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
      Connected to Chain {chainId}
    </div>
  );
}