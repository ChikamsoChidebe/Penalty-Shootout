import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { penaltyAI, PlayerStats, MatchPrediction } from '@/lib/ai/engine';
import { IoFlash, IoTrendingUp, IoShield, IoAnalytics, IoStatsChart, IoLocation } from 'react-icons/io5';

interface AIInsightsProps {
  matches?: any[];
  currentMatch?: any;
  className?: string;
}

export default function AIInsights({ matches = [], currentMatch, className = '' }: AIInsightsProps) {
  const { address } = useAccount();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [predictions, setPredictions] = useState<MatchPrediction[]>([]);
  const [marketTrends, setMarketTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    const analyzeData = async () => {
      setLoading(true);
      
      // Analyze player patterns
      const stats = penaltyAI.analyzePlayerPatterns(address);
      setPlayerStats(stats);
      
      // Generate predictions for available matches
      const matchPredictions = matches.slice(0, 3).map(match => 
        penaltyAI.predictMatchOutcome(address, match.creator, parseFloat(match.stake))
      );
      setPredictions(matchPredictions);
      
      // Analyze market trends
      const trends = penaltyAI.analyzeMarketTrends();
      setMarketTrends(trends);
      
      setLoading(false);
    };

    analyzeData();
  }, [address, matches]);

  if (!address || loading) {
    return (
      <div className={`bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <IoFlash className="text-2xl text-purple-600 dark:text-purple-400 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Analysis</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-500/30 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <IoFlash className="text-2xl text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Insights</h3>
        </div>
        <div className="px-3 py-1 bg-purple-100 dark:bg-purple-800/50 rounded-full">
          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">BETA</span>
        </div>
      </div>

      {/* Player Analysis */}
      {playerStats && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <IoAnalytics className="mr-2 text-blue-500" />
            Your Performance Profile
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-600 dark:text-gray-400">Skill Rating</div>
              <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {playerStats.skillRating}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-600 dark:text-gray-400">Win Rate</div>
              <div className="font-bold text-lg text-green-600 dark:text-green-400">
                {(playerStats.winRate * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-600 dark:text-gray-400">Risk Profile</div>
              <div className={`font-bold text-sm capitalize ${
                playerStats.riskProfile === 'aggressive' ? 'text-red-600 dark:text-red-400' :
                playerStats.riskProfile === 'moderate' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {playerStats.riskProfile}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-600 dark:text-gray-400">Playing Style</div>
              <div className="font-bold text-sm capitalize text-purple-600 dark:text-purple-400">
                {playerStats.playingStyle}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Predictions */}
      {predictions.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <IoLocation className="mr-2 text-green-500" />
            Match Predictions
          </h4>
          <div className="space-y-3">
            {predictions.map((prediction, index) => (
              <div key={index} className="bg-white dark:bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Match #{index + 1}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      prediction.riskAssessment === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' :
                      prediction.riskAssessment === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                    }`}>
                      {prediction.riskAssessment.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Win Probability:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {(prediction.winProbability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Expected Value:</span>
                  <span className={`font-bold ${
                    prediction.expectedValue > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {prediction.expectedValue > 0 ? '+' : ''}{prediction.expectedValue.toFixed(4)} ETH
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Strategy:</div>
                  <div className="text-sm font-medium text-purple-600 dark:text-purple-400 capitalize">
                    {prediction.recommendedStrategy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Trends */}
      {marketTrends && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <IoTrendingUp className="mr-2 text-orange-500" />
            Market Intelligence
          </h4>
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Avg Stake</div>
                <div className="font-bold text-sm text-gray-900 dark:text-white">
                  {marketTrends.averageStake.toFixed(3)} ETH
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Sentiment</div>
                <div className={`font-bold text-sm capitalize ${
                  marketTrends.marketSentiment === 'bullish' ? 'text-green-600 dark:text-green-400' :
                  marketTrends.marketSentiment === 'bearish' ? 'text-red-600 dark:text-red-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {marketTrends.marketSentiment}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              {marketTrends.recommendations.slice(0, 2).map((rec: string, index: number) => (
                <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                  <IoFlash className="mr-1 mt-0.5 text-yellow-500 flex-shrink-0" size={12} />
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-200 dark:border-blue-500/30">
        <div className="flex items-center space-x-2 mb-2">
          <IoShield className="text-blue-500" />
          <span className="font-semibold text-sm text-gray-900 dark:text-white">AI Recommendation</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {predictions.length > 0 && predictions[0].expectedValue > 0
            ? `Strong opportunity detected! Consider joining the top-rated match with ${(predictions[0].winProbability * 100).toFixed(0)}% win probability.`
            : 'Current matches show mixed signals. Consider creating your own match or waiting for better opportunities.'
          }
        </p>
      </div>
    </div>
  );
}