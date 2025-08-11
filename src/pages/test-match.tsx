import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ModernButton from '@/components/ModernButton';

export default function TestMatch() {
  const router = useRouter();
  const [matchId, setMatchId] = useState('1');

  const testAsShooter = () => {
    // Simulate being the match creator (shooter)
    localStorage.setItem('test_role', 'shooter');
    router.push(`/match/${matchId}`);
  };

  const testAsKeeper = () => {
    // Simulate being the opponent (keeper)
    localStorage.setItem('test_role', 'keeper');
    router.push(`/match/${matchId}`);
  };

  const clearGameData = () => {
    localStorage.removeItem(`match_${matchId}_game`);
    localStorage.removeItem(`match_${matchId}_sync`);
    localStorage.removeItem('test_role');
    alert('Game data cleared!');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Test Match Functionality</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Match ID to Test</label>
            <input
              type="text"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Enter match ID"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ModernButton
              onClick={testAsShooter}
              variant="primary"
              size="lg"
              className="w-full"
            >
              ⚽ Test as Shooter
            </ModernButton>
            
            <ModernButton
              onClick={testAsKeeper}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              🥅 Test as Keeper
            </ModernButton>
          </div>

          <ModernButton
            onClick={clearGameData}
            variant="outline"
            size="sm"
            className="w-full"
          >
            🗑️ Clear Game Data
          </ModernButton>

          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Instructions:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Open two browser tabs/windows</li>
              <li>In first tab, click "Test as Shooter"</li>
              <li>In second tab, click "Test as Keeper"</li>
              <li>Play the game and see real-time updates</li>
              <li>Use "Clear Game Data" to reset between tests</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}