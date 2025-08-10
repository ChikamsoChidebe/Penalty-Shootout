import { useState } from 'react';
import { IoTrophy, IoFlash, IoPeople, IoGift, IoTrendingUp, IoTime } from 'react-icons/io5';

export default function CommunityFeatures() {
  const [activeTab, setActiveTab] = useState<'achievements' | 'tournaments' | 'social'>('achievements');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <IoPeople className="mr-2 text-primary-600" />
        Community Features
      </h3>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'achievements'
              ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Achievements
        </button>
        <button
          onClick={() => setActiveTab('tournaments')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tournaments'
              ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Tournaments
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'social'
              ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Social
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <IoTrophy className="text-yellow-500 text-xl" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">First Goal</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Win your first match</p>
              </div>
            </div>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
              Unlocked
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60">
            <div className="flex items-center space-x-3">
              <IoFlash className="text-blue-500 text-xl" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Speed Demon</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Win 5 matches in under 30s</p>
              </div>
            </div>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
              Locked
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60">
            <div className="flex items-center space-x-3">
              <IoGift className="text-purple-500 text-xl" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">High Roller</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Win a match with 1+ ETH stake</p>
              </div>
            </div>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
              Locked
            </span>
          </div>
        </div>
      )}

      {activeTab === 'tournaments' && (
        <div className="space-y-4">
          <div className="text-center py-8">
            <IoTrophy className="text-4xl text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Tournaments Coming Soon!
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Weekly tournaments with prize pools and NFT rewards
            </p>
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
              <p className="text-sm text-primary-700 dark:text-primary-300">
                🏆 Next Tournament: "Somnia Cup" - 10 ETH Prize Pool
              </p>
              <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                Registration opens when we reach 100 active players
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <IoTrendingUp className="text-2xl text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Your Rank</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">#42</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <IoTime className="text-2xl text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Streak</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">3 wins</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Share Your Victory</h5>
            <div className="flex space-x-2">
              <button className="flex-1 py-2 px-3 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
                Tweet Score
              </button>
              <button className="flex-1 py-2 px-3 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors">
                Discord Flex
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Join the Somnia Gaming Community
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://discord.com/invite/somnia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Discord
              </a>
              <a
                href="https://x.com/SomniaEco"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Twitter
              </a>
              <a
                href="https://t.me/+XHq0F0JXMyhmMzM0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Telegram
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}