import { useState, useEffect } from 'react';
import ModernButton from './ModernButton';

interface SyncTestProps {
  matchId: string | string[] | undefined;
}

export default function CrossBrowserSyncTest({ matchId }: SyncTestProps) {
  const [testData, setTestData] = useState<any>(null);
  const [lastSync, setLastSync] = useState<number>(0);

  useEffect(() => {
    if (!matchId) return;

    const gameKey = `match_${matchId}_game`;
    
    // Check for existing data
    const checkData = () => {
      const saved = localStorage.getItem(gameKey);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setTestData(data);
          if (data.lastUpdate > lastSync) {
            setLastSync(data.lastUpdate);
            console.log('🔄 Sync test detected update:', data.gamePhase);
          }
        } catch (error) {
          console.error('Sync test error:', error);
        }
      }
    };

    // Initial check
    checkData();

    // Poll every second
    const interval = setInterval(checkData, 1000);

    return () => clearInterval(interval);
  }, [matchId, lastSync]);

  const triggerUpdate = () => {
    if (!matchId) return;
    
    const gameKey = `match_${matchId}_game`;
    const testUpdate = {
      gamePhase: 'test_phase',
      lastUpdate: Date.now(),
      testTrigger: true
    };
    
    localStorage.setItem(gameKey, JSON.stringify(testUpdate));
    console.log('🧪 Test update triggered');
  };

  if (!matchId) return null;

  return (
    <div className="fixed bottom-20 left-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-lg p-3 text-xs max-w-xs">
      <div className="font-bold mb-2">🔄 Sync Test</div>
      <div className="space-y-1 text-gray-600 dark:text-gray-300">
        <div>Phase: {testData?.gamePhase || 'none'}</div>
        <div>Last Update: {testData?.lastUpdate ? new Date(testData.lastUpdate).toLocaleTimeString() : 'none'}</div>
        <div>Sync Count: {lastSync}</div>
      </div>
      <ModernButton
        onClick={triggerUpdate}
        variant="secondary"
        size="sm"
        className="mt-2 w-full"
      >
        Test Sync
      </ModernButton>
    </div>
  );
}