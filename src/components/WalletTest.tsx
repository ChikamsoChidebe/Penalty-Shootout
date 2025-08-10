import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect } from 'react';

export function WalletTest() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, error, isLoading } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (error) {
      console.error('Connection error:', error);
    }
  }, [error]);

  if (isConnected) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">✅ Wallet Connected</h3>
        <p><strong>Address:</strong> {address}</p>
        <p><strong>Chain:</strong> {chain?.name} ({chain?.id})</p>
        <button 
          onClick={() => disconnect()}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">🔌 Connect Wallet</h3>
      {error && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">
          Error: {error.message}
        </div>
      )}
      <div className="space-y-2">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isLoading}
            className="block w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Connecting...' : `Connect ${connector.name}`}
          </button>
        ))}
      </div>
    </div>
  );
}