import Head from 'next/head';
import Layout from '@/components/Layout';
import Leaderboard from '@/components/Leaderboard';
import CommunityFeatures from '@/components/CommunityFeatures';

export default function LeaderboardPage() {
  return (
    <>
      <Head>
        <title>Leaderboard - Penalty Shootout Duel</title>
        <meta name="description" content="Top players in penalty shootout duels" />
      </Head>

      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🏆 Leaderboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Top players ranked by total earnings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-2">
              <Leaderboard />
            </div>
            <div>
              <CommunityFeatures />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}