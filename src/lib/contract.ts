import { parseEther, formatEther } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SHOOTOUT_ABI as shootoutABI } from './abi';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SHOOTOUT_ADDRESS as `0x${string}`;

export const useShootoutContract = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createMatch = async (stakeAmount: string) => {
    const stake = parseEther(stakeAmount);
    
    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: shootoutABI,
      functionName: 'createMatch',
      args: ['0x0000000000000000000000000000000000000000', stake], // ETH = address(0)
      value: stake,
    });
  };

  const joinMatch = async (matchId: bigint, stakeAmount: string) => {
    const stake = parseEther(stakeAmount);
    
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

export const useMatchData = (matchId?: bigint) => {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: shootoutABI,
    functionName: 'getMatch',
    args: matchId ? [matchId] : undefined,
    query: { enabled: !!matchId }
  });
};

export const useMatchCounter = () => {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: shootoutABI,
    functionName: 'matchCounter',
  });
};

export const usePlayerMatches = (playerAddress?: `0x${string}`) => {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: shootoutABI,
    functionName: 'getPlayerMatches',
    args: playerAddress ? [playerAddress] : undefined,
    query: { enabled: !!playerAddress }
  });
};