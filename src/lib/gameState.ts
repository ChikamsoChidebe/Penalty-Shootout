import { useState, useEffect, useCallback } from 'react';

export type GamePhase = 'waiting' | 'shooter_turn' | 'keeper_turn' | 'round_result' | 'finished';

export interface GameState {
  round: number;
  shooterScore: number;
  keeperScore: number;
  gamePhase: GamePhase;
  shooterChoice: string;
  keeperChoice: string;
  lastUpdate: number;
  roundHistory: Array<{
    round: number;
    shooterChoice: string;
    keeperChoice: string;
    result: 'goal' | 'save';
  }>;
}

export const useGameState = (matchId: string | string[] | undefined) => {
  const gameKey = `match_${matchId}_game`;
  const syncKey = `match_${matchId}_sync`;
  const roleKey = `match_${matchId}_player_role`;
  
  const [gameState, setGameState] = useState<GameState>({
    round: 1,
    shooterScore: 0,
    keeperScore: 0,
    gamePhase: 'waiting',
    shooterChoice: '',
    keeperChoice: '',
    lastUpdate: Date.now(),
    roundHistory: []
  });

  // Initialize game state (only if no existing state)
  const initializeGame = useCallback(() => {
    const saved = localStorage.getItem(gameKey);
    if (saved) {
      try {
        const parsedState = JSON.parse(saved) as GameState;
        console.log('💾 Game already exists, loading:', parsedState.gamePhase);
        setGameState(parsedState);
        return;
      } catch (error) {
        console.error('Failed to parse saved game state:', error);
      }
    }
    
    // Only create new game if none exists
    const initialState: GameState = {
      round: 1,
      shooterScore: 0,
      keeperScore: 0,
      gamePhase: 'shooter_turn',
      shooterChoice: '',
      keeperChoice: '',
      lastUpdate: Date.now(),
      roundHistory: []
    };
    
    console.log('🆕 Creating new game state');
    localStorage.setItem(gameKey, JSON.stringify(initialState));
    setGameState(initialState);
  }, [gameKey]);

  // Update game state with selective sync (no role data)
  const updateGameState = useCallback((newState: Partial<GameState>) => {
    setGameState(prevState => {
      const updatedState = {
        ...prevState,
        ...newState,
        lastUpdate: Date.now()
      };
      
      console.log('💾 Updating game state:', updatedState);
      localStorage.setItem(gameKey, JSON.stringify(updatedState));
      
      // Only broadcast game state changes, never role data
      const syncData = {
        round: updatedState.round,
        shooterScore: updatedState.shooterScore,
        keeperScore: updatedState.keeperScore,
        gamePhase: updatedState.gamePhase,
        shooterChoice: updatedState.shooterChoice,
        keeperChoice: updatedState.keeperChoice,
        lastUpdate: updatedState.lastUpdate,
        roundHistory: updatedState.roundHistory,
        timestamp: Date.now()
      };
      
      localStorage.setItem(syncKey, JSON.stringify(syncData));
      
      // Immediate cross-browser sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: gameKey,
        newValue: JSON.stringify(updatedState)
      }));
      
      return updatedState;
    });
  }, [gameKey, syncKey]);

  // Reset game state
  const resetGame = useCallback(() => {
    const initialState: GameState = {
      round: 1,
      shooterScore: 0,
      keeperScore: 0,
      gamePhase: 'shooter_turn',
      shooterChoice: '',
      keeperChoice: '',
      lastUpdate: Date.now(),
      roundHistory: []
    };
    localStorage.setItem(gameKey, JSON.stringify(initialState));
    setGameState(initialState);
  }, [gameKey]);

  // Simple cross-browser sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === gameKey && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue) as GameState;
          if (!newState.roundHistory) newState.roundHistory = [];
          console.log('🔄 Storage sync:', newState.gamePhase);
          setGameState(newState);
        } catch (error) {
          console.error('Failed to sync game state:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [gameKey]);
  
  // Load existing game state on mount
  useEffect(() => {
    const loadExistingState = () => {
      const saved = localStorage.getItem(gameKey);
      if (saved) {
        try {
          const parsedState = JSON.parse(saved) as GameState;
          console.log('💾 Loading existing game state:', parsedState.gamePhase);
          setGameState(parsedState);
        } catch (error) {
          console.error('Failed to load existing game state:', error);
        }
      }
    };
    
    loadExistingState();
  }, [gameKey]);

  // Sync disabled to prevent role interference - each browser manages its own state

  return {
    gameState,
    updateGameState,
    initializeGame,
    resetGame
  };
};