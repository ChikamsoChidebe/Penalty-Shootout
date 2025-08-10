import { useState } from 'react';
import { 
  IoFootball, 
  IoList, 
  IoGameController, 
  IoShield, 
  IoPlay, 
  IoLink, 
  IoGlobe, 
  IoWater 
} from 'react-icons/io5';

interface TutorialModalProps {
  onClose: () => void;
}

const tutorialSteps = [
  {
    title: "Welcome to Penalty Shootout Duel!",
    content: (
      <div className="space-y-4">
        <p>Experience the thrill of penalty shootouts with cryptographic fairness and instant settlements.</p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Key Features:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Fully on-chain game logic</li>
            <li>• Commit-reveal for fairness</li>
            <li>• Instant settlements</li>
            <li>• No backend dependencies</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "How the Game Works",
    content: (
      <div className="space-y-4">
        <p>Penalty Shootout Duel is a best-of-3 penalty shootout between two players:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center space-x-2">
              <IoGameController className="text-lg" />
              <span>Shooter (Creator)</span>
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              Chooses where to shoot: Left, Center, or Right for each of the 3 rounds.
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center space-x-2">
              <IoShield className="text-lg" />
              <span>Keeper (Joiner)</span>
            </h4>
            <p className="text-sm text-orange-800 dark:text-orange-200">
              Tries to guess where the shooter will aim for each round.
            </p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Scoring:</strong> If the keeper guesses correctly, they win that round. 
            Otherwise, the shooter scores. Best of 3 rounds wins the match!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Game Flow",
    content: (
      <div className="space-y-4">
        <p>Each match follows these steps:</p>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <div>
              <h4 className="font-semibold">Create Match</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Set your stake and create a penalty shootout match</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <div>
              <h4 className="font-semibold">Join Match</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Another player joins with matching stake</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <div>
              <h4 className="font-semibold">Commit Choices</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Both players secretly commit their choices for all 3 rounds</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
            <div>
              <h4 className="font-semibold">Reveal & Settle</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reveal choices, determine winner, and settle the match</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
            <div>
              <h4 className="font-semibold">Claim Prize</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Winner claims the prize (total pot minus 1% protocol fee)</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Commit-Reveal System",
    content: (
      <div className="space-y-4">
        <p>We use a cryptographic commit-reveal scheme to ensure fairness:</p>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Commit Phase</h4>
          <p className="text-sm text-purple-800 dark:text-purple-200">
            Both players submit a cryptographic hash of their choices + a random salt. 
            This prevents either player from seeing the other's choices.
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Reveal Phase</h4>
          <p className="text-sm text-orange-800 dark:text-orange-200">
            Players reveal their actual choices + salt. The smart contract verifies 
            that the hash matches and determines the winner.
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Result:</strong> Neither player can cheat or change their choices after seeing the opponent's moves!
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Getting Started",
    content: (
      <div className="space-y-4">
        <p>Ready to play? Here's what you need:</p>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <IoLink className="text-blue-500 text-xl" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Connect Wallet</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">Use MetaMask or any Web3 wallet</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <IoGlobe className="text-green-500 text-xl" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100">Switch to Somnia Testnet</h4>
              <p className="text-sm text-green-800 dark:text-green-200">Chain ID: 50312</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <IoWater className="text-yellow-500 text-xl" />
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Get Testnet ETH</h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">Use the faucet to get test tokens</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <IoFootball className="text-purple-500 text-xl" />
            <div>
              <h4 className="font-semibold text-purple-900 dark:text-purple-100">Start Playing!</h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">Create or join a match and have fun!</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export default function TutorialModal({ onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="text-primary-600">
              {currentStep === 0 && <IoFootball className="text-2xl" />}
              {currentStep === 1 && <IoList className="text-2xl" />}
              {currentStep === 2 && <IoPlay className="text-2xl" />}
              {currentStep === 3 && <IoShield className="text-2xl" />}
              {currentStep === 4 && <IoPlay className="text-2xl" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {tutorialSteps[currentStep].title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {tutorialSteps[currentStep].content}
        </div>

        {/* Progress */}
        <div className="px-6 pb-2">
          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary-500'
                    : index < currentStep
                    ? 'bg-primary-300'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
            <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
            <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% complete</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Skip Tutorial
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Get Started!' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}