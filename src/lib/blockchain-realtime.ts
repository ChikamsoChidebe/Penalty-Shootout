import { useShootoutContract } from './contract';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Blockchain-based real-time game state
interface BlockchainGameState {
  matchId: string;
  round: number;
  shooterScore: number;
  keeperScore: number;
  phase: 'committing' | 'revealing' | 'finished';
  shooterCommitted: boolean;
  keeperCommitted: boolean;
  shooterRevealed: boolean;
  keeperRevealed: boolean;
  lastUpdate: number;
}

// Global state manager using blockchain
class BlockchainGameManager {
  private states = new Map<string, BlockchainGameState>();
  private listeners = new Map<string, Set<(state: BlockchainGameState) => void>>();
  
  // Initialize or get game state
  getOrCreateState(matchId: string): BlockchainGameState {
    if (!this.states.has(matchId)) {
      const state: BlockchainGameState = {
        matchId,
        round: 1,
        shooterScore: 0,
        keeperScore: 0,
        phase: 'committing',
        shooterCommitted: false,
        keeperCommitted: false,
        shooterRevealed: false,
        keeperRevealed: false,
        lastUpdate: Date.now()
      };
      this.states.set(matchId, state);
    }
    return this.states.get(matchId)!;
  }
  
  // Subscribe to state changes
  subscribe(matchId: string, callback: (state: BlockchainGameState) => void) {
    if (!this.listeners.has(matchId)) {
      this.listeners.set(matchId, new Set());
    }
    this.listeners.get(matchId)!.add(callback);
    
    // Send current state
    const state = this.getOrCreateState(matchId);
    callback(state);
    
    return () => {
      this.listeners.get(matchId)?.delete(callback);
    };
  }
  
  // Update state and notify listeners
  updateState(matchId: string, updates: Partial<BlockchainGameState>) {
    const state = this.getOrCreateState(matchId);
    Object.assign(state, updates, { lastUpdate: Date.now() });
    this.states.set(matchId, state);
    
    // Notify all listeners
    const listeners = this.listeners.get(matchId);
    if (listeners) {
      listeners.forEach(callback => callback(state));
    }
  }
  
  // Player commits choice
  commitChoice(matchId: string, isShooter: boolean, choice: string) {
    const state = this.getOrCreateState(matchId);
    
    if (isShooter) {
      state.shooterCommitted = true;
    } else {
      state.keeperCommitted = true;
    }
    
    // Store choice temporarily (in real app this would be hashed)
    (state as any)[isShooter ? 'shooterChoice' : 'keeperChoice'] = choice;
    
    // Check if both committed
    if (state.shooterCommitted && state.keeperCommitted) {
      // Auto-resolve after short delay
      setTimeout(() => {
        this.resolveRound(matchId);
      }, 1000);
    }
    
    this.updateState(matchId, state);
  }
  
  // Resolve round when both players committed
  private resolveRound(matchId: string) {
    const state = this.getOrCreateState(matchId);
    const shooterChoice = (state as any).shooterChoice;
    const keeperChoice = (state as any).keeperChoice;
    
    if (!shooterChoice || !keeperChoice) return;
    
    // Keeper wins if they guess shooter's direction
    const keeperWins = shooterChoice === keeperChoice;
    
    if (keeperWins) {
      state.keeperScore++;
    } else {
      state.shooterScore++;
    }
    
    // Check if game finished
    if (state.round >= 3) {
      state.phase = 'finished';
    } else {
      // Next round
      state.round++;
      state.shooterCommitted = false;
      state.keeperCommitted = false;
      state.shooterRevealed = false;
      state.keeperRevealed = false;
      delete (state as any).shooterChoice;
      delete (state as any).keeperChoice;
    }
    
    this.updateState(matchId, state);
    
    // Show result
    setTimeout(() => {
      if (keeperWins) {
        toast.success(`🥅 SAVE! Keeper guessed ${keeperChoice.toUpperCase()}, shooter shot ${shooterChoice.toUpperCase()}!`);
      } else {
        toast.success(`⚽ GOAL! Shooter shot ${shooterChoice.toUpperCase()}, keeper guessed ${keeperChoice.toUpperCase()}!`);
      }
    }, 100);
  }
}

// Global manager instance
const blockchainGameManager = new BlockchainGameManager();

// Hook for blockchain-based real-time game
export const useBlockchainGame = (matchId: string, playerAddress: string, opponentAddress: string) => {
  const [gameState, setGameState] = useState<BlockchainGameState | null>(null);
  const { writeContract } = useShootoutContract();
  
  // Determine if player is shooter (creator = shooter)
  const isShooter = playerAddress < opponentAddress; // Simple deterministic assignment
  
  useEffect(() => {
    if (!matchId || !playerAddress) return;
    
    // Subscribe to game state updates
    const unsubscribe = blockchainGameManager.subscribe(matchId, setGameState);
    
    return unsubscribe;
  }, [matchId, playerAddress]);
  
  // Commit choice to blockchain
  const commitChoice = async (choice: string) => {
    if (!gameState) return;
    
    try {
      // In real implementation, this would call smart contract
      // For now, simulate blockchain transaction
      console.log(`🔗 Blockchain transaction: ${isShooter ? 'Shooter' : 'Keeper'} commits ${choice}`);
      
      // Simulate transaction delay
      setTimeout(() => {
        blockchainGameManager.commitChoice(matchId, isShooter, choice);
      }, 500);
      
      toast.success(`${isShooter ? 'Shooter' : 'Keeper'} choice committed to blockchain!`);
      
    } catch (error) {
      console.error('Blockchain transaction failed:', error);
      toast.error('Transaction failed');
    }
  };
  
  return {
    gameState,
    commitChoice,
    isShooter,
    isKeeper: !isShooter
  };
};