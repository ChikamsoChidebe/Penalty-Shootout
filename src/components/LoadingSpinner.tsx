import { IoFootball } from 'react-icons/io5';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        <IoFootball 
          className={`${sizeClasses[size]} text-primary-500 animate-spin`}
        />
        <div className="absolute inset-0 rounded-full border-2 border-primary-200 border-t-primary-500 animate-spin"></div>
      </div>
      {text && (
        <p className={`${textSizes[size]} text-gray-600 dark:text-gray-400 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
}