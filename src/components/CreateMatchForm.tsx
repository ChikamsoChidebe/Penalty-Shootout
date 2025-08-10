import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { useUIActions } from '@/state/store';
import { supabaseAPI } from '@/lib/supabase';
import { IoList, IoAdd, IoRocket } from 'react-icons/io5';

interface CreateMatchFormProps {
  onSuccess?: () => void;
}

export default function CreateMatchForm({ onSuccess }: CreateMatchFormProps) {
  const { address, chainId } = useAccount();
  
  const [stake, setStake] = useState('0.01');
  const [matchType, setMatchType] = useState<'human' | 'ai'>('human');
  const [loading, setLoading] = useState(false);

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

    try {
      setLoading(true);
      
      // Ensure player exists in database
      await supabaseAPI.getOrCreatePlayer(address);
      
      let match;
      if (matchType === 'ai') {
        // Create match with AI opponent
        match = await supabaseAPI.createAIMatch(address, stakeAmount);
        toast.success('AI match created! Redirecting to game...');
        
        // Redirect to match immediately
        setTimeout(() => {
          window.location.href = `/match/${match.id}`;
        }, 1500);
      } else {
        // Create match for human opponent
        match = await supabaseAPI.createMatch(address, stakeAmount);
        toast.success(`Match #${match.id} created! Waiting for opponent...`);
      }
      
      onSuccess?.();
      setStake('0.01'); // Reset form
      
    } catch (error: any) {
      console.error('Error creating match:', error);
      toast.error(error.message || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  // Remove transaction confirmation logic since we're using game state manager

  const minStake = 0.001;
  const maxStake = 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Match Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Opponent Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMatchType('human')}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              matchType === 'human'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
            }`}
          >
            <div className="font-medium">👥 Human Player</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Wait for real opponent</div>
          </button>
          <button
            type="button"
            onClick={() => setMatchType('ai')}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              matchType === 'ai'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
            }`}
          >
            <div className="font-medium">🤖 AI Opponent</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Play instantly</div>
          </button>
        </div>
      </div>

      {/* Stake Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            className="w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="0.01"
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 dark:text-gray-400 text-sm">ETH</span>
          </div>
        </div>
        
        {/* Quick Amount Buttons */}
        <div className="flex space-x-2 mt-2">
          {[0.001, 0.01, 0.1, 1].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setStake(amount.toString())}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {amount} ETH
            </button>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Min: {minStake} ETH</span>
          <span>Max: {maxStake} ETH</span>
        </div>
      </div>

      {/* Match Info */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Match Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Your Stake:</span>
            <span className="font-medium text-gray-900 dark:text-white">{stake} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Pot:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {(parseFloat(stake) * 2).toFixed(3)} ETH
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Protocol Fee:</span>
            <span className="font-medium text-gray-900 dark:text-white">1%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Winner Gets:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {(parseFloat(stake) * 2 * 0.99).toFixed(3)} ETH
            </span>
          </div>
        </div>
      </div>

      {/* Game Rules */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
          <IoList className="text-lg" />
          <span>Game Rules</span>
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Best of 3 penalty shots</li>
          <li>• You are the shooter, opponent is the keeper</li>
          <li>• Choose Left, Center, or Right for each shot</li>
          <li>• Keeper wins if they guess your direction</li>
          <li>• Commit-reveal ensures fairness</li>
        </ul>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !address}
        className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creating...</span>
          </>
        ) : (
          <>
            {matchType === 'ai' ? <IoRocket className="text-lg" /> : <IoAdd className="text-lg" />}
            <span>{matchType === 'ai' ? 'Play vs AI' : 'Create Match'}</span>
          </>
        )}
      </button>


    </form>
  );
}