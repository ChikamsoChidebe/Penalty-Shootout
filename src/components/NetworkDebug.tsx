import { useAccount, useChainId } from 'wagmi';
import { useContractContext } from '@/contexts/ContractContext';

export default function NetworkDebug() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { matches, matchCounter, isLoading, error } = useContractContext();

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2 text-yellow-400">🔧 Debug Info</h4>
      <div className="space-y-1">
        <div>Connected: {isConnected ? '✅' : '❌'}</div>
        <div>Address: {address?.slice(0, 6)}...{address?.slice(-4)}</div>
        <div>Chain ID: {chainId}</div>
        <div>Contract: {process.env.NEXT_PUBLIC_SHOOTOUT_ADDRESS?.slice(0, 6)}...{process.env.NEXT_PUBLIC_SHOOTOUT_ADDRESS?.slice(-4)}</div>
        <div>Match Counter: {matchCounter?.toString() || 'None'}</div>
        <div>Total Matches: {matches?.length || 0}</div>
        <div>Loading: {isLoading ? '⏳' : '✅'}</div>
        {error && <div className="text-red-400">Error: {error.message}</div>}
        
        {matches?.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="font-bold text-green-400">Matches Found:</div>
            {matches.slice(0, 3).map((match, i) => (
              <div key={i} className="text-xs">
                #{match.id}: {match.creator?.slice(0, 6)} ({match.status})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}