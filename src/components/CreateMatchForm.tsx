import { useState, useEffect, useRef } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'react-hot-toast';
import { useShootoutContract } from '@/lib/contract';
import { TargetIcon, CoinIcon } from '@/components/icons';
import ModernButton from '@/components/ModernButton';
import LoadingSpinner from '@/components/LoadingSpinner';

interface CreateMatchFormProps {
  onSuccess?: () => void;
}

export default function CreateMatchForm({ onSuccess }: CreateMatchFormProps) {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { createMatch, isPending, isConfirming, isSuccess, error } = useShootoutContract();
  
  const [stake, setStake] = useState('0.01');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    const stakeAmount = parseFloat(stake);
    
    if (stakeAmount <= 0) {
      toast.error('Stake must be greater than 0');
      return;
    }

    // Check balance
    if (balance && parseEther(stake) > balance.value) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await createMatch(stake);
      toast.success('Transaction submitted! Creating match...');
    } catch (error: any) {
      console.error('Error creating match:', error);
      toast.error(error.message || 'Failed to create match');
    }
  };

  const hasShownSuccessToast = useRef(false);

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && !hasShownSuccessToast.current) {
      toast.success('Match created successfully!');
      hasShownSuccessToast.current = true;
      onSuccess?.();
      setStake('0.01');
    }
  }, [isSuccess, onSuccess]);

  // Reset success toast flag when starting new transaction
  useEffect(() => {
    if (isPending) {
      hasShownSuccessToast.current = false;
    }
  }, [isPending]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      toast.error('Transaction failed');
    }
  }, [error]);



  const minStake = 0.001;
  const maxStake = 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Stake Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <CoinIcon size={16} className="text-green-500" />
          Stake Amount
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.001"
            min={minStake}
            max={maxStake}
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-16"
            placeholder="0.01"
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold">ETH</span>
          </div>
        </div>
        
        {/* Quick Amount Buttons */}
        <div className="flex space-x-2 mt-3">
          {[0.001, 0.01, 0.1, 1].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setStake(amount.toString())}
              className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              {amount} ETH
            </button>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>Min: {minStake} ETH</span>
          <span>Max: {maxStake} ETH</span>
        </div>
        
        {/* Balance Display */}
        {balance && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Balance: {parseFloat(balance.formatted).toFixed(4)} ETH
          </div>
        )}
      </div>

      {/* Match Info */}
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TargetIcon size={20} className="text-blue-500" />
          Match Details
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Your Stake:</span>
            <span className="font-bold text-gray-900 dark:text-white">{stake} ETH</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Total Pot:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {(parseFloat(stake) * 2).toFixed(3)} ETH
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Protocol Fee:</span>
            <span className="font-medium text-gray-900 dark:text-white">1%</span>
          </div>
          <div className="w-full h-px bg-gray-200 dark:bg-gray-600 my-3"></div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Winner Gets:</span>
            <span className="font-bold text-green-600 dark:text-green-400 text-lg">
              {(parseFloat(stake) * 2 * 0.99).toFixed(3)} ETH
            </span>
          </div>
        </div>
      </div>

      {/* Game Rules */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 border border-blue-200 dark:border-blue-500/30 rounded-2xl">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Game Rules</span>
        </h4>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            Best of 3 penalty shots
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 bg-green-400 rounded-full"></div>
            You are the shooter, opponent is the keeper
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            Choose Left, Center, or Right for each shot
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
            Keeper wins if they guess your direction
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 bg-red-400 rounded-full"></div>
            Commit-reveal ensures fairness
          </li>
        </ul>
      </div>

      {/* Submit Button */}
      <ModernButton
        type="submit"
        variant="primary"
        size="lg"
        loading={isPending || isConfirming}
        disabled={!address || (balance && parseEther(stake) > balance.value)}
        icon={<TargetIcon size={20} />}
        className="w-full"
      >
        {isPending ? 'Confirm in Wallet...' : 
         isConfirming ? 'Creating Match...' : 
         'Create Match'}
      </ModernButton>

    </form>
  );
}