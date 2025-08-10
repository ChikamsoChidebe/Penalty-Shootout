import { useState, useEffect } from 'react';
import { GameStateManager, PlayerStats } from '@/lib/gameState';
import { supabaseAPI } from '@/lib/supabase';
import { IoTrophy, IoPerson, IoStatsChart } from 'react-icons/io5';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const stats = await supabaseAPI.getLeaderboard(10);
        setLeaderboard(stats);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
    // Refresh every 10 seconds
    const interval = setInterval(loadLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <IoTrophy className="text-2xl text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Leaderboard
        </h2>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <IoStatsChart className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No players yet. Be the first to play and earn your spot!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((player, index) => (
            <div
              key={player.address}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                index === 0
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : index === 1
                  ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                  : index === 2
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0
                    ? 'bg-yellow-500 text-white'
                    : index === 1
                    ? 'bg-gray-400 text-white'
                    : index === 2
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : player.rank}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <IoPerson className="text-gray-500" />
                    <span className="font-mono text-sm">
                      {player.address ? `${player.address.slice(0, 6)}...${player.address.slice(-4)}` : 'Unknown'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {player.gamesWon}W / {player.gamesPlayed}G ({player.winRate.toFixed(1)}%)
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-green-600 dark:text-green-400">
                  {parseFloat(player.totalEarnings).toFixed(4)} ETH
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Earnings
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Rankings based on total ETH earned • Updates every 10 seconds
        </p>
      </div>
    </div>
  );
}