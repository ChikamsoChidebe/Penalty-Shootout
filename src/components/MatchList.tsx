import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAccount, useBalance, usePublicClient } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { toast } from 'react-hot-toast';
import { useShootoutContract, useMatchCounter, usePlayerMatches } from '@/lib/contract';
import { IoFootball, IoPeople, IoFlash, IoGameController } from 'react-icons/io5';
import { TargetIcon, FlashIcon } from '@/components/icons';
import ModernButton from '@/components/ModernButton';
import { SHOOTOUT_ABI as shootoutABI } from '@/lib/abi';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SHOOTOUT_ADDRESS as `0x${string}`;

interface Match {
  id: bigint;
  creator: `0x${string}`;
  opponent: `0x${string}`;
  stake: bigint;
  state: number;
  createdAt: bigint;
  joinDeadline: bigint;
  winner: `0x${string}`;
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
  const { data: matchCounter } = useMatchCounter();
  const { data: playerMatchIds } = usePlayerMatches(playerAddress);
  const publicClient = usePublicClient();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch matches from blockchain
  useEffect(() => {
    const fetchMatches = async () => {
      if (!publicClient || !matchCounter) return;
      
      setLoading(true);
      try {
        const allMatches: Match[] = [];
        
        if (type === 'available') {
          // Fetch all matches and filter for available ones
          const counter = Number(matchCounter);
          for (let i = 1; i <= counter; i++) {
            try {
              const match = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: shootoutABI,
                functionName: 'getMatch',
                args: [BigInt(i)]
              }) as any;
              
              // State 0 = Created (available to join)
              if (match.state === 0 && match.creator !== address && match.creator !== '0x0000000000000000000000000000000000000000') {
                allMatches.push({
                  id: BigInt(i),
                  creator: match.creator,
                  opponent: match.opponent,
                  stake: match.stake,
                  state: match.state,
                  createdAt: match.createdAt,
                  joinDeadline: match.joinDeadline,
                  winner: match.winner
                });
              }
            } catch (error) {
              // Skip invalid matches
            }
          }
        } else if (type === 'player' && playerMatchIds) {
          // Fetch player's matches
          for (const matchId of playerMatchIds) {
            try {
              const match = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: shootoutABI,
                functionName: 'getMatch',
                args: [matchId]
              }) as any;
              
              allMatches.push({
                id: matchId,
                creator: match.creator,
                opponent: match.opponent,
                stake: match.stake,
                state: match.state,
                createdAt: match.createdAt,
                joinDeadline: match.joinDeadline,
                winner: match.winner
              });
            } catch (error) {
              // Skip invalid matches
            }
          }
        }
        
        const limitedMatches = limit ? allMatches.slice(0, limit) : allMatches;
        setMatches(limitedMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast.error('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchMatches, 10000);
    return () => clearInterval(interval);
  }, [type, playerAddress, address, refreshKey, matchCounter, playerMatchIds, publicClient]);

  const handleJoinMatch = async (matchId: bigint, stake: bigint) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    // Check balance
    if (balance && stake > balance.value) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await joinMatch(matchId, formatEther(stake));
      toast.success('Transaction submitted! Joining match...');
      onJoin?.();
    } catch (error: any) {
      console.error('Error joining match:', error);
      toast.error(error.message || 'Failed to join match');
    }
  };

  const handlePlayMatch = (match: Match) => {
    router.push(`/match/${match.id}`);
  };

  const getMatchStatusColor = (state: number) => {
    switch (state) {
      case 0: return 'status-created'; // Created
      case 1: return 'status-joined';  // Joined
      case 2: return 'status-committed'; // Committed
      case 3: return 'status-reveal'; // RevealWindow
      case 4: return 'status-settled'; // Settled
      case 5: return 'status-cancelled'; // Cancelled
      default: return 'status-created';
    }
  };
  
  const getMatchStatusText = (state: number) => {
    switch (state) {
      case 0: return 'Available';
      case 1: return 'Joined';
      case 2: return 'Committed';
      case 3: return 'Revealing';
      case 4: return 'Finished';
      case 5: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getActionButton = (match: Match) => {
    const isCreator = match.creator === address;
    const isOpponent = match.opponent === address;
    const isParticipant = isCreator || isOpponent;

    if (type === 'available' && match.state === 0) {
      return (
        <ModernButton
          variant="success"
          size="sm"
          loading={isPending}
          onClick={() => handleJoinMatch(match.id, match.stake)}
          icon={<FlashIcon size={16} />}
        >
          Join ({formatEther(match.stake)} ETH)
        </ModernButton>
      );
    }

    if (type === 'player' && isParticipant && (match.state === 1 || match.state === 2 || match.state === 3)) {
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

    if (type === 'player' && isParticipant && match.state === 4) {
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

  if (matches.length === 0) {
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

  return (
    <div className="space-y-6">
      {matches.map((match) => (
        <div
          key={match.id.toString()}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                  Match #{match.id.toString()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getMatchStatusColor(match.state)}`}>
                  {getMatchStatusText(match.state)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Stake:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{formatEther(match.stake)} ETH</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Creator:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {match.creator.slice(0, 6)}...{match.creator.slice(-4)}
                  </span>
                </div>
                {match.opponent !== '0x0000000000000000000000000000000000000000' && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Opponent:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {match.opponent.slice(0, 6)}...{match.opponent.slice(-4)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(Number(match.createdAt) * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="ml-6">
              {getActionButton(match)}
            </div>
          </div>

          {/* Match info for finished games */}
          {match.state === 4 && match.winner !== '0x0000000000000000000000000000000000000000' && (
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
                    +{(parseFloat(formatEther(match.stake)) * 2 * 0.99).toFixed(4)} ETH
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