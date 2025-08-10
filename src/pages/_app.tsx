import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { config } from '@/lib/wagmi';
import { useTheme } from '@/state/store';
import { useEffect, useState } from 'react';

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={theme === 'dark' ? darkTheme() : lightTheme()}
          showRecentTransactions={true}
          appInfo={{
            appName: 'Penalty Shootout Duel',
            learnMoreUrl: 'https://github.com/your-username/penalty-shootout-duel',
          }}
        >
          <div className={`min-h-screen transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
              : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
          }`}>
            <Component {...pageProps} />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: theme === 'dark' ? '#374151' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  border: `1px solid ${theme === 'dark' ? '#4B5563' : '#E5E7EB'}`,
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;