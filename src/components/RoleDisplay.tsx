import { IoFootball, IoShield } from 'react-icons/io5';

interface RoleDisplayProps {
  isShooter: boolean;
  playerNames: {
    creator: string;
    opponent: string;
  };
  currentAddress?: string;
}

export default function RoleDisplay({ isShooter, playerNames, currentAddress }: RoleDisplayProps) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-center space-x-8">
        <div className={`text-center p-3 rounded-lg ${isShooter ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
          <IoFootball className={`text-3xl mx-auto mb-2 ${isShooter ? 'text-green-600' : 'text-gray-400'}`} />
          <div className="font-bold text-sm">SHOOTER</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{playerNames.creator}</div>
          {isShooter && <div className="text-xs text-green-600 font-bold">← YOU</div>}
        </div>
        
        <div className="text-2xl font-bold text-gray-400">VS</div>
        
        <div className={`text-center p-3 rounded-lg ${!isShooter ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
          <IoShield className={`text-3xl mx-auto mb-2 ${!isShooter ? 'text-blue-600' : 'text-gray-400'}`} />
          <div className="font-bold text-sm">KEEPER</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{playerNames.opponent}</div>
          {!isShooter && <div className="text-xs text-blue-600 font-bold">← YOU</div>}
        </div>
      </div>
      
      <div className="text-center mt-3 text-xs text-gray-500">
        Creator is always Shooter • Opponent is always Keeper
      </div>
    </div>
  );
}