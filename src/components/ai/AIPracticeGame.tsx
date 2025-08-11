import React, { useState, useEffect } from 'react';
import { IoRocket, IoFlash, IoCheckmark, IoClose, IoRefresh } from 'react-icons/io5';
import ModernButton from '@/components/ModernButton';

interface GameState {
  round: number;
  playerScore: number;
  aiScore: number;
  gamePhase: 'setup' | 'commit' | 'reveal' | 'finished';
  playerChoices: ('left' | 'center' | 'right')[];
  aiChoices: ('left' | 'center' | 'right')[];
  currentChoice: 'left' | 'center' | 'right' | null;
}

export default function AIPracticeGame() {
  const [gameState, setGameState] = useState<GameState>({
    round: 1,
    playerScore: 0,
    aiScore: 0,
    gamePhase: 'setup',
    playerChoices: [],
    aiChoices: [],
    currentChoice: null
  });

  const [isPlayerShooter, setIsPlayerShooter] = useState(true);
  const [gameHistory, setGameHistory] = useState<any[]>([]);

  const directions = [
    { key: 'left', label: 'Left', icon: '←' },
    { key: 'center', label: 'Center', icon: '↑' },
    { key: 'right', label: 'Right', icon: '→' }
  ] as const;

  const generateAIChoice = (): 'left' | 'center' | 'right' => {
    // Simple AI with some pattern recognition
    const choices: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
    
    // Add some randomness with slight bias based on previous rounds
    if (gameHistory.length > 0) {
      const lastPlayerChoice = gameHistory[gameHistory.length - 1]?.playerChoice;
      // AI tries to counter player's last choice 60% of the time
      if (Math.random() < 0.6 && lastPlayerChoice) {
        return lastPlayerChoice; // Keeper tries to guess where shooter will go again
      }
    }
    
    return choices[Math.floor(Math.random() * choices.length)];
  };

  const handleChoiceSelect = (choice: 'left' | 'center' | 'right') => {
    setGameState(prev => ({ ...prev, currentChoice: choice }));
  };

  const commitChoice = () => {
    if (!gameState.currentChoice) return;

    const aiChoice = generateAIChoice();
    
    setGameState(prev => ({
      ...prev,
      playerChoices: [...prev.playerChoices, prev.currentChoice!],
      aiChoices: [...prev.aiChoices, aiChoice],
      gamePhase: 'reveal'
    }));

    // Auto-reveal after 1 second
    setTimeout(() => {
      revealRound(gameState.currentChoice!, aiChoice);
    }, 1000);
  };

  const revealRound = (playerChoice: 'left' | 'center' | 'right', aiChoice: 'left' | 'center' | 'right') => {
    let playerWins = false;
    
    if (isPlayerShooter) {
      // Player is shooter, AI is keeper
      playerWins = playerChoice !== aiChoice; // Shooter wins if keeper guesses wrong
    } else {
      // Player is keeper, AI is shooter
      playerWins = playerChoice === aiChoice; // Keeper wins if they guess right
    }

    const newHistory = [...gameHistory, {
      round: gameState.round,
      playerChoice,
      aiChoice,
      playerWins,
      isPlayerShooter
    }];

    setGameHistory(newHistory);

    const newPlayerScore = gameState.playerScore + (playerWins ? 1 : 0);
    const newAiScore = gameState.aiScore + (playerWins ? 0 : 1);

    if (gameState.round === 3) {
      setGameState(prev => ({
        ...prev,
        playerScore: newPlayerScore,
        aiScore: newAiScore,
        gamePhase: 'finished'
      }));
    } else {
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          round: prev.round + 1,
          playerScore: newPlayerScore,
          aiScore: newAiScore,
          gamePhase: 'setup',
          currentChoice: null
        }));
      }, 2000);
    }
  };

  const resetGame = () => {
    setGameState({
      round: 1,
      playerScore: 0,
      aiScore: 0,
      gamePhase: 'setup',
      playerChoices: [],
      aiChoices: [],
      currentChoice: null
    });
    setGameHistory([]);
    setIsPlayerShooter(Math.random() > 0.5); // Random role assignment
  };

  const getResultText = () => {
    if (gameState.playerScore > gameState.aiScore) return "🎉 You Win!";
    if (gameState.aiScore > gameState.playerScore) return "🤖 AI Wins!";
    return "🤝 It's a Tie!";
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <IoRocket className="text-2xl text-green-600 dark:text-green-400" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Practice Mode</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Free practice against AI opponent</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600 dark:text-gray-400">Round</div>
          <div className="font-bold text-lg text-gray-900 dark:text-white">{gameState.round}/3</div>
        </div>
      </div>

      {/* Role Display */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800/50 rounded-lg px-4 py-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">You are the:</span>
          <span className={`font-bold text-sm ${isPlayerShooter ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
            {isPlayerShooter ? '⚽ Shooter' : '🥅 Keeper'}
          </span>
        </div>
      </div>

      {/* Score Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{gameState.playerScore}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">You</div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{gameState.aiScore}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">AI</div>
        </div>
      </div>

      {/* Game Phase Content */}
      {gameState.gamePhase === 'setup' && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {isPlayerShooter ? 'Choose your shot direction' : 'Predict AI\'s shot direction'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isPlayerShooter ? 'Try to avoid where the AI keeper will dive' : 'Guess where the AI will shoot'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {directions.map((direction) => (
              <button
                key={direction.key}
                onClick={() => handleChoiceSelect(direction.key)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  gameState.currentChoice === direction.key
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                  {direction.icon}
                </div>
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  {direction.label}
                </div>
              </button>
            ))}
          </div>

          {gameState.currentChoice && (
            <ModernButton
              variant="success"
              size="lg"
              className="w-full"
              onClick={commitChoice}
              icon={<IoFlash />}
            >
              Commit Choice
            </ModernButton>
          )}
        </div>
      )}

      {gameState.gamePhase === 'reveal' && (
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">Revealing choices...</div>
          <div className="flex justify-center">
            <IoFlash className="text-4xl text-yellow-500 animate-pulse" />
          </div>
        </div>
      )}

      {gameState.gamePhase === 'finished' && (
        <div className="text-center space-y-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {getResultText()}
          </div>
          
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Game Summary</h4>
            <div className="space-y-2">
              {gameHistory.map((round, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Round {round.round}:</span>
                  <div className="flex items-center space-x-2">
                    <span>You: {round.playerChoice}</span>
                    <span>AI: {round.aiChoice}</span>
                    {round.playerWins ? (
                      <IoCheckmark className="text-green-500" />
                    ) : (
                      <IoClose className="text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ModernButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={resetGame}
            icon={<IoRefresh />}
          >
            Play Again
          </ModernButton>
        </div>
      )}

      {/* Round History */}
      {gameHistory.length > 0 && gameState.gamePhase !== 'finished' && (
        <div className="mt-6 bg-white dark:bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Previous Rounds</h4>
          <div className="space-y-2">
            {gameHistory.map((round, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Round {round.round}:</span>
                <div className="flex items-center space-x-2">
                  <span>You: {round.playerChoice}</span>
                  <span>AI: {round.aiChoice}</span>
                  {round.playerWins ? (
                    <IoCheckmark className="text-green-500" />
                  ) : (
                    <IoClose className="text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}