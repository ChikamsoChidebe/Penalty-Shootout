import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
}

export default function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          <p className={`text-sm mt-1 ${
            isPositive 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {change} from last week
          </p>
        </div>
        <div>
          {icon}
        </div>
      </div>
    </div>
  );
}