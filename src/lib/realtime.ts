import { useState, useEffect } from 'react';

// Real-time multiplayer system using shared state
interface GameState {
  matchId: string;
  phase: 'waiting' | 'committing' | 'revealing' | 'finished';
  round: number;
  shooterScore: number;
  keeperScore: number;
  players: {
    shooter?: {
      address: string;
      committed?: boolean;
      choice?: string;
    };
    keeper?: {
      address: string;
      committed?: boolean;
      choice?: string;
    };
  };
  rounds: Array<{
    shooterChoice?: string;
    keeperChoice?: string;
    winner?: 'shooter' | 'keeper';
  }>;
}

class RealtimeGameManager {
  private gameStates = new Map<string, GameState>();
  private listeners = new Map<string, Set<(state: GameState) => void>>();

  // Initialize game
  initGame(matchId: string, shooterAddress: string, keeperAddress: string) {
    const gameState: GameState = {
      matchId,
      phase: 'committing',
      round: 1,
      shooterScore: 0,
      keeperScore: 0,
      players: {
        shooter: { address: shooterAddress },
        keeper: { address: keeperAddress }
      },
      rounds: [{}]
    };
    
    this.gameStates.set(matchId, gameState);
    this.notifyListeners(matchId, gameState);
    return gameState;
  }

  // Subscribe to game updates
  subscribe(matchId: string, callback: (state: GameState) => void) {
    if (!this.listeners.has(matchId)) {
      this.listeners.set(matchId, new Set());
    }
    this.listeners.get(matchId)!.add(callback);

    // Return current state if exists
    const currentState = this.gameStates.get(matchId);
    if (currentState) {
      callback(currentState);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.get(matchId)?.delete(callback);
    };
  }

  // Player commits choice
  commitChoice(matchId: string, playerAddress: string, choice: string) {
    const gameState = this.gameStates.get(matchId);
    if (!gameState || gameState.phase !== 'committing') return;

    // Update player commitment
    if (gameState.players.shooter?.address === playerAddress) {
      gameState.players.shooter.committed = true;
      gameState.players.shooter.choice = choice;
    } else if (gameState.players.keeper?.address === playerAddress) {
      gameState.players.keeper.committed = true;
      gameState.players.keeper.choice = choice;
    }

    // Check if both committed
    if (gameState.players.shooter?.committed && gameState.players.keeper?.committed) {
      this.resolveRound(matchId);
    }

    this.gameStates.set(matchId, gameState);
    this.notifyListeners(matchId, gameState);
  }

  // Resolve round when both players committed
  private resolveRound(matchId: string) {
    const gameState = this.gameStates.get(matchId);
    if (!gameState) return;

    const shooterChoice = gameState.players.shooter!.choice!;
    const keeperChoice = gameState.players.keeper!.choice!;
    
    // Keeper wins if they guess shooter's direction
    const keeperWins = shooterChoice === keeperChoice;
    
    // Update scores
    if (keeperWins) {
      gameState.keeperScore++;
    } else {
      gameState.shooterScore++;
    }

    // Update round result
    const currentRoundIndex = gameState.round - 1;
    gameState.rounds[currentRoundIndex] = {
      shooterChoice,
      keeperChoice,
      winner: keeperWins ? 'keeper' : 'shooter'
    };

    // Check if game finished
    if (gameState.round >= 3) {
      gameState.phase = 'finished';
    } else {
      // Next round
      gameState.round++;
      gameState.rounds.push({});
      gameState.players.shooter!.committed = false;
      gameState.players.shooter!.choice = undefined;
      gameState.players.keeper!.committed = false;
      gameState.players.keeper!.choice = undefined;
    }

    this.gameStates.set(matchId, gameState);
    this.notifyListeners(matchId, gameState);
  }

  // Get current game state
  getGameState(matchId: string): GameState | undefined {
    return this.gameStates.get(matchId);
  }

  // Notify all listeners
  private notifyListeners(matchId: string, gameState: GameState) {
    const listeners = this.listeners.get(matchId);
    if (listeners) {
      listeners.forEach(callback => callback(gameState));
    }
  }
}

// Global instance - in real app this would be on server
export const gameManager = new RealtimeGameManager();

// Hook for using realtime game state
export const useRealtimeGame = (matchId: string, playerAddress: string, opponentAddress: string) => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!matchId || !playerAddress || !opponentAddress) return;

    // Initialize game if not exists
    let currentState = gameManager.getGameState(matchId);
    if (!currentState) {
      // Determine roles based on addresses
      const isShooter = playerAddress < opponentAddress; // Simple deterministic role assignment
      currentState = gameManager.initGame(
        matchId, 
        isShooter ? playerAddress : opponentAddress,
        isShooter ? opponentAddress : playerAddress
      );
    }

    // Subscribe to updates
    const unsubscribe = gameManager.subscribe(matchId, setGameState);
    
    return unsubscribe;
  }, [matchId, playerAddress, opponentAddress]);

  const commitChoice = (choice: string) => {
    if (gameState) {
      gameManager.commitChoice(matchId, playerAddress, choice);
    }
  };

  return {
    gameState,
    commitChoice,
    isShooter: gameState?.players.shooter?.address === playerAddress,
    isKeeper: gameState?.players.keeper?.address === playerAddress
  };
};