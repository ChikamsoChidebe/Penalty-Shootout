import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useAccount, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { toast } from 'react-hot-toast';
import { 
  IoFootball, 
  IoBook, 
  IoTrendingUp, 
  IoDiamond, 
  IoPeople, 
  IoAdd, 
  IoLink, 
  IoRefresh, 
  IoWater, 
  IoSearch, 
  IoWallet 
} from 'react-icons/io5';

import Layout from '@/components/Layout';
import CreateMatchForm from '@/components/CreateMatchForm';
import MatchList from '@/components/MatchList';
import NetworkGuard from '@/components/NetworkGuard';
import StatsCard from '@/components/StatsCard';
import TutorialModal from '@/components/TutorialModal';
import Leaderboard from '@/components/Leaderboard';
import BalanceDisplay from '@/components/BalanceDisplay';
import CommunityFeatures from '@/components/CommunityFeatures';

import { useAppStore, useShowTutorial } from '@/state/store';
import { somniaTestnet } from '@/lib/wagmi';
import { supabaseAPI, GameStats } from '@/lib/supabase';

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const showTutorial = useShowTutorial();
  const { setShowTutorial } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [refreshKey, setRefreshKey] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);

  const isCorrectNetwork = chainId === somniaTestnet.id || chainId === 31337; // Allow Somnia or localhost

  useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      // Only show warning, don't block functionality
      console.log('Connected to different network, but allowing for demo');
    }
  }, [isConnected, isCorrectNetwork]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    toast.success('Matches refreshed');
  }, []);

  // Load game statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await supabaseAPI.getGameStats();
        setGameStats(stats);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Penalty Shootout Duel - Somnia Testnet</title>
        <meta name="description" content="A fully on-chain penalty shootout betting game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Penalty Shootout Duel" />
        <meta property="og:description" content="Experience the thrill of penalty shootouts with fair randomness and instant settlements" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Penalty Shootout Duel" />
        <meta name="twitter:description" content="A fully on-chain penalty shootout betting game" />
        <meta name="twitter:image" content="/og-image.png" />
      </Head>

      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <IoFootball className="text-6xl mr-4 text-primary-600" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Penalty Shootout Duel
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the thrill of penalty shootouts with cryptographic fairness, 
              instant settlements on Somnia Testnet.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <ConnectButton />
              
              {isConnected && (
                <>
                  <BalanceDisplay />
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <IoBook className="text-lg" />
                    <span>How to Play</span>
                  </button>
                </>
              )}
            </div>

            {/* Network Status */}
            <NetworkGuard />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatsCard
              title="Total Matches"
              value={gameStats?.total_matches.toLocaleString() || '0'}
              change={`+${gameStats?.matches_today || 0} today`}
              icon={<IoTrendingUp className="text-3xl text-blue-500" />}
            />
            <StatsCard
              title="Total Volume"
              value={`${gameStats?.total_volume?.toFixed(1) || '0.0'} ETH`}
              change={`+${gameStats?.volume_today?.toFixed(1) || '0.0'} ETH today`}
              icon={<IoDiamond className="text-3xl text-green-500" />}
            />
            <StatsCard
              title="Active Players"
              value={gameStats?.active_players?.toString() || '0'}
              change="Last 24 hours"
              icon={<IoPeople className="text-3xl text-purple-500" />}
            />
          </div>

          {isConnected && isCorrectNetwork ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Create/Join */}
              <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                      activeTab === 'create'
                        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <IoAdd className="mr-2" />
                    Create Match
                  </button>
                  <button
                    onClick={() => setActiveTab('join')}
                    className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                      activeTab === 'join'
                        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <IoLink className="mr-2" />
                    Join Match
                  </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  {activeTab === 'create' ? (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Create New Match
                      </h2>
                      <CreateMatchForm onSuccess={handleRefresh} />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Available Matches
                        </h2>
                        <button
                          onClick={handleRefresh}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          title="Refresh matches"
                        >
                          <IoRefresh className="text-lg" />
                        </button>
                      </div>
                      <MatchList 
                        type="available" 
                        refreshKey={refreshKey}
                        onJoin={handleRefresh}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Column - My Matches */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      My Matches
                    </h2>
                    <div className="flex items-center space-x-2">
                      <a
                        href="/my-matches"
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                      >
                        View All
                      </a>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                      </span>
                    </div>
                  </div>
                  <MatchList 
                    type="player" 
                    playerAddress={address}
                    refreshKey={refreshKey}
                    limit={3}
                  />
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <a
                      href={process.env.NEXT_PUBLIC_FAUCET_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <span className="text-blue-700 dark:text-blue-300">Get Testnet ETH</span>
                      <IoWater className="text-blue-500 text-lg" />
                    </a>
                    
                    <a
                      href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <span className="text-green-700 dark:text-green-300">View on Explorer</span>
                      <IoSearch className="text-green-500 text-lg" />
                    </a>
                    
                    <button
                      onClick={() => setShowTutorial(true)}
                      className="w-full flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      <span className="text-purple-700 dark:text-purple-300">Game Tutorial</span>
                      <IoBook className="text-purple-500 text-lg" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Leaderboard & Community */}
              <div className="space-y-6">
                <Leaderboard />
                <CommunityFeatures />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <IoWallet className="text-6xl mb-4 mx-auto text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Connect your wallet and switch to Somnia Testnet to start playing penalty shootout duels.
              </p>
              <ConnectButton />
            </div>
          )}
        </div>

        {/* Tutorial Modal */}
        {showTutorial && (
          <TutorialModal onClose={() => setShowTutorial(false)} />
        )}
      </Layout>
    </>
  );
}