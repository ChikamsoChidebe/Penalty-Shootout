import { useRouter } from 'next/router';
import { useAccount, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { toast } from 'react-hot-toast';
import { useShootoutContract } from '@/lib/contract';
import { useContractContext } from '@/contexts/ContractContext';
import { IoFootball, IoRefresh } from 'react-icons/io5';
import { TargetIcon, FlashIcon } from '@/components/icons';
import ModernButton from '@/components/ModernButton';
import { useEffect, useState } from 'react';

interface Match {
  id: string;
  creator: string;
  opponent: string;
  stake: string;
  status: string;
  winner: string;
  rounds: any[];
}

interface MatchListProps {
  type: 'available' | 'player';
  playerAddress?: `0x${string}`;
  refreshKey?: number;
  onJoin?: () => void;
  limit?: number;
}

export default function MatchList({ type, playerAddress, refreshKey, onJoin, limit }: MatchListProps) {
  const router = useRouter();
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { joinMatch, isPending } = useShootoutContract();
  const { matches: allMatches, isLoading, refetch } = useContractContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Auto-refresh when matches change
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing matches...');
      refetch();
    }, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  // Filter and sort matches based on type
  const matches = type === 'available' 
    ? allMatches.filter(match => match?.status === 'waiting' && match?.creator !== address)
    : allMatches.filter(match => 
        match?.creator?.toLowerCase() === playerAddress?.toLowerCase() ||
        match?.opponent?.toLowerCase() === playerAddress?.toLowerCase()
      );
  
  // Sort matches by ID (most recent first) since higher IDs = newer matches
  const sortedMatches = matches?.sort((a, b) => parseInt(b.id) - parseInt(a.id));
  
  const displayMatches = limit ? sortedMatches?.slice(0, limit) : sortedMatches;
  const loading = isLoading;

  const handleJoinMatch = async (matchId: bigint, stakeAmount: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    const stake = parseEther(stakeAmount);
    
    // Check balance
    if (balance && stake > balance.value) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      console.log('🎯 Joining match:', { matchId: matchId.toString(), stakeAmount, stake: stake.toString() });
      await joinMatch(matchId, stakeAmount);
      toast.success('Transaction submitted! Joining match...');
      
      // Force refresh data after successful join
      setTimeout(async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
        console.log('🔄 Data refreshed after joining match');
        toast.success('Match updated! Check your matches.');
      }, 3000); // Wait 3 seconds for transaction to be mined
      
      onJoin?.();
    } catch (error: any) {
      console.error('❌ Error joining match:', error);
      toast.error(error.shortMessage || error.message || 'Failed to join match');
    }
  };

  const handlePlayMatch = (match: Match) => {
    router.push(`/match/${match.id}`);
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300';
      case 'playing': return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300';
      case 'finished': return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300';
    }
  };
  
  const getMatchStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Available';
      case 'playing': return 'In Progress';
      case 'finished': return 'Finished';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getActionButton = (match: Match) => {
    const isCreator = match.creator === address;
    const isOpponent = match.opponent === address;
    const isParticipant = isCreator || isOpponent;

    if (type === 'available' && match.status === 'waiting') {
      return (
        <ModernButton
          variant="success"
          size="sm"
          loading={isPending}
          onClick={() => handleJoinMatch(BigInt(match.id), match.stake)}
          icon={<FlashIcon size={16} />}
        >
          Join ({match.stake} ETH)
        </ModernButton>
      );
    }

    if (type === 'player' && isParticipant && match.status === 'playing') {
      return (
        <ModernButton
          variant="primary"
          size="sm"
          onClick={() => handlePlayMatch(match)}
          icon={<TargetIcon size={16} />}
        >
          Play Now
        </ModernButton>
      );
    }

    if (type === 'player' && isParticipant && match.status === 'finished') {
      const isWinner = match.winner === address;
      return (
        <ModernButton
          variant={isWinner ? "success" : "secondary"}
          size="sm"
          onClick={() => handlePlayMatch(match)}
        >
          {isWinner ? 'Claim Prize' : 'View Result'}
        </ModernButton>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
              </div>
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!displayMatches || displayMatches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-2xl">
            <IoFootball size={48} className="text-gray-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {type === 'available' ? 'No Available Matches' : 'No Matches Found'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {type === 'available' 
            ? 'Waiting for matches to be created. Create one to get started!' 
            : 'Your matches will appear here once you create or join one.'
          }
        </p>
      </div>
    );
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success('Matches refreshed!');
  };

  return (
    <div className="space-y-6">
      {/* Manual refresh button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {type === 'available' ? 'Available Matches' : 'Your Matches'}
        </h3>
        <ModernButton
          variant="secondary"
          size="sm"
          onClick={handleManualRefresh}
          loading={isRefreshing}
          icon={<IoRefresh size={16} />}
        >
          Refresh
        </ModernButton>
      </div>
      
      {displayMatches?.map((match) => (
        <div
          key={match.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                  Match #{match.id}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getMatchStatusColor(match.status)}`}>
                  {getMatchStatusText(match.status)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Stake:</span>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">{match.stake} ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Creator:</span>
                  </div>
                  <span className="font-mono text-gray-900 dark:text-white text-xs">
                    {match.creator.slice(0, 6)}...{match.creator.slice(-4)}
                  </span>
                </div>
                {match.opponent && match.opponent !== '0x0000000000000000000000000000000000000000' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Opponent:</span>
                    </div>
                    <span className="font-mono text-gray-900 dark:text-white text-xs">
                      {match.opponent.slice(0, 6)}...{match.opponent.slice(-4)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="ml-6">
              {getActionButton(match)}
            </div>
          </div>

          {/* Match info for finished games */}
          {match.status === 'finished' && match.winner && match.winner !== '0x0000000000000000000000000000000000000000' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 dark:text-gray-400">Winner:</span>
                  <span className={`font-mono font-bold ${
                    match.winner === address ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {match.winner === address ? 'You!' : `${match.winner.slice(0, 6)}...${match.winner.slice(-4)}`}
                  </span>
                </div>
                {match.winner === address && (
                  <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                    +{(parseFloat(match.stake) * 2 * 0.99).toFixed(4)} ETH
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}