import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { toast } from 'react-hot-toast';
import { IoFootball, IoArrowBack, IoTrophy } from 'react-icons/io5';

import Layout from '@/components/Layout';
import { supabaseAPI } from '@/lib/supabase';

type Choice = 'left' | 'center' | 'right';

// Smart AI that analyzes player patterns
function generateSmartAIChoice(previousRounds: Array<{playerChoice: Choice; aiChoice: Choice; playerWon: boolean}>, currentPlayerChoice: Choice): Choice {
  const choices: Choice[] = ['left', 'center', 'right'];
  
  // If no previous rounds, use weighted random (favor center)
  if (previousRounds.length === 0) {
    const weights = [0.25, 0.5, 0.25]; // Favor center
    const random = Math.random();
    if (random < weights[0]) return 'left';
    if (random < weights[0] + weights[1]) return 'center';
    return 'right';
  }
  
  // Analyze player patterns
  const playerChoiceCount = {
    left: previousRounds.filter(r => r.playerChoice === 'left').length,
    center: previousRounds.filter(r => r.playerChoice === 'center').length,
    right: previousRounds.filter(r => r.playerChoice === 'right').length
  };
  
  // Find player's most used direction
  const mostUsedChoice = Object.entries(playerChoiceCount)
    .sort(([,a], [,b]) => b - a)[0][0] as Choice;
  
  // AI strategy: 60% chance to guess player's favorite, 40% random
  if (Math.random() < 0.6) {
    return mostUsedChoice;
  } else {
    // Random choice weighted against player's pattern
    const availableChoices = choices.filter(c => c !== mostUsedChoice);
    return availableChoices[Math.floor(Math.random() * availableChoices.length)];
  }
}

interface AIMatch {
  id: string;
  creator: string;
  stake: string;
  isAI: boolean;
  playerScore: number;
  aiScore: number;
  currentRound: number;
  gamePhase: 'playing' | 'finished';
  rounds: Array<{
    playerChoice: Choice;
    aiChoice: Choice;
    playerWon: boolean;
  }>;
}

