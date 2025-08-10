import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { supabaseAPI, Match } from '@/lib/supabase';
import { IoGameController, IoList } from 'react-icons/io5';

interface MatchListProps {
  type: 'available' | 'player';
  playerAddress?: string;
  refreshKey?: number;
  onJoin?: () => void;
  limit?: number;
}

// Using GameMatch interface from gameState

export default function MatchList({ type, playerAddress, refreshKey, onJoin, limit }: MatchListProps) {
  const router = useRouter();
  const { address } = useAccount();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch matches from Supabase backend
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        let filteredMatches: Match[] = [];
        
        if (type === 'available') {
          // Show available matches for joining
          const availableMatches = await supabaseAPI.getAvailableMatches();
          filteredMatches = availableMatches.filter(match => match.creator_address !== address);
        } else if (type === 'player' && playerAddress) {
          // Show player's matches
          filteredMatches = await supabaseAPI.getPlayerMatches(playerAddress);
        }

        // Apply limit if specified
        const limitedMatches = limit ? filteredMatches.slice(0, limit) : filteredMatches;
        setMatches(limitedMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast.error('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, [type, playerAddress, address, refreshKey]);

  const handleJoinMatch = async (matchId: string, stake: number) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      // Ensure player exists in database
      await supabaseAPI.getOrCreatePlayer(address);
      
      const match = await supabaseAPI.joinMatch(matchId, address);
      if (!match) {
        toast.error('Failed to join match');
        return;
      }

      toast.success('Joined match successfully!');
      onJoin?.();
      
      // Redirect to match page
      setTimeout(() => {
        router.push(`/match/${matchId}`);
      }, 1000);
      
    } catch (error: any) {
      console.error('Error joining match:', error);
      toast.error(error.message || 'Failed to join match');
    }
  };

  const handlePlayMatch = (match: Match) => {
    // Navigate to match page using Next.js router (preserves wallet connection)
    router.push(`/match/${match.id}`);
  };

  const getMatchStatusColor = (state: string) => {
    switch (state) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'finished': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionButton = (match: Match) => {
    const isCreator = match.creator_address === address;
    const isOpponent = match.opponent_address === address;
    const isParticipant = isCreator || isOpponent;

    if (type === 'available' && match.status === 'waiting') {
      return (
        <button
          onClick={() => handleJoinMatch(match.id, match.stake_amount)}
          className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Join ({match.stake_amount} ETH)
        </button>
      );
    }

    if (type === 'player' && isParticipant && match.status === 'active') {
      return (
        <button
          onClick={() => handlePlayMatch(match)}
          className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Play Now
        </button>
      );
    }

    if (type === 'player' && isParticipant && match.status === 'finished') {
      const isWinner = match.winner_address === address;
      return (
        <button
          onClick={() => handlePlayMatch(match)}
          className={`text-sm px-4 py-2 rounded-lg transition-colors ${
            isWinner 
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {isWinner ? 'Claim Prize' : 'View Result'}
        </button>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4 flex justify-center">
          {type === 'available' ? 
            <IoGameController className="text-gray-400" /> : 
            <IoList className="text-gray-400" />
          }
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {type === 'available' ? 'No Available Matches' : 'No Matches Found'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {type === 'available' 
            ? 'Be the first to create a match!' 
            : 'Your matches will appear here once you create or join one.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div
          key={match.id}
          className="card p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  Match #{match.id}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchStatusColor(match.status)}`}>
                  {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Stake:</span> {match.stake_amount} ETH
                </div>
                <div>
                  <span className="font-medium">Creator:</span>{' '}
                  <span className="font-mono">
                    {match.creator_address.slice(0, 6)}...{match.creator_address.slice(-4)}
                  </span>
                </div>
                {match.opponent_address && (
                  <div>
                    <span className="font-medium">Opponent:</span>{' '}
                    <span className="font-mono">
                      {match.opponent_address.slice(0, 6)}...{match.opponent_address.slice(-4)}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(match.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="ml-4">
              {getActionButton(match)}
            </div>
          </div>

          {/* Match info for finished games */}
          {match.status === 'finished' && match.winner_address && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm">
                <span className="font-medium">Winner:</span>{' '}
                <span className={`font-mono ${match.winner_address === address ? 'text-green-600' : 'text-red-600'}`}>
                  {match.winner_address === address ? 'You!' : `${match.winner_address.slice(0, 6)}...${match.winner_address.slice(-4)}`}
                </span>
                {match.winner_address === address && (
                  <span className="ml-2 text-green-600 font-medium">
                    +{(match.stake_amount * 2 * 0.99).toFixed(4)} ETH
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