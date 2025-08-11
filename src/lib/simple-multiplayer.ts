import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Simple cross-browser state using localStorage + polling
interface GameState {
  matchId: string;
  round: number;
  shooterScore: number;
  keeperScore: number;
  shooterCommitted: boolean;
  keeperCommitted: boolean;
  shooterChoice?: string;
  keeperChoice?: string;
  phase: 'playing' | 'finished';
  lastUpdate: number;
}

export const useSimpleMultiplayer = (matchId: string, isShooter: boolean) => {
  const [gameState, setGameState] = useState<GameState>({
    matchId,
    round: 1,
    shooterScore: 0,
    keeperScore: 0,
    shooterCommitted: false,
    keeperCommitted: false,
    phase: 'playing',
    lastUpdate: Date.now()
  });

  const storageKey = `game_${matchId}`;

  // Load and sync state
  useEffect(() => {
    // Load existing state
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setGameState(JSON.parse(saved));
    }

    // Poll for updates every 1 second
    const interval = setInterval(() => {
      const current = localStorage.getItem(storageKey);
      if (current) {
        const parsed = JSON.parse(current);
        if (parsed.lastUpdate > gameState.lastUpdate) {
          setGameState(parsed);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [storageKey]);

  const saveState = (newState: GameState) => {
    newState.lastUpdate = Date.now();
    localStorage.setItem(storageKey, JSON.stringify(newState));
    setGameState(newState);
  };

  const commitChoice = (choice: string) => {
    const newState = { ...gameState };
    
    if (isShooter) {
      newState.shooterCommitted = true;
      newState.shooterChoice = choice;
    } else {
      newState.keeperCommitted = true;
      newState.keeperChoice = choice;
    }

    // Check if both committed
    if (newState.shooterCommitted && newState.keeperCommitted && newState.shooterChoice && newState.keeperChoice) {
      // Resolve round
      const keeperWins = newState.shooterChoice === newState.keeperChoice;
      
      if (keeperWins) {
        newState.keeperScore++;
        toast.success(`🥅 SAVE! Keeper guessed ${newState.keeperChoice.toUpperCase()}, shooter shot ${newState.shooterChoice.toUpperCase()}!`);
      } else {
        newState.shooterScore++;
        toast.success(`⚽ GOAL! Shooter shot ${newState.shooterChoice.toUpperCase()}, keeper guessed ${newState.keeperChoice.toUpperCase()}!`);
      }

      // Check if game finished
      if (newState.round >= 3) {
        newState.phase = 'finished';
      } else {
        // Next round
        setTimeout(() => {
          const nextState = {
            ...newState,
            round: newState.round + 1,
            shooterCommitted: false,
            keeperCommitted: false,
            shooterChoice: undefined,
            keeperChoice: undefined,
            lastUpdate: Date.now()
          };
          saveState(nextState);
          toast.success(`Round ${newState.round} complete! Starting Round ${nextState.round}`);
        }, 2000);
      }
    }

    saveState(newState);
  };

  return {
    gameState,
    commitChoice
  };
};