import React, { createContext, useContext, ReactNode } from 'react';
import { useAllMatches, useMatchCounter } from '@/lib/contract';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ContractContextType {
  matches: any[];
  matchCounter: bigint | undefined;
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const useContractContext = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContractContext must be used within ContractProvider');
  }
  return context;
};

interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider: React.FC<ContractProviderProps> = ({ children }) => {
  const { data: matchCounter, refetch: refetchCounter } = useMatchCounter();
  const { data: matches, isLoading, error, refetch: refetchMatches } = useAllMatches();
  
  const refetch = () => {
    console.log('🔄 Refreshing contract data...');
    refetchCounter();
    refetchMatches();
  };

  const value: ContractContextType = {
    matches: matches || [],
    matchCounter,
    isLoading,
    error,
    refetch,
  };

  // Show loading spinner on initial load
  if (isLoading && !matches) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading contract data..." />
      </div>
    );
  }

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};