export default function MatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const { address, isConnected } = useAccount();
  
  const [match, setMatch] = useState<AIMatch | null>(null);
  const [currentChoice, setCurrentChoice] = useState<Choice | null>(null);
  const [loading, setLoading] = useState(true);

  // Load match
  useEffect(() => {
    if (!router.isReady || !id || !address) return;
    
    const loadMatch = async () => {
      try {
        const dbMatch = await supabaseAPI.getMatch(id as string);
        if (!dbMatch) {
          toast.error('Match not found');
          router.push('/');
          return;
        }

        // Check if it's an AI match
        if (dbMatch.opponent_address === 'AI_OPPONENT') {
          setMatch({
            id: dbMatch.id,
            creator: dbMatch.creator_address,
            stake: dbMatch.stake_amount.toString(),
            isAI: true,
            playerScore: 0,
            aiScore: 0,
            currentRound: 1,
            gamePhase: 'playing',
            rounds: []
          });
        } else {
          toast.error('This is not an AI match');
          router.push('/');
        }
      } catch (error) {
        console.error('Error loading match:', error);
        toast.error('Failed to load match');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [id, address, router]);

  const handleShoot = async () => {
    if (!currentChoice || !match || !address) {
      toast.error('Please select a direction');
      return;
    }

    // Generate strategic AI choice
    const aiChoice = generateSmartAIChoice(match.rounds, currentChoice);
    
    // Player wins if AI guesses wrong
    const playerWon = currentChoice !== aiChoice;
    
    // Update match state
    const newRound = {
      playerChoice: currentChoice,
      aiChoice,
      playerWon
    };

    const updatedMatch = {
      ...match,
      rounds: [...match.rounds, newRound],
      playerScore: match.playerScore + (playerWon ? 1 : 0),
      aiScore: match.aiScore + (playerWon ? 0 : 1),
      currentRound: match.currentRound + 1
    };

    // Show round result
    if (playerWon) {
      toast.success(`⚽ GOAL! AI went ${aiChoice.toUpperCase()}, you shot ${currentChoice.toUpperCase()}!`);
    } else {
      toast.error(`🥅 SAVED! AI guessed right - both chose ${currentChoice.toUpperCase()}!`);
    }

    // Check if game is finished
    if (updatedMatch.currentRound > 3) {
      updatedMatch.gamePhase = 'finished';
      
      // Update database
      try {
        const winner = updatedMatch.playerScore > updatedMatch.aiScore ? address : 'AI_OPPONENT';
        await supabaseAPI.finishMatch(match.id, winner, { rounds: updatedMatch.rounds });
        await supabaseAPI.getOrCreatePlayer(address);
        
        // Show final result
        setTimeout(() => {
          if (updatedMatch.playerScore > updatedMatch.aiScore) {
            const winnings = parseFloat(match.stake) * 2 * 0.99;
            toast.success(`🏆 You won ${winnings.toFixed(4)} ETH!`);
          } else if (updatedMatch.aiScore > updatedMatch.playerScore) {
            toast.error('🤖 AI won this match!');
          } else {
            toast('🤝 It\'s a tie!');
          }
        }, 1500);
      } catch (error) {
        console.error('Error updating match:', error);
      }
    }

    setMatch(updatedMatch);
    setCurrentChoice(null);
  };

  if (!isConnected || !address) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet to Play</h1>
          <ConnectButton />
        </div>
      </Layout>
    );
  }

  if (loading || !match) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Match...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>AI Match #{id} - Penalty Shootout Duel</title>
      </Head>

      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <IoArrowBack />
              <span>Back to Matches</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold">AI Match #{id}</h1>
              <div className="text-sm text-gray-500">
                Stake: {match.stake} ETH • Winner gets {(parseFloat(match.stake) * 2 * 0.99).toFixed(4)} ETH
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Round {match.currentRound}/3</div>
              <div className="text-lg font-bold">{match.playerScore} - {match.aiScore}</div>
            </div>
          </div>

          {match.gamePhase === 'playing' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <IoFootball className="text-6xl mx-auto mb-4 text-primary-600" />
                <h2 className="text-3xl font-bold mb-2">Round {match.currentRound}</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose where to shoot! The AI keeper will try to guess your direction.
                </p>
              </div>

              {/* Choice Buttons */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {(['left', 'center', 'right'] as Choice[]).map((choice) => (
                  <button
                    key={choice}
                    onClick={() => setCurrentChoice(choice)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      currentChoice === choice
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">
                      {choice === 'left' && '⬅️'}
                      {choice === 'center' && '⬆️'}
                      {choice === 'right' && '➡️'}
                    </div>
                    <div className="font-medium capitalize">{choice}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleShoot}
                disabled={!currentChoice}
                className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {currentChoice ? `Shoot ${currentChoice.toUpperCase()}!` : 'Select Direction'}
              </button>
            </div>
          )}

          {match.gamePhase === 'finished' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">
                {match.playerScore > match.aiScore ? '🏆' : match.aiScore > match.playerScore ? '😔' : '🤝'}
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                {match.playerScore > match.aiScore ? 'Victory!' : match.aiScore > match.playerScore ? 'Defeat!' : 'Draw!'}
              </h2>
              
              <div className="text-2xl font-bold mb-6">
                Final Score: {match.playerScore} - {match.aiScore}
              </div>

              {match.playerScore > match.aiScore && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6">
                  <IoTrophy className="text-3xl text-yellow-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    You won {(parseFloat(match.stake) * 2 * 0.99).toFixed(4)} ETH!
                  </div>
                </div>
              )}

              {/* Round breakdown */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
                <h3 className="font-bold mb-3">Round Breakdown:</h3>
                <div className="space-y-2">
                  {match.rounds.map((round, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>Round {index + 1}:</span>
                      <span>You: {round.playerChoice.toUpperCase()} vs AI: {round.aiChoice.toUpperCase()}</span>
                      <span className={round.playerWon ? 'text-green-600' : 'text-red-600'}>
                        {round.playerWon ? 'Goal!' : 'Saved!'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => router.push('/')}
                  className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* Game Rules */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Play:</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• You are the shooter, AI is the keeper</li>
              <li>• Choose Left, Center, or Right for each shot</li>
              <li>• You score if the AI keeper guesses wrong</li>
              <li>• Best of 3 rounds wins the match</li>
            </ul>
          </div>
        </div>
      </Layout>
    </>
  );
}