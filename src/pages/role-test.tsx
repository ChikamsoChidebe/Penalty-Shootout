import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ModernButton from '@/components/ModernButton';

export default function RoleTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const matchId = 'test-123';

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testRoleProtection = () => {
    addResult('🧪 Starting role protection test...');
    
    // Set initial role
    localStorage.setItem(`match_${matchId}_player_role`, 'shooter');
    sessionStorage.setItem(`match_${matchId}_player_role`, 'shooter');
    localStorage.setItem(`match_${matchId}_role_backup`, 'shooter');
    addResult('✅ Set initial role: SHOOTER');
    
    // Try to corrupt the role
    setTimeout(() => {
      localStorage.setItem(`match_${matchId}_player_role`, 'keeper');
      addResult('🔥 Attempted role corruption: shooter → keeper');
      
      // Check if protection works
      setTimeout(() => {
        const currentRole = localStorage.getItem(`match_${matchId}_player_role`);
        if (currentRole === 'shooter') {
          addResult('✅ Role protection WORKED - role restored to shooter');
        } else {
          addResult('❌ Role protection FAILED - role is still: ' + currentRole);
        }
      }, 1500);
    }, 1000);
  };

  const testSyncIsolation = () => {
    addResult('🧪 Testing sync isolation...');
    
    // Set role
    localStorage.setItem(`match_${matchId}_player_role`, 'shooter');
    addResult('✅ Set role: SHOOTER');
    
    // Simulate sync event with different role
    const fakeGameState = {
      round: 1,
      gamePhase: 'keeper_turn',
      shooterChoice: 'left',
      // This should NOT affect role
      someOtherData: 'test'
    };
    
    localStorage.setItem(`match_${matchId}_game`, JSON.stringify(fakeGameState));
    window.dispatchEvent(new StorageEvent('storage', {
      key: `match_${matchId}_game`,
      newValue: JSON.stringify(fakeGameState)
    }));
    
    addResult('🚀 Triggered sync event');
    
    setTimeout(() => {
      const roleAfterSync = localStorage.getItem(`match_${matchId}_player_role`);
      if (roleAfterSync === 'shooter') {
        addResult('✅ Sync isolation WORKED - role unchanged: ' + roleAfterSync);
      } else {
        addResult('❌ Sync isolation FAILED - role changed to: ' + roleAfterSync);
      }
    }, 500);
  };

  const clearTest = () => {
    localStorage.removeItem(`match_${matchId}_player_role`);
    sessionStorage.removeItem(`match_${matchId}_player_role`);
    localStorage.removeItem(`match_${matchId}_role_backup`);
    localStorage.removeItem(`match_${matchId}_game`);
    setTestResults([]);
    addResult('🧹 Cleared all test data');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">🔒 Role Protection Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <ModernButton onClick={testRoleProtection} variant="primary">
            🛡️ Test Role Protection
          </ModernButton>
          <ModernButton onClick={testSyncIsolation} variant="secondary">
            🔄 Test Sync Isolation
          </ModernButton>
          <ModernButton onClick={clearTest} variant="outline">
            🧹 Clear Test
          </ModernButton>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">📊 Test Results</h2>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-gray-500">No tests run yet...</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-bold mb-2">🎯 What This Tests:</h3>
          <ul className="text-sm space-y-1">
            <li>• <strong>Role Protection:</strong> Verifies that roles cannot be corrupted by external changes</li>
            <li>• <strong>Sync Isolation:</strong> Ensures game state sync doesn't affect role assignments</li>
            <li>• <strong>Auto-Recovery:</strong> Tests if the system can restore corrupted roles</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}