import { useState, useEffect } from 'react';

interface KeeperDebugProps {
  matchId: string | string[] | undefined;
  isShooter: boolean;
  gameState: any;
}

export default function KeeperDebug({ matchId, isShooter, gameState }: KeeperDebugProps) {
  const [localStorageState, setLocalStorageState] = useState<any>(null);
  const [syncCount, setSyncCount] = useState(0);

  useEffect(() => {
    if (!matchId) return;

    const checkLocalStorage = () => {
      const gameKey = `match_${matchId}_game`;
      const saved = localStorage.getItem(gameKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLocalStorageState(parsed);
          setSyncCount(prev => prev + 1);
        } catch (error) {
          console.error('Debug parse error:', error);
        }
      }
    };

    checkLocalStorage();
    const interval = setInterval(checkLocalStorage, 1000);
    
    return () => clearInterval(interval);
  }, [matchId]);

  if (isShooter) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg p-3 text-xs max-w-sm">
      <div className="font-bold mb-2 text-red-700 dark:text-red-300">🥅 Keeper Debug</div>
      <div className="space-y-1 text-gray-600 dark:text-gray-300">
        <div><strong>Current State:</strong></div>
        <div>Phase: {gameState.gamePhase}</div>
        <div>Round: {gameState.round}/3</div>
        <div>Shooter Choice: {gameState.shooterChoice || 'none'}</div>
        <div>Keeper Choice: {gameState.keeperChoice || 'none'}</div>
        <div>Last Update: {new Date(gameState.lastUpdate).toLocaleTimeString()}</div>
        
        <div className="border-t pt-2 mt-2">
          <strong>LocalStorage State:</strong>
        </div>
        <div>Phase: {localStorageState?.gamePhase || 'none'}</div>
        <div>Shooter Choice: {localStorageState?.shooterChoice || 'none'}</div>
        <div>Sync Count: {syncCount}</div>
        
        <div className="border-t pt-2 mt-2">
          <strong>Status:</strong>
        </div>
        <div className={gameState.gamePhase === localStorageState?.gamePhase ? 'text-green-600' : 'text-red-600'}>
          {gameState.gamePhase === localStorageState?.gamePhase ? '✓ Synced' : '⚠ Out of Sync'}
        </div>
      </div>
    </div>
  );
}