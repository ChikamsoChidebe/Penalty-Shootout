import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { IoFootball, IoArrowBack, IoShield, IoTime, IoTrophy } from 'react-icons/io5';
import Layout from '@/components/Layout';
import ModernButton from '@/components/ModernButton';
import GameNotifications from '@/components/GameNotifications';
import RoleDisplay from '@/components/RoleDisplay';
import SyncButton from '@/components/SyncButton';
import GameStateDebug from '@/components/GameStateDebug';
import RoleVerification from '@/components/RoleVerification';
import CrossBrowserSyncTest from '@/components/CrossBrowserSyncTest';
import KeeperDebug from '@/components/KeeperDebug';
import { useMatchData } from '@/lib/contract';
import { useGameState, GamePhase } from '@/lib/gameState';
import { useRoleManager, PlayerRole } from '@/lib/roleManager';

export default function MatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const { address } = useAccount();
  
  const [choice, setChoice] = useState('');
  const [isShooter, setIsShooter] = useState(false);
  const [matchLoaded, setMatchLoaded] = useState(false);
  const [playerNames, setPlayerNames] = useState({ creator: '', opponent: '' });
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [toastShown, setToastShown] = useState(false);
  const [roleFixed, setRoleFixed] = useState(false);
  
  // Use role manager for complete role isolation
  const roleManager = useRoleManager(id);
  const previousPhaseRef = useRef<GamePhase>();
  
  // Get blockchain match data with polling
  const { data: matchData, refetch, isLoading, error } = useMatchData(id ? BigInt(id as string) : undefined);
  
  // Use game state hook
  const { gameState: hookGameState, updateGameState, initializeGame } = useGameState(id);
  
  // Keeper-specific game state
  const [keeperGameState, setKeeperGameState] = useState(hookGameState);
  const gameState = isShooter ? hookGameState : keeperGameState;
  
  // Keeper sync - immediate load + polling
  useEffect(() => {
    if (!roleFixed || isShooter || !id) return;
    
    const keeperSync = () => {
      const gameKey = `match_${id}_game`;
      const saved = localStorage.getItem(gameKey);
      if (saved) {
        try {
          const savedState = JSON.parse(saved);
          
          // Skip corrupted test data
          if (savedState.gamePhase === 'test_phase' || savedState.testTrigger) {
            console.log('🧪 Skipping corrupted test data');
            return;
          }
          
          if (!savedState.roundHistory) savedState.roundHistory = [];
          console.log('🥅 Keeper sync:', savedState.gamePhase, 'Round:', savedState.round);
          
          // Update keeper-specific state
          setKeeperGameState({
            ...savedState,
            lastUpdate: Date.now()
          });
        } catch (error) {
          console.error('Keeper sync error:', error);
        }
      }
    };
    
    // Immediate sync when keeper role is fixed
    keeperSync();
    
    // Then sync every 2 seconds
    const interval = setInterval(keeperSync, 2000);
    return () => clearInterval(interval);
  }, [roleFixed, isShooter, id]);
  
  // Sync keeper state with hook state initially
  useEffect(() => {
    if (!isShooter) {
      setKeeperGameState(hookGameState);
    }
  }, [hookGameState, isShooter]);
  
  // Force re-render when game state changes
  useEffect(() => {
    console.log('🔄 Game state updated:', gameState);
    // Update previous phase ref for notifications
    if (gameState.gamePhase !== previousPhaseRef.current) {
      previousPhaseRef.current = gameState.gamePhase;
    }
  }, [gameState]);
  
  // Initialize role from role manager
  useEffect(() => {
    if (roleManager && matchLoaded && !roleFixed) {
      const existingRole = roleManager.getRole();
      if (existingRole) {
        const shouldBeShooter = existingRole === 'shooter';
        console.log('🔒 Role manager loaded role:', existingRole);
        setIsShooter(shouldBeShooter);
        setRoleFixed(true);
      }
    }
  }, [roleManager, matchLoaded, roleFixed]);
  
  // Loading timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!matchLoaded) {
        console.log('⏰ Loading timeout, forcing match load');
        setLoadingTimeout(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [matchLoaded]);

  // Determine player role and initialize game
  useEffect(() => {
    console.log('🔍 Match data check:', { matchData, address, id });
    
    // Check for test role override first
    const testRole = localStorage.getItem('test_role');
    if (testRole && id && address) {
      console.log('🧪 Using test role:', testRole);
      const shooterRole = testRole === 'shooter';
      setIsShooter(shooterRole);
      
      // Store test role via role manager
      const testRoleString: PlayerRole = shooterRole ? 'shooter' : 'keeper';
      if (roleManager && roleManager.setRole(testRoleString)) {
        setRoleFixed(true);
        console.log('🧪 Test role LOCKED via RoleManager:', testRoleString);
      }
      
      setPlayerNames({
        creator: 'Test Creator',
        opponent: 'Test Opponent'
      });
      setMatchLoaded(true);
      initializeGame();
      localStorage.removeItem('test_role');
      return;
    }
    
    if (matchData && address && id) {
      console.log('📊 Raw match data:', matchData);
      
      // Handle different possible data structures
      let creator, opponent;
      
      if (Array.isArray(matchData) && matchData.length >= 2) {
        creator = matchData[0];
        opponent = matchData[1];
      } else if (matchData && typeof matchData === 'object') {
        creator = (matchData as any).creator || (matchData as any)[0];
        opponent = (matchData as any).opponent || (matchData as any)[1];
      }
      
      console.log('👥 Players:', { creator, opponent });
      
      // For testing, allow single player or missing opponent
      if (!creator) {
        console.log('❌ No creator found');
        return;
      }
      
      // If no opponent, still allow role assignment for creator
      if (!opponent || opponent === '0x0000000000000000000000000000000000000000') {
        console.log('⚠️ No opponent yet, but setting creator role');
        
        // If current user is creator, set as shooter
        if (creator?.toLowerCase() === address.toLowerCase()) {
          if (roleManager && roleManager.setRole('shooter')) {
            setIsShooter(true);
            setRoleFixed(true);
            setPlayerNames({
              creator: creator.slice(0, 6) + '...',
              opponent: 'Waiting...'
            });
            setMatchLoaded(true);
            initializeGame();
            console.log('🔒 Creator role set via RoleManager: SHOOTER');
          }
        }
        return;
      }
      
      const isCreator = creator?.toLowerCase() === address.toLowerCase();
      const isOpponent = opponent?.toLowerCase() === address.toLowerCase();
      
      console.log('🎯 Role check:', { isCreator, isOpponent, address });
      
      if (!isCreator && !isOpponent) {
        if (!toastShown) {
          toast.error('You are not a player in this match!');
          setToastShown(true);
        }
        router.push('/');
        return;
      }
      
      // Creator = Shooter, Opponent = Keeper (ALWAYS)
      const shooterRole = isCreator;
      const roleString: PlayerRole = shooterRole ? 'shooter' : 'keeper';
      
      console.log('🎯 Setting role:', roleString, 'for address:', address);
      
      // Use role manager to set role permanently
      if (roleManager && roleManager.setRole(roleString)) {
        setIsShooter(shooterRole);
        setRoleFixed(true);
        console.log('🔒 Role LOCKED via RoleManager:', roleString);
      }
      
      setPlayerNames({
        creator: creator.slice(0, 6) + '...',
        opponent: opponent.slice(0, 6) + '...'
      });
      setMatchLoaded(true);
      
      // Clean up any test data first
      const gameKey = `match_${id}_game`;
      const saved = localStorage.getItem(gameKey);
      if (saved) {
        try {
          const savedState = JSON.parse(saved);
          if (savedState.gamePhase === 'test_phase' || savedState.testTrigger) {
            console.log('🧪 Clearing corrupted test data');
            localStorage.removeItem(gameKey);
          }
        } catch (error) {
          console.log('🧪 Clearing corrupted localStorage');
          localStorage.removeItem(gameKey);
        }
      }
      
      // Initialize game state
      initializeGame();
      
      console.log('🔒 Role locked:', shooterRole ? 'SHOOTER' : 'KEEPER');
      
      console.log('🎯 Match initialized:', {
        matchId: id,
        creator,
        opponent,
        currentPlayer: address,
        isCreator,
        isOpponent,
        role: isCreator ? 'SHOOTER' : 'KEEPER'
      });
    } else if (id && address) {
      // Fallback for when match data is not available
      console.log('🔄 Match data not available, using fallback');
      setTimeout(() => {
        // For fallback, assume first visitor is creator (shooter)
        const fallbackRole = localStorage.getItem(`match_${id}_fallback_role`) || 'creator';
        if (fallbackRole === 'creator') {
          if (roleManager && roleManager.setRole('shooter')) {
            setIsShooter(true);
            setRoleFixed(true);
            localStorage.setItem(`match_${id}_fallback_role`, 'opponent'); // Next visitor will be opponent
            console.log('🔒 Fallback role set via RoleManager: SHOOTER');
          }
        } else {
          if (roleManager && roleManager.setRole('keeper')) {
            setIsShooter(false);
            setRoleFixed(true);
            console.log('🔒 Fallback role set via RoleManager: KEEPER');
          }
        }
        setRoleFixed(true);
        setPlayerNames({
          creator: 'Player 1',
          opponent: 'Player 2'
        });
        setMatchLoaded(true);
        initializeGame();
      }, 2000);
    }
  }, [matchData, address, id, router, initializeGame]);

  const shooterPlay = () => {
    if (!choice || gameState.gamePhase !== 'shooter_turn') return;

    previousPhaseRef.current = gameState.gamePhase;
    console.log('⚽ Shooter playing:', choice);
    
    const newState = {
      gamePhase: 'keeper_turn' as GamePhase,
      shooterChoice: choice
    };
    
    updateGameState(newState);
    
    // Also update localStorage directly for keeper sync
    setTimeout(() => {
      const gameKey = `match_${id}_game`;
      const fullState = {
        ...gameState,
        ...newState,
        lastUpdate: Date.now()
      };
      localStorage.setItem(gameKey, JSON.stringify(fullState));
      console.log('🚀 Direct localStorage update for keeper');
    }, 100);
    
    setChoice('');
  };

  const keeperPlay = () => {
    if (!choice || gameState.gamePhase !== 'keeper_turn') return;

    const shooterMove = gameState.shooterChoice;
    const keeperMove = choice;
    
    // Compare choices and determine result
    const keeperWins = shooterMove === keeperMove;
    const newShooterScore = gameState.shooterScore + (keeperWins ? 0 : 1);
    const newKeeperScore = gameState.keeperScore + (keeperWins ? 1 : 0);
    
    // Add to round history
    const roundResult = {
      round: gameState.round,
      shooterChoice: shooterMove,
      keeperChoice: keeperMove,
      result: keeperWins ? 'save' as const : 'goal' as const
    };
    
    // Show immediate result
    previousPhaseRef.current = gameState.gamePhase;
    updateGameState({
      gamePhase: 'round_result',
      keeperChoice: keeperMove,
      shooterScore: newShooterScore,
      keeperScore: newKeeperScore,
      roundHistory: [...gameState.roundHistory, roundResult]
    });
    
    setChoice('');

    // Move to next round or finish game
    setTimeout(() => {
      const nextRound = gameState.round + 1;
      const gameFinished = nextRound > 3;
      
      if (gameFinished) {
        previousPhaseRef.current = 'round_result';
        updateGameState({
          gamePhase: 'finished'
        });
      } else {
        previousPhaseRef.current = 'round_result';
        updateGameState({
          round: nextRound,
          gamePhase: 'shooter_turn',
          shooterChoice: '',
          keeperChoice: ''
        });
      }
    }, 2500);
  };

  const canPlay = () => {
    if (isShooter && gameState.gamePhase === 'shooter_turn') return true;
    if (!isShooter && gameState.gamePhase === 'keeper_turn') return true;
    return false;
  };

  const getStatusMessage = () => {
    switch (gameState.gamePhase) {
      case 'waiting':
        return 'Waiting for opponent to join...';
      case 'shooter_turn':
        return isShooter ? '⚽ Your turn to shoot!' : '⏳ Waiting for shooter...';
      case 'keeper_turn':
        return isShooter ? '⏳ Waiting for keeper...' : '🥅 Shooter has shot! Your turn to save!';
      case 'round_result':
        return '📊 Round complete! Calculating scores...';
      case 'finished':
        return '🏁 Game Finished!';
      default:
        return '';
    }
  };

  const getButtonText = () => {
    if (!choice) return 'Select Direction';
    if (isShooter && gameState.gamePhase === 'shooter_turn') return `Shoot ${choice.toUpperCase()}! ⚽`;
    if (!isShooter && gameState.gamePhase === 'keeper_turn') return `Save ${choice.toUpperCase()}! 🥅`;
    return 'Wait...';
  };

  const getPhaseColor = () => {
    if (gameState.gamePhase === 'finished') return 'text-purple-600';
    if (canPlay()) return 'text-green-600';
    return 'text-orange-600';
  };

  if (!matchLoaded) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin text-4xl mb-4">⚽</div>
          <h1 className="text-2xl font-bold mb-4">Loading Match...</h1>
          <p className="text-gray-600 mb-4">Determining player roles and initializing game...</p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">Error loading match: {error.message}</p>
            </div>
          )}
          
          {loadingTimeout && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-600 text-sm mb-2">Taking longer than expected...</p>
              <div className="space-y-2">
                <ModernButton
                  onClick={() => {
                    localStorage.setItem(`match_${id}_fallback_role`, 'creator');
                    if (roleManager && roleManager.setRole('shooter')) {
                      setIsShooter(true);
                      setRoleFixed(true);
                      setPlayerNames({ creator: 'You (Shooter)', opponent: 'Waiting...' });
                      setMatchLoaded(true);
                      initializeGame();
                      console.log('🔒 Manual role set via RoleManager: SHOOTER');
                    }
                  }}
                  variant="primary"
                  size="sm"
                >
                  ⚽ Start as Shooter (Creator)
                </ModernButton>
                <ModernButton
                  onClick={() => {
                    localStorage.setItem(`match_${id}_fallback_role`, 'opponent');
                    if (roleManager && roleManager.setRole('keeper')) {
                      setIsShooter(false);
                      setRoleFixed(true);
                      setPlayerNames({ creator: 'Creator', opponent: 'You (Keeper)' });
                      setMatchLoaded(true);
                      initializeGame();
                      console.log('🔒 Manual role set via RoleManager: KEEPER');
                    }
                  }}
                  variant="secondary"
                  size="sm"
                >
                  🥅 Start as Keeper (Opponent)
                </ModernButton>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-4">
            <p>Match ID: {id}</p>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Data: {matchData ? 'Available' : 'None'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <GameNotifications 
        gameState={gameState} 
        isShooter={isShooter} 
        previousPhase={previousPhaseRef.current} 
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push('/')} className="flex items-center space-x-2">
            <IoArrowBack />
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold">Match #{id}</h1>
            <div className="text-sm text-blue-600">
              You are the {isShooter ? 'SHOOTER' : 'KEEPER'} 
              {roleFixed && <span className="text-green-600 ml-1">🔒</span>}
            </div>
            {matchData && Array.isArray(matchData) && matchData.length >= 2 && (
              <div className="text-xs text-gray-500 mt-1">
                Creator: {matchData[0]?.slice(0, 6)}... | Opponent: {matchData[1]?.slice(0, 6)}...
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2 mb-1">
              <div className="text-sm text-gray-600">Round {gameState.round}/3</div>
              <SyncButton matchId={id} onSync={() => window.location.reload()} />
            </div>
            <div className="font-bold">{gameState.shooterScore} - {gameState.keeperScore}</div>
            <div className="text-xs text-gray-500">
              {gameState.gamePhase === 'finished' ? '🏁 Finished' : 
               gameState.gamePhase === 'round_result' ? '📊 Scoring' : '🔴 Live'}
            </div>
            <div className="text-xs text-blue-500 mt-1">
              Last update: {new Date(gameState.lastUpdate).toLocaleTimeString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Phase: {gameState.gamePhase} | Shooter: {gameState.shooterChoice || 'none'}
            </div>
            <div className="text-xs text-purple-500 mt-1">
              Role: {isShooter ? 'SHOOTER' : 'KEEPER'} | Sync: {roleFixed ? 'Active' : 'Waiting'}
            </div>
            {gameState.gamePhase === 'test_phase' && (
              <button 
                onClick={() => {
                  const gameKey = `match_${id}_game`;
                  localStorage.removeItem(gameKey);
                  window.location.reload();
                }}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded mt-1"
              >
                Clear Corrupted Data
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
          {/* Role Display */}
          <RoleDisplay 
            isShooter={isShooter} 
            playerNames={playerNames} 
            currentAddress={address} 
          />

          {/* Game Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              {isShooter ? (
                <IoFootball className="text-6xl text-green-600 animate-bounce" />
              ) : (
                <IoShield className="text-6xl text-blue-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">Round {gameState.round}/3</h2>
            <p className={`text-lg font-medium ${getPhaseColor()}`}>{getStatusMessage()}</p>
          </div>

          {/* Live Score Display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{gameState.shooterScore}</div>
                <div className="text-sm text-gray-600">⚽ Shooter</div>
                <div className="text-xs text-gray-500">{playerNames.creator}</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-2xl font-bold text-gray-400">VS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{gameState.keeperScore}</div>
                <div className="text-sm text-gray-600">🥅 Keeper</div>
                <div className="text-xs text-gray-500">{playerNames.opponent}</div>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          {gameState.gamePhase !== 'finished' && gameState.gamePhase !== 'round_result' && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {['left', 'center', 'right'].map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setChoice(dir)}
                    disabled={!canPlay()}
                    className={`p-6 rounded-lg border-2 transition-all transform hover:scale-105 ${
                      choice === dir ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' : 
                      canPlay() ? 'border-gray-300 hover:border-blue-300 hover:bg-gray-50' : 
                      'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
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
                onClick={isShooter ? shooterPlay : keeperPlay}
                disabled={!choice || !canPlay()}
                variant="primary"
                size="lg"
                className="w-full mb-6"
              >
                {getButtonText()}
              </ModernButton>
            </>
          )}

          {/* Round Result Display */}
          {gameState.gamePhase === 'round_result' && (
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-pulse">
                {gameState.roundHistory && gameState.roundHistory[gameState.roundHistory.length - 1]?.result === 'save' ? '🥅' : '⚽'}
              </div>
              <h3 className="text-xl font-bold mb-2">
                {gameState.roundHistory && gameState.roundHistory[gameState.roundHistory.length - 1]?.result === 'save' ? 'SAVE!' : 'GOAL!'}
              </h3>
              <p className="text-gray-600">Preparing next round...</p>
            </div>
          )}

          {/* Game Finished */}
          {gameState.gamePhase === 'finished' && (
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {((isShooter && gameState.shooterScore > gameState.keeperScore) || 
                  (!isShooter && gameState.keeperScore > gameState.shooterScore)) ? '🏆' : '😔'}
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {((isShooter && gameState.shooterScore > gameState.keeperScore) || 
                  (!isShooter && gameState.keeperScore > gameState.shooterScore)) ? 'Victory!' : 'Defeat!'}
              </h2>
              <div className="text-lg mb-6">
                Final Score: {gameState.shooterScore} - {gameState.keeperScore}
              </div>
              <ModernButton onClick={() => router.push('/')} variant="primary" size="lg">
                Play Again
              </ModernButton>
            </div>
          )}

          {/* Live Turn Status */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className={`p-3 rounded-lg text-center transition-all ${
              gameState.gamePhase === 'shooter_turn' ? 'bg-yellow-100 text-yellow-800 animate-pulse' :
              gameState.shooterChoice ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className="font-medium">⚽ Shooter Status</div>
              <div className="text-xs mt-1">
                {gameState.gamePhase === 'shooter_turn' ? '🎯 Aiming...' : 
                 gameState.shooterChoice ? `✓ Shot ${gameState.shooterChoice.toUpperCase()}` : 'Waiting...'}
              </div>
            </div>
            <div className={`p-3 rounded-lg text-center transition-all ${
              gameState.gamePhase === 'keeper_turn' ? 'bg-yellow-100 text-yellow-800 animate-pulse' :
              gameState.keeperChoice ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className="font-medium">🥅 Keeper Status</div>
              <div className="text-xs mt-1">
                {gameState.gamePhase === 'keeper_turn' ? '🥅 Deciding...' : 
                 gameState.keeperChoice ? `✓ Guessed ${gameState.keeperChoice.toUpperCase()}` : 'Waiting...'}
              </div>
            </div>
          </div>

          {/* Round History */}
          {gameState.roundHistory && gameState.roundHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-bold mb-4 text-center">📊 Round History</h3>
              <div className="space-y-2">
                {gameState.roundHistory.map((round, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium">Round {round.round}</span>
                    <div className="flex items-center space-x-4 text-sm">
                      <span>Shooter: {round.shooterChoice.toUpperCase()}</span>
                      <span>Keeper: {round.keeperChoice.toUpperCase()}</span>
                      <span className={`font-bold ${
                        round.result === 'save' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {round.result === 'save' ? '🥅 SAVE' : '⚽ GOAL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Debug components - remove in production */}
      <KeeperDebug matchId={id} isShooter={isShooter} gameState={gameState} />
    </Layout>
  );
}