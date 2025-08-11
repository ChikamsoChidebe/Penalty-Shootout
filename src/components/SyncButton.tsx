import { IoRefresh } from 'react-icons/io5';

interface SyncButtonProps {
  matchId: string | string[] | undefined;
  onSync: () => void;
}

export default function SyncButton({ matchId, onSync }: SyncButtonProps) {
  const handleSync = () => {
    // Force sync by triggering storage event
    const gameKey = `match_${matchId}_game`;
    const saved = localStorage.getItem(gameKey);
    if (saved) {
      // Re-save to trigger storage event
      localStorage.setItem(gameKey, saved);
      // Also dispatch custom event
      window.dispatchEvent(new CustomEvent('gameStateSync', {
        detail: { matchId, force: true }
      }));
    }
    onSync();
  };

  return (
    <button
      onClick={handleSync}
      className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
      title="Force sync game state"
    >
      <IoRefresh className="text-lg" />
    </button>
  );
}