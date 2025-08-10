import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase not configured - using offline mode');
}

export const supabase = (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) ? 
  createClient(supabaseUrl, supabaseKey) : null;

// Database schema interfaces
export interface Player {
  id: string;
  wallet_address: string;
  username?: string;
  games_played: number;
  games_won: number;
  total_earnings: number;
  win_rate: number;
  created_at: string;
  last_active: string;
}

export interface Match {
  id: string;
  creator_address: string;
  opponent_address?: string;
  stake_amount: number;
  status: 'waiting' | 'active' | 'finished';
  winner_address?: string;
  creator_choices?: string[];
  opponent_choices?: string[];
  rounds_data?: any;
  created_at: string;
  finished_at?: string;
}

export interface GameStats {
  total_matches: number;
  total_volume: number;
  active_players: number;
  matches_today: number;
  volume_today: number;
}

// Database Operations
class SupabaseDatabase {
  // Player operations
  async getOrCreatePlayer(walletAddress: string): Promise<Player> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const { data: existing } = await supabase
      .from('players')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (existing) {
      await supabase
        .from('players')
        .update({ last_active: new Date().toISOString() })
        .eq('wallet_address', walletAddress);
      return existing;
    }

    const { data: newPlayer } = await supabase
      .from('players')
      .insert({
        wallet_address: walletAddress,
        games_played: 0,
        games_won: 0,
        total_earnings: 0,
        win_rate: 0
      })
      .select()
      .single();

    return newPlayer!;
  }

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    if (!supabase) {
      return [];
    }

    const { data } = await supabase
      .from('players')
      .select('*')
      .gt('games_played', 0)
      .order('total_earnings', { ascending: false })
      .limit(limit);

    // Map database fields to PlayerStats interface
    return (data || []).map((player, index) => ({
      address: player.wallet_address,
      gamesPlayed: player.games_played,
      gamesWon: player.games_won,
      totalEarnings: player.total_earnings.toString(),
      winRate: player.win_rate,
      rank: index + 1
    }));
  }

  // Match operations
  async createMatch(creatorAddress: string, stakeAmount: number): Promise<Match> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const { data } = await supabase
      .from('matches')
      .insert({
        creator_address: creatorAddress,
        stake_amount: stakeAmount,
        status: 'waiting'
      })
      .select()
      .single();

    return data!;
  }

  async createAIMatch(creatorAddress: string, stakeAmount: number): Promise<Match> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const { data } = await supabase
      .from('matches')
      .insert({
        creator_address: creatorAddress,
        opponent_address: 'AI_OPPONENT',
        stake_amount: stakeAmount,
        status: 'active'
      })
      .select()
      .single();

    return data!;
  }

  async joinMatch(matchId: string, opponentAddress: string): Promise<Match | null> {
    const { data } = await supabase
      .from('matches')
      .update({
        opponent_address: opponentAddress,
        status: 'active',
        started_at: new Date().toISOString()
      })
      .eq('id', matchId)
      .eq('status', 'waiting')
      .select()
      .single();

    return data;
  }

  async finishMatch(matchId: string, winnerAddress: string | null, roundsData: any): Promise<void> {
    if (!supabase) return;
    
    await supabase
      .from('matches')
      .update({
        status: 'finished',
        winner_address: winnerAddress,
        rounds_data: roundsData,
        finished_at: new Date().toISOString()
      })
      .eq('id', matchId);
  }

  async getMatch(matchId: string): Promise<Match | null> {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    return data;
  }

  async getAvailableMatches(): Promise<Match[]> {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });

    return data || [];
  }

  async getPlayerMatches(playerAddress: string): Promise<Match[]> {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .or(`creator_address.eq.${playerAddress},opponent_address.eq.${playerAddress}`)
      .order('created_at', { ascending: false });

    return data || [];
  }

  async getGameStats(): Promise<GameStats> {
    if (!supabase) {
      return {
        total_matches: 0,
        total_volume: 0,
        active_players: 0,
        matches_today: 0,
        volume_today: 0
      };
    }

    const { data: matchStats } = await supabase
      .from('matches')
      .select('stake_amount, created_at')
      .eq('status', 'finished');

    const { data: activePlayers } = await supabase
      .from('players')
      .select('id')
      .gte('last_active', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const today = new Date().toISOString().split('T')[0];
    const todayMatches = matchStats?.filter(m => m.created_at.startsWith(today)) || [];

    return {
      total_matches: matchStats?.length || 0,
      total_volume: matchStats?.reduce((sum, m) => sum + (m.stake_amount * 2), 0) || 0,
      active_players: activePlayers?.length || 0,
      matches_today: todayMatches.length,
      volume_today: todayMatches.reduce((sum, m) => sum + (m.stake_amount * 2), 0)
    };
  }

  async recordTransaction(walletAddress: string, txHash: string, type: string, matchId?: string, amount?: number): Promise<void> {
    await supabase
      .from('transactions')
      .insert({
        wallet_address: walletAddress,
        transaction_hash: txHash,
        transaction_type: type,
        match_id: matchId,
        amount: amount,
        status: 'pending'
      });
  }

  async updateBalance(walletAddress: string, balance: number): Promise<void> {
    await supabase
      .from('players')
      .update({ balance, last_active: new Date().toISOString() })
      .eq('wallet_address', walletAddress);
  }
}

// Export singleton instance
export const db = new SupabaseDatabase();

// Supabase API functions
export const supabaseAPI = {
  // Players
  getOrCreatePlayer: (address: string) => db.getOrCreatePlayer(address),
  getLeaderboard: (limit?: number) => db.getLeaderboard(limit),
  updateBalance: (address: string, balance: number) => db.updateBalance(address, balance),
  
  // Matches
  createMatch: (creator: string, stake: number) => db.createMatch(creator, stake),
  createAIMatch: (creator: string, stake: number) => db.createAIMatch(creator, stake),
  joinMatch: (matchId: string, opponent: string) => db.joinMatch(matchId, opponent),
  finishMatch: (matchId: string, winner: string, rounds: any) => db.finishMatch(matchId, winner, rounds),
  getMatch: (matchId: string) => db.getMatch(matchId),
  getAvailableMatches: () => db.getAvailableMatches(),
  getPlayerMatches: (address: string) => db.getPlayerMatches(address),
  
  // Stats
  getGameStats: () => db.getGameStats(),
  
  // Transactions
  recordTransaction: (address: string, txHash: string, type: string, matchId?: string, amount?: number) => 
    db.recordTransaction(address, txHash, type, matchId, amount)
};