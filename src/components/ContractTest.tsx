import { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { SHOOTOUT_ABI } from '@/lib/abi';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SHOOTOUT_ADDRESS as `0x${string}`;

export default function ContractTest() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const publicClient = usePublicClient();

  const testContract = async () => {
    if (!publicClient) return;
    
    setLoading(true);
    try {
      // Test match counter
      const counter = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: SHOOTOUT_ABI,
        functionName: 'matchCounter',
      });
      
      console.log('🔍 Match counter:', counter);
      
      // Test getting match 1
      if (counter && Number(counter) > 0) {
        const match1 = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: SHOOTOUT_ABI,
          functionName: 'getMatch',
          args: [BigInt(1)],
        });
        
        console.log('🔍 Match 1 data:', match1);
        setTestResult({ counter, match1 });
      } else {
        setTestResult({ counter, match1: 'No matches found' });
      }
    } catch (error) {
      console.error('🔍 Contract test error:', error);
      setTestResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-blue-900/90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2 text-blue-400">🧪 Contract Test</h4>
      
      <button
        onClick={testContract}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs mb-2"
      >
        {loading ? 'Testing...' : 'Test Contract'}
      </button>
      
      {testResult && (
        <div className="space-y-1 text-xs">
          <div>Counter: {testResult.counter?.toString() || 'None'}</div>
          {testResult.match1 && typeof testResult.match1 === 'object' && (
            <div>
              <div>Match 1 Creator: {testResult.match1[0]?.slice(0, 10)}...</div>
              <div>Match 1 State: {testResult.match1[3]?.toString()}</div>
            </div>
          )}
          {testResult.error && (
            <div className="text-red-400">Error: {testResult.error}</div>
          )}
        </div>
      )}
    </div>
  );
}