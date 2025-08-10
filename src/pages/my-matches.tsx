import { useState } from 'react';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { IoWallet, IoRefresh } from 'react-icons/io5';
import Layout from '@/components/Layout';
import MatchList from '@/components/MatchList';
import NetworkGuard from '@/components/NetworkGuard';

export default function MyMatchesPage() {
  const { address, isConnected } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Head>
        <title>My Matches - Penalty Shootout Duel</title>
        <meta name="description" content="View your penalty shootout matches" />
      </Head>

      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ⚽ My Matches
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Track your penalty shootout history
            </p>
          </div>

          <NetworkGuard />

          {isConnected && address ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Your Matches
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    title="Refresh matches"
                  >
                    <IoRefresh className="text-xl" />
                  </button>
                </div>
                
                <MatchList 
                  type="player" 
                  playerAddress={address}
                  refreshKey={refreshKey}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <IoWallet className="text-6xl mb-4 mx-auto text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Connect your wallet to view your penalty shootout match history.
              </p>
              <ConnectButton />
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}