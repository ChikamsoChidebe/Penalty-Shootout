-- Penalty Shootout Duel Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_earnings DECIMAL(18, 8) DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0,
    balance DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_address TEXT NOT NULL,
    opponent_address TEXT,
    stake_amount DECIMAL(18, 8) NOT NULL,
    status TEXT CHECK (status IN ('waiting', 'active', 'finished', 'cancelled')) DEFAULT 'waiting',
    winner_address TEXT,
    creator_choices JSONB,
    opponent_choices JSONB,
    rounds_data JSONB,
    transaction_hash TEXT,
    block_number BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game rounds table (for detailed round tracking)
CREATE TABLE game_rounds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    creator_choice TEXT CHECK (creator_choice IN ('left', 'center', 'right')),
    opponent_choice TEXT CHECK (opponent_choice IN ('left', 'center', 'right')),
    creator_role TEXT CHECK (creator_role IN ('shooter', 'keeper')),
    winner TEXT CHECK (winner IN ('creator', 'opponent', 'draw')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (for tracking all blockchain interactions)
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    transaction_hash TEXT UNIQUE NOT NULL,
    transaction_type TEXT CHECK (transaction_type IN ('create_match', 'join_match', 'commit_choices', 'reveal_choices', 'claim_winnings')) NOT NULL,
    match_id UUID REFERENCES matches(id),
    amount DECIMAL(18, 8),
    gas_used BIGINT,
    gas_price DECIMAL(18, 8),
    block_number BIGINT,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_players_wallet ON players(wallet_address);
CREATE INDEX idx_players_earnings ON players(total_earnings DESC);
CREATE INDEX idx_players_last_active ON players(last_active);
CREATE INDEX idx_matches_creator ON matches(creator_address);
CREATE INDEX idx_matches_opponent ON matches(opponent_address);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_created_at ON matches(created_at);
CREATE INDEX idx_transactions_wallet ON transactions(wallet_address);
CREATE INDEX idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX idx_game_rounds_match ON game_rounds(match_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update winner stats
    IF NEW.winner_address IS NOT NULL AND OLD.winner_address IS NULL THEN
        UPDATE players 
        SET 
            games_won = games_won + 1,
            total_earnings = total_earnings + (NEW.stake_amount * 2 * 0.99),
            win_rate = CASE 
                WHEN games_played > 0 THEN (games_won + 1) * 100.0 / games_played 
                ELSE 100 
            END,
            updated_at = NOW()
        WHERE wallet_address = NEW.winner_address;
        
        -- Update loser stats
        UPDATE players 
        SET 
            win_rate = CASE 
                WHEN games_played > 0 THEN games_won * 100.0 / games_played 
                ELSE 0 
            END,
            updated_at = NOW()
        WHERE wallet_address = CASE 
            WHEN NEW.creator_address = NEW.winner_address THEN NEW.opponent_address 
            ELSE NEW.creator_address 
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update games_played when match becomes active
CREATE OR REPLACE FUNCTION update_games_played()
RETURNS TRIGGER AS $$
BEGIN
    -- When match becomes active, increment games_played for both players
    IF NEW.status = 'active' AND OLD.status = 'waiting' THEN
        UPDATE players 
        SET 
            games_played = games_played + 1,
            last_active = NOW(),
            updated_at = NOW()
        WHERE wallet_address IN (NEW.creator_address, NEW.opponent_address);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_player_stats
    AFTER UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_player_stats();

CREATE TRIGGER trigger_update_games_played
    AFTER UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_games_played();

-- Insert demo data
INSERT INTO players (wallet_address, username, games_played, games_won, total_earnings, win_rate) VALUES
('0x1234567890123456789012345678901234567890', 'CryptoKicker', 45, 32, 0.6336, 71.11),
('0x2345678901234567890123456789012345678901', 'PenaltyPro', 38, 25, 0.4950, 65.79),
('0x3456789012345678901234567890123456789012', 'GoalMaster', 52, 31, 0.6138, 59.62),
('0x4567890123456789012345678901234567890123', 'ShotStopper', 29, 18, 0.3564, 62.07),
('0x5678901234567890123456789012345678901234', 'NetNinja', 41, 28, 0.5544, 68.29);