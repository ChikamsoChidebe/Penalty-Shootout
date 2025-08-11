import { useState } from 'react';
import { useRouter } from 'next/router';
import { IoFootball, IoArrowBack, IoShield } from 'react-icons/io5';
import Layout from '@/components/Layout';
import ModernButton from '@/components/ModernButton';

export default function DemoMatch() {
  const router = useRouter();
  const [round, setRound] = useState(1);
  const [shooterScore, setShooterScore] = useState(0);
  const [keeperScore, setKeeperScore] = useState(0);
  const [phase, setPhase] = useState<'shooter' | 'keeper' | 'result' | 'finished'>('shooter');
  const [shooterChoice, setShooterChoice] = useState('');
  const [keeperChoice, setKeeperChoice] = useState('');
  const [choice, setChoice] = useState('');
  const [roundHistory, setRoundHistory] = useState<Array<{round: number, shooterChoice: string, keeperChoice: string, result: string}>>([]);

  const shooterPlay = () => {
    if (!choice) return;
    setShooterChoice(choice);
    setPhase('keeper');
    setChoice('');
  };

  const keeperPlay = () => {
    if (!choice) return;
    setKeeperChoice(choice);
    
    const isGoal = shooterChoice !== choice;
    const newShooterScore = shooterScore + (isGoal ? 1 : 0);
    const newKeeperScore = keeperScore + (isGoal ? 0 : 1);
    
    setShooterScore(newShooterScore);
    setKeeperScore(newKeeperScore);
    
    const result = {
      round,
      shooterChoice,
      keeperChoice: choice,
      result: isGoal ? 'GOAL' : 'SAVE'
    };
    
    setRoundHistory(prev => [...prev, result]);
    setPhase('result');
    setChoice('');
    
    setTimeout(() => {
      if (round >= 3) {
        setPhase('finished');
      } else {
        setRound(round + 1);
        setShooterChoice('');
        setKeeperChoice('');
        setPhase('shooter');
      }
    }, 3000);
  };

  const resetGame = () => {
    setRound(1);
    setShooterScore(0);
    setKeeperScore(0);
    setPhase('shooter');
    setShooterChoice('');
    setKeeperChoice('');
    setChoice('');
    setRoundHistory([]);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push('/')} className="flex items-center space-x-2">
            <IoArrowBack />
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold">🎬 Demo Match</h1>
            <div className="text-sm text-purple-600">Perfect for Video Recording</div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Round {round}/3</div>
            <div className="font-bold">{shooterScore} - {keeperScore}</div>
            <div className="text-xs text-green-500">🔴 Demo Mode</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
          {/* Current Phase Display */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              {phase === 'shooter' ? (
                <IoFootball className="text-6xl text-green-600 animate-bounce" />
              ) : phase === 'keeper' ? (
                <IoShield className="text-6xl text-blue-600" />
              ) : phase === 'result' ? (
                <div className="text-6xl animate-pulse">
                  {roundHistory[roundHistory.length - 1]?.result === 'SAVE' ? '🥅' : '⚽'}
                </div>
              ) : (
                <div className="text-6xl">🏆</div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Round {round}/3</h2>
            
            <p className="text-lg font-medium">
              {phase === 'shooter' && '⚽ Shooter\'s Turn - Choose Direction!'}
              {phase === 'keeper' && '🥅 Keeper\'s Turn - Guess the Shot!'}
              {phase === 'result' && `${roundHistory[roundHistory.length - 1]?.result}! Next round starting...`}
              {phase === 'finished' && '🏁 Match Finished!'}
            </p>
          </div>

          {/* Score Display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{shooterScore}</div>
                <div className="text-sm text-gray-600">⚽ Shooter</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-2xl font-bold text-gray-400">VS</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{keeperScore}</div>
                <div className="text-sm text-gray-600">🥅 Keeper</div>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          {(phase === 'shooter' || phase === 'keeper') && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {['left', 'center', 'right'].map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setChoice(dir)}
                    className={`p-6 rounded-lg border-2 transition-all transform hover:scale-105 ${
                      choice === dir ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' : 
                      'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">
                      {dir === 'left' && '⬅️'}
                      {dir === 'center' && '⬆️'}
                      {dir === 'right' && '➡️'}
                    </div>
                    <div className="capitalize font-medium">{dir}</div>
                  </button>
                ))}
              </div>

              <ModernButton
                onClick={phase === 'shooter' ? shooterPlay : keeperPlay}
                disabled={!choice}
                variant="primary"
                size="lg"
                className="w-full mb-6"
              >
                {!choice ? 'Select Direction' : 
                 phase === 'shooter' ? `Shoot ${choice.toUpperCase()}! ⚽` : 
                 `Save ${choice.toUpperCase()}! 🥅`}
              </ModernButton>
            </>
          )}

          {/* Game Finished */}
          {phase === 'finished' && (
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {shooterScore > keeperScore ? '⚽' : shooterScore < keeperScore ? '🥅' : '🤝'}
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {shooterScore > keeperScore ? 'Shooter Wins!' : 
                 shooterScore < keeperScore ? 'Keeper Wins!' : 'It\'s a Tie!'}
              </h2>
              <div className="text-lg mb-6">
                Final Score: {shooterScore} - {keeperScore}
              </div>
              <div className="space-x-4">
                <ModernButton onClick={resetGame} variant="primary" size="lg">
                  Play Again
                </ModernButton>
                <ModernButton onClick={() => router.push('/')} variant="secondary" size="lg">
                  Back to Home
                </ModernButton>
              </div>
            </div>
          )}

          {/* Round History */}
          {roundHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-bold mb-4 text-center">📊 Round History</h3>
              <div className="space-y-2">
                {roundHistory.map((round, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium">Round {round.round}</span>
                    <div className="flex items-center space-x-4 text-sm">
                      <span>Shooter: {round.shooterChoice.toUpperCase()}</span>
                      <span>Keeper: {round.keeperChoice.toUpperCase()}</span>
                      <span className={`font-bold ${
                        round.result === 'SAVE' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {round.result === 'SAVE' ? '🥅 SAVE' : '⚽ GOAL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Demo Instructions */}
          <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-2">🎬 Demo Mode Instructions</h4>
            <div className="text-sm text-purple-600 dark:text-purple-400 space-y-1">
              <p>• This is a single-browser demo perfect for recording</p>
              <p>• Play as shooter first, then switch to keeper</p>
              <p>• All moves are instant with immediate results</p>
              <p>• Perfect for showcasing the penalty shootout gameplay</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}