import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { GameState, GamePhase } from '@/lib/gameState';

interface GameNotificationsProps {
  gameState: GameState;
  isShooter: boolean;
  previousPhase?: GamePhase;
}

export default function GameNotifications({ 
  gameState, 
  isShooter, 
  previousPhase 
}: GameNotificationsProps) {
  
  useEffect(() => {
    // Don't show notifications on initial load or if phase hasn't changed
    if (!previousPhase || previousPhase === gameState.gamePhase) return;
    
    const { gamePhase, round, shooterChoice, keeperChoice, roundHistory } = gameState;
    
    // Phase change notifications
    if (previousPhase !== gamePhase) {
      switch (gamePhase) {
        case 'shooter_turn':
          if (round > 1) {
            toast.success(`🔄 Round ${round} begins!`);
          }
          if (isShooter) {
            toast.success('⚽ Your turn to shoot!');
          } else {
            toast('⏳ Waiting for shooter...', { icon: '⏳' });
          }
          break;
          
        case 'keeper_turn':
          if (isShooter) {
            toast('⏳ Waiting for keeper...', { icon: '⏳' });
          } else {
            toast.success('🥅 Shooter has shot! Your turn to save!');
          }
          break;
          
        case 'round_result':
          const lastRound = roundHistory[roundHistory.length - 1];
          if (lastRound) {
            const { result, shooterChoice: sChoice, keeperChoice: kChoice } = lastRound;
            if (result === 'save') {
              toast.success(`🥅 SAVE! Keeper guessed ${kChoice.toUpperCase()}, shooter shot ${sChoice.toUpperCase()}!`);
            } else {
              toast.success(`⚽ GOAL! Shooter shot ${sChoice.toUpperCase()}, keeper guessed ${kChoice.toUpperCase()}!`);
            }
          }
          break;
          
        case 'finished':
          const shooterWon = gameState.shooterScore > gameState.keeperScore;
          const playerWon = (isShooter && shooterWon) || (!isShooter && !shooterWon);
          
          setTimeout(() => {
            if (playerWon) {
              toast.success('🏆 Congratulations! You won the match!', {
                duration: 5000,
                style: {
                  background: '#10B981',
                  color: 'white',
                },
              });
            } else {
              toast.error('😔 You lost this match. Better luck next time!', {
                duration: 5000,
                style: {
                  background: '#EF4444',
                  color: 'white',
                },
              });
            }
          }, 1000);
          break;
      }
    }
    
    // Choice notifications
    if (previousPhase === 'shooter_turn' && gamePhase === 'keeper_turn' && shooterChoice) {
      if (isShooter) {
        toast.success(`⚽ Shot taken ${shooterChoice.toUpperCase()}!`);
      }
    }
    
    if (previousPhase === 'keeper_turn' && gamePhase === 'round_result' && keeperChoice) {
      if (!isShooter) {
        toast.success(`🥅 Save attempt ${keeperChoice.toUpperCase()}!`);
      }
    }
    
  }, [gameState, isShooter, previousPhase]);

  return null; // This component only handles notifications
}