import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Match {
  id: string;
  creator: string;
  opponent?: string;
  token: string;
  stake: string;
  state: number;
  createdAt: number;
  joinDeadline?: number;
  commitDeadline?: number;
  revealDeadline?: number;
  winner?: string;
  creatorCommitted: boolean;
  opponentCommitted: boolean;
  creatorRevealed: boolean;
  opponentRevealed: boolean;
  feeBps: number;
}

export interface GameState {
  currentMatch?: Match;
  playerChoices: number[];
  playerSalt: string;
  commitment?: string;
  isRevealed: boolean;
}

export interface UIState {
  isLoading: boolean;
  error?: string;
  theme: 'light' | 'dark';
  showTutorial: boolean;
}

// Store interface
interface AppState {
  // Game state
  matches: Record<string, Match>;
  gameState: GameState;
  uiState: UIState;
  
  // Actions
  setMatch: (match: Match) => void;
  updateMatch: (id: string, updates: Partial<Match>) => void;
  removeMatch: (id: string) => void;
  setCurrentMatch: (match?: Match) => void;
  
  // Game actions
  setPlayerChoices: (choices: number[]) => void;
  setPlayerSalt: (salt: string) => void;
  setCommitment: (commitment: string) => void;
  setRevealed: (revealed: boolean) => void;
  resetGameState: () => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setShowTutorial: (show: boolean) => void;
  
  // Utility actions
  clearAll: () => void;
}

// Initial states
const initialGameState: GameState = {
  playerChoices: [],
  playerSalt: '',
  isRevealed: false,
};

const initialUIState: UIState = {
  isLoading: false,
  theme: 'dark',
  showTutorial: true,
};

// Create store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      matches: {},
      gameState: initialGameState,
      uiState: initialUIState,
      
      // Match actions
      setMatch: (match) =>
        set((state) => ({
          matches: { ...state.matches, [match.id]: match },
        })),
      
      updateMatch: (id, updates) =>
        set((state) => ({
          matches: {
            ...state.matches,
            [id]: { ...state.matches[id], ...updates },
          },
        })),
      
      removeMatch: (id) =>
        set((state) => {
          const { [id]: removed, ...rest } = state.matches;
          return { matches: rest };
        }),
      
      setCurrentMatch: (match) =>
        set((state) => ({
          gameState: { ...state.gameState, currentMatch: match },
        })),
      
      // Game actions
      setPlayerChoices: (choices) =>
        set((state) => ({
          gameState: { ...state.gameState, playerChoices: choices },
        })),
      
      setPlayerSalt: (salt) =>
        set((state) => ({
          gameState: { ...state.gameState, playerSalt: salt },
        })),
      
      setCommitment: (commitment) =>
        set((state) => ({
          gameState: { ...state.gameState, commitment },
        })),
      
      setRevealed: (revealed) =>
        set((state) => ({
          gameState: { ...state.gameState, isRevealed: revealed },
        })),
      
      resetGameState: () =>
        set((state) => ({
          gameState: initialGameState,
        })),
      
      // UI actions
      setLoading: (loading) =>
        set((state) => ({
          uiState: { ...state.uiState, isLoading: loading },
        })),
      
      setError: (error) =>
        set((state) => ({
          uiState: { ...state.uiState, error },
        })),
      
      setTheme: (theme) =>
        set((state) => ({
          uiState: { ...state.uiState, theme },
        })),
      
      setShowTutorial: (show) =>
        set((state) => ({
          uiState: { ...state.uiState, showTutorial: show },
        })),
      
      // Utility actions
      clearAll: () =>
        set(() => ({
          matches: {},
          gameState: initialGameState,
          uiState: { ...initialUIState, theme: get().uiState.theme },
        })),
    }),
    {
      name: 'penalty-shootout-storage',
      partialize: (state) => ({
        matches: state.matches,
        gameState: {
          playerChoices: state.gameState.playerChoices,
          playerSalt: state.gameState.playerSalt,
          commitment: state.gameState.commitment,
          isRevealed: state.gameState.isRevealed,
        },
        uiState: {
          theme: state.uiState.theme,
          showTutorial: state.uiState.showTutorial,
        },
      }),
    }
  )
);

// Selectors
export const useMatches = () => useAppStore((state) => state.matches);
export const useCurrentMatch = () => useAppStore((state) => state.gameState.currentMatch);
export const usePlayerChoices = () => useAppStore((state) => state.gameState.playerChoices);
export const usePlayerSalt = () => useAppStore((state) => state.gameState.playerSalt);
export const useCommitment = () => useAppStore((state) => state.gameState.commitment);
export const useIsRevealed = () => useAppStore((state) => state.gameState.isRevealed);
export const useIsLoading = () => useAppStore((state) => state.uiState.isLoading);
export const useError = () => useAppStore((state) => state.uiState.error);
export const useTheme = () => useAppStore((state) => state.uiState.theme);
export const useShowTutorial = () => useAppStore((state) => state.uiState.showTutorial);

// Computed selectors
export const usePlayerMatches = (playerAddress?: string) =>
  useAppStore((state) => {
    if (!playerAddress) return [];
    return Object.values(state.matches).filter(
      (match) => match.creator === playerAddress || match.opponent === playerAddress
    );
  });

export const useOpenMatches = () =>
  useAppStore((state) =>
    Object.values(state.matches).filter((match) => match.state === 0) // Created state
  );

export const useActiveMatches = (playerAddress?: string) =>
  useAppStore((state) => {
    if (!playerAddress) return [];
    return Object.values(state.matches).filter(
      (match) =>
        (match.creator === playerAddress || match.opponent === playerAddress) &&
        match.state >= 1 && match.state <= 3 // Joined, Committed, or RevealWindow
    );
  });

// Action hooks
export const useMatchActions = () => {
  const { setMatch, updateMatch, removeMatch, setCurrentMatch } = useAppStore();
  return { setMatch, updateMatch, removeMatch, setCurrentMatch };
};

export const useGameActions = () => {
  const {
    setPlayerChoices,
    setPlayerSalt,
    setCommitment,
    setRevealed,
    resetGameState,
  } = useAppStore();
  return {
    setPlayerChoices,
    setPlayerSalt,
    setCommitment,
    setRevealed,
    resetGameState,
  };
};

export const useUIActions = () => {
  const { setLoading, setError, setTheme, setShowTutorial } = useAppStore();
  return { setLoading, setError, setTheme, setShowTutorial };
};