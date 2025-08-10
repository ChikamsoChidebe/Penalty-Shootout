// Auto-generated ABI - This will be updated after contract compilation
export const SHOOTOUT_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "COMMIT_DURATION",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "JOIN_TIMEOUT",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_FEE_BPS",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint16", "internalType": "uint16"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "REVEAL_DURATION",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ROUNDS",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint8", "internalType": "uint8"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "cancelMatch",
    "inputs": [{"name": "matchId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claim",
    "inputs": [{"name": "matchId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "commitChoices",
    "inputs": [
      {"name": "matchId", "type": "uint256", "internalType": "uint256"},
      {"name": "commitment", "type": "bytes32", "internalType": "bytes32"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createMatch",
    "inputs": [
      {"name": "token", "type": "address", "internalType": "address"},
      {"name": "stake", "type": "uint128", "internalType": "uint128"}
    ],
    "outputs": [{"name": "matchId", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "feeBps",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint16", "internalType": "uint16"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCurrentTimestamp",
    "inputs": [],
    "outputs": [{"name": "timestamp", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMatch",
    "inputs": [{"name": "matchId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [
      {
        "name": "match_",
        "type": "tuple",
        "internalType": "struct Shootout.Match",
        "components": [
          {"name": "creator", "type": "address", "internalType": "address"},
          {"name": "opponent", "type": "address", "internalType": "address"},
          {"name": "token", "type": "address", "internalType": "address"},
          {"name": "stake", "type": "uint128", "internalType": "uint128"},
          {"name": "createdAt", "type": "uint64", "internalType": "uint64"},
          {"name": "joinDeadline", "type": "uint64", "internalType": "uint64"},
          {"name": "commitDeadline", "type": "uint64", "internalType": "uint64"},
          {"name": "revealDeadline", "type": "uint64", "internalType": "uint64"},
          {"name": "state", "type": "uint8", "internalType": "enum Shootout.MatchState"},
          {"name": "feeBps", "type": "uint16", "internalType": "uint16"},
          {"name": "creatorCommitted", "type": "bool", "internalType": "bool"},
          {"name": "opponentCommitted", "type": "bool", "internalType": "bool"},
          {"name": "creatorRevealed", "type": "bool", "internalType": "bool"},
          {"name": "opponentRevealed", "type": "bool", "internalType": "bool"},
          {"name": "winner", "type": "address", "internalType": "address"},
          {"name": "creatorCommitment", "type": "bytes32", "internalType": "bytes32"},
          {"name": "opponentCommitment", "type": "bytes32", "internalType": "bytes32"},
          {"name": "creatorChoices", "type": "uint8", "internalType": "uint8"},
          {"name": "opponentChoices", "type": "uint8", "internalType": "uint8"}
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPlayerMatches",
    "inputs": [{"name": "player", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "matchIds", "type": "uint256[]", "internalType": "uint256[]"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "joinMatch",
    "inputs": [{"name": "matchId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "matchCounter",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "matches",
    "inputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "outputs": [
      {"name": "creator", "type": "address", "internalType": "address"},
      {"name": "opponent", "type": "address", "internalType": "address"},
      {"name": "token", "type": "address", "internalType": "address"},
      {"name": "stake", "type": "uint128", "internalType": "uint128"},
      {"name": "createdAt", "type": "uint64", "internalType": "uint64"},
      {"name": "joinDeadline", "type": "uint64", "internalType": "uint64"},
      {"name": "commitDeadline", "type": "uint64", "internalType": "uint64"},
      {"name": "revealDeadline", "type": "uint64", "internalType": "uint64"},
      {"name": "state", "type": "uint8", "internalType": "enum Shootout.MatchState"},
      {"name": "feeBps", "type": "uint16", "internalType": "uint16"},
      {"name": "creatorCommitted", "type": "bool", "internalType": "bool"},
      {"name": "opponentCommitted", "type": "bool", "internalType": "bool"},
      {"name": "creatorRevealed", "type": "bool", "internalType": "bool"},
      {"name": "opponentRevealed", "type": "bool", "internalType": "bool"},
      {"name": "winner", "type": "address", "internalType": "address"},
      {"name": "creatorCommitment", "type": "bytes32", "internalType": "bytes32"},
      {"name": "opponentCommitment", "type": "bytes32", "internalType": "bytes32"},
      {"name": "creatorChoices", "type": "uint8", "internalType": "uint8"},
      {"name": "opponentChoices", "type": "uint8", "internalType": "uint8"}
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{"name": "", "type": "address", "internalType": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "paused",
    "inputs": [],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "playerMatches",
    "inputs": [
      {"name": "", "type": "address", "internalType": "address"},
      {"name": "", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "protocolFees",
    "inputs": [{"name": "", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revealChoices",
    "inputs": [
      {"name": "matchId", "type": "uint256", "internalType": "uint256"},
      {"name": "choices", "type": "uint8", "internalType": "uint8"},
      {"name": "salt", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setFee",
    "inputs": [{"name": "newFeeBps", "type": "uint16", "internalType": "uint16"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "settleMatch",
    "inputs": [{"name": "matchId", "type": "uint256", "internalType": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [{"name": "newOwner", "type": "address", "internalType": "address"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unpause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "verifyCommitment",
    "inputs": [
      {"name": "choices", "type": "uint8", "internalType": "uint8"},
      {"name": "salt", "type": "uint256", "internalType": "uint256"},
      {"name": "player", "type": "address", "internalType": "address"},
      {"name": "commitment", "type": "bytes32", "internalType": "bytes32"}
    ],
    "outputs": [{"name": "valid", "type": "bool", "internalType": "bool"}],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "withdrawFees",
    "inputs": [{"name": "token", "type": "address", "internalType": "address"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "ChoicesCommitted",
    "inputs": [
      {"name": "matchId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "player", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "commitment", "type": "bytes32", "indexed": false, "internalType": "bytes32"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ChoicesRevealed",
    "inputs": [
      {"name": "matchId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "player", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "choices", "type": "uint8", "indexed": false, "internalType": "uint8"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "FeeUpdated",
    "inputs": [
      {"name": "oldFee", "type": "uint16", "indexed": false, "internalType": "uint16"},
      {"name": "newFee", "type": "uint16", "indexed": false, "internalType": "uint16"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "FeesWithdrawn",
    "inputs": [
      {"name": "token", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MatchCancelled",
    "inputs": [
      {"name": "matchId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "canceller", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "reason", "type": "string", "indexed": false, "internalType": "string"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MatchCreated",
    "inputs": [
      {"name": "matchId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "creator", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "token", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "stake", "type": "uint128", "indexed": false, "internalType": "uint128"},
      {"name": "joinDeadline", "type": "uint64", "indexed": false, "internalType": "uint64"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MatchJoined",
    "inputs": [
      {"name": "matchId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "opponent", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "commitDeadline", "type": "uint64", "indexed": false, "internalType": "uint64"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MatchSettled",
    "inputs": [
      {"name": "matchId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "winner", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "creatorScore", "type": "uint8", "indexed": false, "internalType": "uint8"},
      {"name": "opponentScore", "type": "uint8", "indexed": false, "internalType": "uint8"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {"name": "previousOwner", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "newOwner", "type": "address", "indexed": true, "internalType": "address"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Paused",
    "inputs": [
      {"name": "account", "type": "address", "indexed": false, "internalType": "address"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PrizeClaimed",
    "inputs": [
      {"name": "matchId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "claimer", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RevealWindowStarted",
    "inputs": [
      {"name": "matchId", "type": "uint256", "indexed": true, "internalType": "uint256"},
      {"name": "revealDeadline", "type": "uint64", "indexed": false, "internalType": "uint64"}
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Unpaused",
    "inputs": [
      {"name": "account", "type": "address", "indexed": false, "internalType": "address"}
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AlreadyCommitted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AlreadyRevealed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DeadlineExpired",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DeadlineNotReached",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientBalance",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidChoice",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidCommitment",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidFee",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidMatchState",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidPlayer",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidReveal",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidStake",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MatchNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoFeesToWithdraw",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotCommitted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {"name": "owner", "type": "address", "internalType": "address"}
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {"name": "account", "type": "address", "internalType": "address"}
    ]
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TransferFailed",
    "inputs": []
  }
] as const;

// Contract addresses by chain ID
export const CONTRACT_ADDRESSES: Record<number, string> = {
  50311: process.env.NEXT_PUBLIC_SHOOTOUT_ADDRESS || '', // Somnia Testnet
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Local hardhat
};

// Match states enum
export enum MatchState {
  Created = 0,
  Joined = 1,
  Committed = 2,
  RevealWindow = 3,
  Settled = 4,
  Cancelled = 5,
}

// Choice enum
export enum Choice {
  Left = 0,
  Center = 1,
  Right = 2,
}

// Helper functions
export const getContractAddress = (chainId: number): string => {
  return CONTRACT_ADDRESSES[chainId] || '';
};

export const formatMatchState = (state: number): string => {
  const states = ['Created', 'Joined', 'Committed', 'Reveal Window', 'Settled', 'Cancelled'];
  return states[state] || 'Unknown';
};

export const formatChoice = (choice: number): string => {
  const choices = ['Left', 'Center', 'Right'];
  return choices[choice] || 'Unknown';
};