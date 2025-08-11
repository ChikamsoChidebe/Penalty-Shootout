import { useAccount, useBalance } from 'wagmi';
import { useEffect } from 'react';
import { IoWallet } from 'react-icons/io5';


export default function BalanceDisplay() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  // Sync balance with database
  useEffect(() => {
    if (address && balance) {
      const syncBalance = async () => {
        try {
          // Balance is tracked on-chain via transactions
        } catch (error) {
          console.error('Error syncing balance:', error);
        }
      };
      syncBalance();
    }
  }, [address, balance]);

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <IoWallet className="text-gray-600 dark:text-gray-400" />
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {balance ? `${parseFloat(balance.formatted) > 1000 ? parseFloat(balance.formatted).toFixed(1) : parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 ETH'}
      </span>
    </div>
  );
}