import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTheme, useUIActions } from '@/state/store';
import { IoFootball, IoSunny, IoMoon, IoHeart, IoMenu, IoClose } from 'react-icons/io5';

interface LayoutProps {
  children: ReactNode;
}

interface NavLinkProps {
  href: string;
  children: ReactNode;
  router: any;
}

function NavLink({ href, children, router }: NavLinkProps) {
  const isActive = router.pathname === href;
  
  return (
    <Link
      href={href}
      className={`block transition-colors ${
        isActive
          ? 'text-primary-600 dark:text-primary-400 font-medium'
          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const { setTheme } = useUIActions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <IoFootball className="text-xl sm:text-2xl text-primary-600" />
              <div className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                <span className="hidden sm:inline">Penalty Shootout</span>
                <span className="sm:hidden">Shootout</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <NavLink href="/" router={router}>Home</NavLink>
              <NavLink href="/my-matches" router={router}>My Matches</NavLink>
              <NavLink href="/leaderboard" router={router}>Leaderboard</NavLink>
              <NavLink href="/stats" router={router}>Stats</NavLink>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <IoSunny className="text-lg" /> : <IoMoon className="text-lg" />}
              </button>
              <ConnectButton />
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {theme === 'dark' ? <IoSunny className="text-lg" /> : <IoMoon className="text-lg" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <IoClose className="text-lg" /> : <IoMenu className="text-lg" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="px-4 py-4 space-y-4">
                <nav className="space-y-3">
                  <NavLink href="/" router={router}>Home</NavLink>
                  <NavLink href="/my-matches" router={router}>My Matches</NavLink>
                  <NavLink href="/leaderboard" router={router}>Leaderboard</NavLink>
                  <NavLink href="/stats" router={router}>Stats</NavLink>
                </nav>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <ConnectButton />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                About
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A fully on-chain penalty shootout betting game built for the Somnia Testnet hackathon.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href={process.env.NEXT_PUBLIC_FAUCET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Testnet Faucet
                  </a>
                </li>
                <li>
                  <a
                    href={process.env.NEXT_PUBLIC_EXPLORER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Block Explorer
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/your-username/penalty-shootout-duel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Tech Stack
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Solidity 0.8.20</li>
                <li>Next.js 14</li>
                <li>Wagmi + RainbowKit</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>

            {/* Network */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Network
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Somnia Testnet</span>
                </div>
                <div>Chain ID: 50312</div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                © 2024 Penalty Shootout Duel. Built for Somnia Hackathon.
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                  <span>Made with</span>
                  <IoHeart className="text-red-500" />
                  <span>for Web3 Gaming</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}