import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { penaltyAI, AIRecommendation } from '@/lib/ai/engine';
import { IoSparkles, IoTrendingUp, IoShield, IoFlash, IoCheckmark, IoClose, IoWarning } from 'react-icons/io5';
import ModernButton from '@/components/ModernButton';

interface SmartMatchmakingProps {
  availableMatches: any[];
  onJoinMatch?: (matchId: string) => void;
  className?: string;
}

export default function SmartMatchmaking({ 
  availableMatches, 
  onJoinMatch, 
  className = '' 
}: SmartMatchmakingProps) {
  const { address } = useAccount();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  useEffect(() => {
    if (!address || availableMatches.length === 0) return;

    const generateRecommendations = async () => {
      setLoading(true);
      
      const recs = penaltyAI.findOptimalOpponents(address, availableMatches);
      setRecommendations(recs);
      
      setLoading(false);
    };

    generateRecommendations();
  }, [address, availableMatches]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'join': return 'text-green-600 dark:text-green-400';
      case 'avoid': return 'text-red-600 dark:text-red-400';
      case 'create': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'join': return <IoCheckmark className="text-green-500" />;
      case 'avoid': return <IoClose className="text-red-500" />;
      case 'create': return <IoSparkles className="text-blue-500" />;
      default: return <IoWarning className="text-yellow-500" />;
    }
  };

  const getConfidenceBar = (confidence: number) => {
    const percentage = confidence * 100;
    const color = confidence >= 0.8 ? 'bg-green-500' : 
                  confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <IoSparkles className="text-2xl text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Smart Matchmaking</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800/50 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (availableMatches.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <IoSparkles className="text-2xl text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Smart Matchmaking</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-600 dark:text-gray-400 mb-4">
            No matches available for analysis
          </div>
          <ModernButton variant="primary" icon={<IoSparkles />}>
            Create Optimal Match
          </ModernButton>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-500/30 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <IoSparkles className="text-2xl text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Smart Matchmaking</h3>
        </div>
        <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-800/50 rounded-full">
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">AI POWERED</span>
        </div>
      </div>

      {/* Top Recommendation */}
      {recommendations.length > 0 && recommendations[0].action === 'join' && (
        <div className="mb-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-200 dark:border-green-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <IoTrendingUp className="text-green-500" />
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Top AI Pick</span>
            <div className="px-2 py-1 bg-green-100 dark:bg-green-800/30 rounded text-xs font-bold text-green-800 dark:text-green-300">
              {(recommendations[0].confidence * 100).toFixed(0)}% MATCH
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {recommendations[0].reasoning[0]}
          </p>
          <ModernButton
            variant="success"
            size="sm"
            onClick={() => onJoinMatch?.(availableMatches[0].id)}
            icon={<IoFlash />}
          >
            Join Recommended Match ({formatEther(availableMatches[0].stake)} ETH)
          </ModernButton>
        </div>
      )}

      {/* Match Analysis */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white">Match Analysis</h4>
        
        {recommendations.slice(0, 5).map((rec, index) => {
          const match = availableMatches[index];
          if (!match) return null;

          return (
            <div 
              key={match.id} 
              className={`bg-white dark:bg-gray-800/50 rounded-lg p-4 border-2 transition-all duration-200 ${
                selectedMatch === match.id 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {/* Match Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Match #{match.id}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatEther(match.stake)} ETH
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {getActionIcon(rec.action)}
                  <span className={`font-bold text-sm capitalize ${getActionColor(rec.action)}`}>
                    {rec.action}
                  </span>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>AI Confidence</span>
                  <span>{(rec.confidence * 100).toFixed(0)}%</span>
                </div>
                {getConfidenceBar(rec.confidence)}
              </div>

              {/* Reasoning */}
              <div className="space-y-1 mb-3">
                {rec.reasoning.slice(0, 2).map((reason, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs">
                    <IoFlash className="text-yellow-500 mt-0.5 flex-shrink-0" size={12} />
                    <span className="text-gray-600 dark:text-gray-400">{reason}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Creator: {match.creator.slice(0, 6)}...{match.creator.slice(-4)}
                </div>
                
                {rec.action === 'join' && (
                  <ModernButton
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setSelectedMatch(match.id);
                      onJoinMatch?.(match.id);
                    }}
                    disabled={selectedMatch === match.id}
                  >
                    {selectedMatch === match.id ? 'Joining...' : 'Join'}
                  </ModernButton>
                )}
                
                {rec.action === 'avoid' && (
                  <div className="px-3 py-1 bg-red-100 dark:bg-red-800/30 rounded text-xs font-medium text-red-800 dark:text-red-300">
                    Not Recommended
                  </div>
                )}
              </div>

              {/* Alternative Options */}
              {rec.alternativeOptions && rec.alternativeOptions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Alternatives:</div>
                  <div className="flex flex-wrap gap-1">
                    {rec.alternativeOptions.map((option, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {recommendations.filter(r => r.action === 'join').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Recommended</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {recommendations.filter(r => r.action === 'avoid').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avoid</div>
          </div>
          <div>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {recommendations.length > 0 ? (recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length * 100).toFixed(0) : 0}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Confidence</div>
          </div>
        </div>
      </div>
    </div>
  );
}