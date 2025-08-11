import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { penaltyAI } from '@/lib/ai/engine';
import { IoRocket, IoShield, IoTrendingUp, IoFlash, IoCheckmark, IoClose } from 'react-icons/io5';
import ModernButton from '@/components/ModernButton';

interface StrategyAssistantProps {
  matchId?: string;
  opponentAddress?: string;
  currentRound?: number;
  previousRounds?: any[];
  onStrategySelect?: (direction: 'left' | 'center' | 'right') => void;
  className?: string;
}

export default function StrategyAssistant({
  matchId,
  opponentAddress,
  currentRound = 1,
  previousRounds = [],
  onStrategySelect,
  className = ''
}: StrategyAssistantProps) {
  const { address } = useAccount();
  const [strategy, setStrategy] = useState<any>(null);
  const [confidence, setConfidence] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState<'left' | 'center' | 'right' | null>(null);

  useEffect(() => {
    if (!address || !opponentAddress) return;

    const generateStrategy = async () => {
      setLoading(true);
      
      const strategyData = penaltyAI.optimizeStrategy(
        address,
        opponentAddress,
        currentRound,
        previousRounds
      );
      
      setStrategy(strategyData);
      setConfidence(strategyData.confidence);
      setInsights(strategyData.reasoning);
      setLoading(false);
    };

    generateStrategy();
  }, [address, opponentAddress, currentRound, previousRounds]);

  const handleDirectionSelect = (direction: 'left' | 'center' | 'right') => {
    setSelectedDirection(direction);
    onStrategySelect?.(direction);
  };

  const getDirectionIcon = (direction: 'left' | 'center' | 'right') => {
    switch (direction) {
      case 'left': return '←';
      case 'center': return '↑';
      case 'right': return '→';
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-600 dark:text-green-400';
    if (conf >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <IoRocket className="text-2xl text-green-600 dark:text-green-400 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Strategy Assistant</h3>
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
    <div className={`bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-500/30 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <IoRocket className="text-2xl text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Strategy Assistant</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600 dark:text-gray-400">Round</div>
          <div className="font-bold text-lg text-gray-900 dark:text-white">{currentRound}/3</div>
        </div>
      </div>

      {/* AI Recommendation */}
      {strategy && (
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">AI Recommendation</h4>
              <div className="flex items-center space-x-2">
                <IoShield className="text-green-500" size={16} />
                <span className={`font-bold text-sm ${getConfidenceColor(confidence)}`}>
                  {(confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-3">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {getDirectionIcon(strategy.recommendedDirection)}
              </div>
              <div>
                <div className="font-bold text-lg text-gray-900 dark:text-white capitalize">
                  {strategy.recommendedDirection}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Optimal Direction
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              <strong>Strategy:</strong> {strategy.adaptiveStrategy}
            </div>

            {/* Reasoning */}
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <IoFlash className="text-yellow-500 mt-0.5 flex-shrink-0" size={14} />
                  <span className="text-gray-600 dark:text-gray-400">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Direction Selection */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Choose Your Direction</h4>
        <div className="grid grid-cols-3 gap-3">
          {(['left', 'center', 'right'] as const).map((direction) => (
            <button
              key={direction}
              onClick={() => handleDirectionSelect(direction)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedDirection === direction
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                  : strategy?.recommendedDirection === direction
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {/* AI Recommendation Badge */}
              {strategy?.recommendedDirection === direction && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                  <IoTrendingUp size={12} />
                </div>
              )}
              
              {/* Selection Indicator */}
              {selectedDirection === direction && (
                <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full p-1">
                  <IoCheckmark size={12} />
                </div>
              )}

              <div className="text-center">
                <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                  {getDirectionIcon(direction)}
                </div>
                <div className="font-medium text-sm text-gray-900 dark:text-white capitalize">
                  {direction}
                </div>
                {strategy?.recommendedDirection === direction && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    AI Pick
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Previous Rounds Analysis */}
      {previousRounds.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Previous Rounds</h4>
          <div className="space-y-2">
            {previousRounds.map((round, index) => (
              <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900 dark:text-white">Round {index + 1}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    You: {round.playerChoice} | Opponent: {round.opponentChoice}
                  </span>
                </div>
                <div className="flex items-center">
                  {round.result === 'win' ? (
                    <IoCheckmark className="text-green-500" />
                  ) : (
                    <IoClose className="text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      {selectedDirection && (
        <ModernButton
          variant="success"
          size="lg"
          className="w-full"
          icon={<IoRocket />}
        >
          Confirm {selectedDirection.charAt(0).toUpperCase() + selectedDirection.slice(1)} Shot
        </ModernButton>
      )}
    </div>
  );
}