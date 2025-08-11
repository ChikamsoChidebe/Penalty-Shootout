import { GameState } from '@/lib/gameState';

interface GameStateDebugProps {
  gameState: GameState;
  isShooter: boolean;
  matchId: string | string[] | undefined;
}

export default function GameStateDebug({ gameState, isShooter, matchId }: GameStateDebugProps) {
  const forceSync = () => {
    const gameKey = `match_${matchId}_game`;
    const saved = localStorage.getItem(gameKey);
    if (saved) {
      // Trigger storage event manually
      window.dispatchEvent(new StorageEvent('storage', {
        key: gameKey,
        newValue: saved
      }));
      console.log('🔄 Manual sync triggered');
    }
  };
  
  const savedRole = localStorage.getItem(`match_${matchId}_player_role`);
  const sessionRole = sessionStorage.getItem(`match_${matchId}_player_role`);

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs max-w-xs">
      <div className="font-bold mb-2">Debug Info</div>
      <div>Role: {isShooter ? 'SHOOTER' : 'KEEPER'}</div>
      <div>Saved Role: {savedRole || 'None'}</div>
      <div>Session Role: {sessionRole || 'None'}</div>
      <div>Phase: {gameState.gamePhase}</div>
      <div>Round: {gameState.round}</div>
      <div>Shooter Choice: {gameState.shooterChoice || 'None'}</div>
      <div>Keeper Choice: {gameState.keeperChoice || 'None'}</div>
      <div>Last Update: {new Date(gameState.lastUpdate).toLocaleTimeString()}</div>
      <button 
        onClick={forceSync}
        className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
      >
        Force Sync
      </button>
    </div>
  );
}