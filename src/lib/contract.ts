import { parseEther, formatEther } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { useMemo } from 'react';
import { SHOOTOUT_ABI as shootoutABI } from './abi';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SHOOTOUT_ADDRESS as `0x${string}`;

// Write contract operations
export const useShootoutContract = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createMatch = async (stakeAmount: string) => {
    const stake = parseEther(stakeAmount);
    
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: shootoutABI,
      functionName: 'createMatch',
      args: ['0x0000000000000000000000000000000000000000', stake],
      value: stake,
    });
  };

  const joinMatch = async (matchId: bigint, stakeAmount: string) => {
    const stake = parseEther(stakeAmount);
    
    console.log('🔧 Contract call params:', {
      address: CONTRACT_ADDRESS,
      matchId: matchId.toString(),
      stake: stake.toString(),
      stakeAmount
    });
    
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: shootoutABI,
      functionName: 'joinMatch',
      args: [matchId],
      value: stake,
    });
  };

  return {
    createMatch,
    joinMatch,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash
  };
};

// Optimized match counter with caching
export const useMatchCounter = () => {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: shootoutABI,
    functionName: 'matchCounter',
    query: {
      staleTime: 30_000, // 30 seconds
      gcTime: 300_000, // 5 minutes
    }
  });
};

// Single match data with real-time polling
export const useMatchData = (matchId?: bigint) => {
  const result = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: shootoutABI,
    functionName: 'getMatch',
    args: matchId ? [matchId] : undefined,
    query: { 
      enabled: !!matchId && !!CONTRACT_ADDRESS,
      staleTime: 2_000, // 2 seconds for real-time updates
      gcTime: 300_000, // 5 minutes
      refetchInterval: 3_000, // Poll every 3 seconds
      refetchIntervalInBackground: true,
      retry: 3,
      retryDelay: 1000,
    }
  });
  
  // Debug logging
  console.log('🔍 useMatchData:', {
    matchId: matchId?.toString(),
    contractAddress: CONTRACT_ADDRESS,
    enabled: !!matchId && !!CONTRACT_ADDRESS,
    data: result.data,
    isLoading: result.isLoading,
    error: result.error,
    status: result.status
  });
  
  return result;
};

// Optimized batch match fetching
export const useAllMatches = () => {
  const { data: matchCounter } = useMatchCounter();
  
  const contracts = useMemo(() => {
    console.log('🔍 Contract Address:', CONTRACT_ADDRESS);
    console.log('🔍 Match Counter:', matchCounter);
    
    if (!matchCounter || matchCounter === 0n) return [];
    
    const count = Number(matchCounter);
    const maxMatches = Math.min(count, 20); // Limit to 20 matches max
    
    console.log('🔍 Creating contracts for', maxMatches, 'matches');
    
    return Array.from({ length: maxMatches }, (_, i) => ({
      address: CONTRACT_ADDRESS,
      abi: shootoutABI,
      functionName: 'getMatch' as const,
      args: [BigInt(i + 1)],
    }));
  }, [matchCounter]);

  const { data: matchesData, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
      staleTime: 5_000, // 5 seconds for faster updates
      gcTime: 300_000, // 5 minutes
      refetchInterval: 10_000, // Refetch every 10 seconds for real-time updates
    }
  });

  const processedMatches = useMemo(() => {
    if (!matchesData) {
      console.log('🔍 No matches data');
      return [];
    }
    
    console.log('🔍 Raw matches data:', matchesData);
    
    const processed = matchesData
      .map((result, index) => {
        if (result.status === 'success' && result.result) {
          const match = result.result as any;
          
          // Handle different contract response formats
          let matchStatus = 'waiting';
          const opponent = match.opponent || match[1] || '0x0000000000000000000000000000000000000000';
          
          // If opponent is set and not zero address, match is playing
          if (opponent !== '0x0000000000000000000000000000000000000000') {
            matchStatus = 'playing';
          }
          
          if (match.state !== undefined) {
            // Convert numeric state to string status
            switch (Number(match.state)) {
              case 0: matchStatus = 'waiting'; break;
              case 1: matchStatus = 'playing'; break;
              case 2: matchStatus = 'playing'; break;
              case 3: matchStatus = 'playing'; break;
              case 4: matchStatus = 'finished'; break;
              case 5: matchStatus = 'cancelled'; break;
              default: 
                // Fallback: check if opponent exists
                matchStatus = opponent !== '0x0000000000000000000000000000000000000000' ? 'playing' : 'waiting';
            }
          } else if (match.status) {
            matchStatus = match.status;
          }
          
          const processedMatch = {
            id: (index + 1).toString(),
            creator: match.creator || match[0],
            opponent: opponent,
            stake: match.stake ? formatEther(match.stake) : (match[2] ? formatEther(match[2]) : '0'),
            status: matchStatus,
            winner: match.winner || match[6] || '0x0000000000000000000000000000000000000000',
            rounds: match.rounds || [],
          };
          
          console.log('🔍 Processed match:', processedMatch);
          return processedMatch;
        }
        console.log('🔍 Failed to process result:', result);
        return null;
      })
      .filter(Boolean);
      
    console.log('🔍 Final processed matches:', processed);
    return processed;
  }, [matchesData]);

  return {
    data: processedMatches,
    isLoading,
    error,
    matchCounter,
    refetch
  };
};

// Player matches with caching
export const usePlayerMatches = (playerAddress?: `0x${string}`) => {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: shootoutABI,
    functionName: 'getPlayerMatches',
    args: playerAddress ? [playerAddress] : undefined,
    query: { 
      enabled: !!playerAddress,
      staleTime: 30_000, // 30 seconds
      gcTime: 300_000, // 5 minutes
    }
  });
};

// Available matches (waiting for opponent)
export const useAvailableMatches = () => {
  const { data: allMatches, isLoading, error } = useAllMatches();
  
  const availableMatches = useMemo(() => {
    if (!allMatches) return [];
    return allMatches.filter(match => match?.status === 'waiting');
  }, [allMatches]);

  return {
    data: availableMatches,
    isLoading,
    error
  };
};

// Player's matches (created or joined)
export const useMyMatches = (playerAddress?: `0x${string}`) => {
  const { data: allMatches, isLoading, error } = useAllMatches();
  
  const myMatches = useMemo(() => {
    if (!allMatches || !playerAddress) return [];
    return allMatches.filter(match => 
      match?.creator?.toLowerCase() === playerAddress.toLowerCase() ||
      match?.opponent?.toLowerCase() === playerAddress.toLowerCase()
    );
  }, [allMatches, playerAddress]);

  return {
    data: myMatches,
    isLoading,
    error
  };
};