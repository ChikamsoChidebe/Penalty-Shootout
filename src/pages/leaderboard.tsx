import Head from 'next/head';
import Layout from '@/components/Layout';
import Leaderboard from '@/components/Leaderboard';

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

          <div className="max-w-4xl mx-auto">
            <Leaderboard />
          </div>
        </div>
      </Layout>
    </>
  );
}