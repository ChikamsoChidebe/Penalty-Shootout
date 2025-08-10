// Game state management for multiplayer matches
export interface GameMatch {
  id: string;
  creator: string;
  opponent: string | null;
  stake: string; // ETH amount
  state: 'waiting' | 'active' | 'finished';
  creatorChoices: string[]; // encrypted choices
  opponentChoices: string[]; // encrypted choices
  creatorRevealed: boolean;
  opponentRevealed: boolean;
  winner: string | null;
  createdAt: number;
  rounds: GameRound[];
}

export interface GameRound {
  roundNumber: number;
  creatorChoice: 'left' | 'center' | 'right' | null;
  opponentChoice: 'left' | 'center' | 'right' | null;
  winner: 'creator' | 'opponent' | null;
}

export interface PlayerStats {
  address: string;
  gamesPlayed: number;
  gamesWon: number;
  totalEarnings: string;
  winRate: number;
  rank: number;
}

// In-memory storage for demo (in production, use database)
export class GameStateManager {
  private static matches: Map<string, GameMatch> = new Map();
  private static playerStats: Map<string, PlayerStats> = new Map();

  static createMatch(creator: string, stake: string): GameMatch {
    const matchId = Date.now().toString();
    const match: GameMatch = {
      id: matchId,
      creator,
      opponent: null,
      stake,
      state: 'waiting',
      creatorChoices: [],
      opponentChoices: [],
      creatorRevealed: false,
      opponentRevealed: false,
      winner: null,
      createdAt: Date.now(),
      rounds: []
    };
    
    this.matches.set(matchId, match);
    return match;
  }

  static joinMatch(matchId: string, opponent: string): GameMatch | null {
    const match = this.matches.get(matchId);
    if (!match || match.opponent || match.creator === opponent) return null;
    
    match.opponent = opponent;
    match.state = 'active';
    this.matches.set(matchId, match);
    return match;
  }

  static getMatch(matchId: string): GameMatch | null {
    return this.matches.get(matchId) || null;
  }

  static getAvailableMatches(): GameMatch[] {
    return Array.from(this.matches.values()).filter(m => m.state === 'waiting');
  }

  static getPlayerMatches(playerAddress: string): GameMatch[] {
    return Array.from(this.matches.values()).filter(
      m => m.creator === playerAddress || m.opponent === playerAddress
    );
  }

  static submitChoices(matchId: string, playerAddress: string, choices: string[]): boolean {
    const match = this.matches.get(matchId);
    if (!match || match.state !== 'active') return false;

    if (match.creator === playerAddress) {
      match.creatorChoices = choices;
    } else if (match.opponent === playerAddress) {
      match.opponentChoices = choices;
    } else {
      return false;
    }

    this.matches.set(matchId, match);
    return true;
  }

  static revealChoices(matchId: string, playerAddress: string, revealedChoices: ('left' | 'center' | 'right')[]): boolean {
    const match = this.matches.get(matchId);
    if (!match) return false;

    if (match.creator === playerAddress) {
      match.creatorRevealed = true;
    } else if (match.opponent === playerAddress) {
      match.opponentRevealed = true;
    } else {
      return false;
    }

    // If both players revealed, calculate winner
    if (match.creatorRevealed && match.opponentRevealed) {
      this.calculateMatchWinner(matchId, revealedChoices);
    }

    this.matches.set(matchId, match);
    return true;
  }

  private static calculateMatchWinner(matchId: string, choices: ('left' | 'center' | 'right')[]): void {
    const match = this.matches.get(matchId);
    if (!match) return;

    // Simulate opponent choices for demo
    const opponentChoices: ('left' | 'center' | 'right')[] = [
      ['left', 'center', 'right'][Math.floor(Math.random() * 3)] as 'left' | 'center' | 'right',
      ['left', 'center', 'right'][Math.floor(Math.random() * 3)] as 'left' | 'center' | 'right',
      ['left', 'center', 'right'][Math.floor(Math.random() * 3)] as 'left' | 'center' | 'right'
    ];

    let creatorScore = 0;
    let opponentScore = 0;

    // Calculate rounds
    for (let i = 0; i < 3; i++) {
      const creatorChoice = choices[i];
      const opponentChoice = opponentChoices[i];
      
      // Creator (shooter) wins if opponent (keeper) guesses wrong
      if (creatorChoice !== opponentChoice) {
        creatorScore++;
      } else {
        opponentScore++;
      }

      match.rounds.push({
        roundNumber: i + 1,
        creatorChoice,
        opponentChoice,
        winner: creatorChoice !== opponentChoice ? 'creator' : 'opponent'
      });
    }

    // Determine match winner
    if (creatorScore > opponentScore) {
      match.winner = match.creator;
    } else if (opponentScore > creatorScore) {
      match.winner = match.opponent;
    } else {
      match.winner = null; // Draw
    }

    match.state = 'finished';
    
    // Update player stats
    this.updatePlayerStats(match.creator, creatorScore > opponentScore, match.stake);
    if (match.opponent) {
      this.updatePlayerStats(match.opponent, opponentScore > creatorScore, match.stake);
    }
  }

  private static updatePlayerStats(playerAddress: string, won: boolean, stake: string): void {
    let stats = this.playerStats.get(playerAddress) || {
      address: playerAddress,
      gamesPlayed: 0,
      gamesWon: 0,
      totalEarnings: '0',
      winRate: 0,
      rank: 0
    };

    stats.gamesPlayed++;
    if (won) {
      stats.gamesWon++;
      // Winner gets 2x stake minus 1% fee = stake * 2 * 0.99
      const earnings = parseFloat(stake) * 2 * 0.99;
      stats.totalEarnings = (parseFloat(stats.totalEarnings) + earnings).toString();
    }
    
    stats.winRate = (stats.gamesWon / stats.gamesPlayed) * 100;
    this.playerStats.set(playerAddress, stats);
  }

  static getPlayerStats(playerAddress: string): PlayerStats | null {
    return this.playerStats.get(playerAddress) || null;
  }

  static getLeaderboard(): PlayerStats[] {
    const allStats = Array.from(this.playerStats.values());
    return allStats
      .filter(s => s.gamesPlayed > 0)
      .sort((a, b) => parseFloat(b.totalEarnings) - parseFloat(a.totalEarnings))
      .map((stats, index) => ({ ...stats, rank: index + 1 }))
      .slice(0, 10); // Top 10
  }
}