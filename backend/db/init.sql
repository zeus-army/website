-- Create the leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    ens_name VARCHAR(255),
    signature TEXT NOT NULL,
    zeus_balance NUMERIC(78, 0) DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_wallet_address ON leaderboard(wallet_address);
CREATE INDEX idx_zeus_balance ON leaderboard(zeus_balance DESC);

-- Create a function to update the last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update last_updated
CREATE TRIGGER update_leaderboard_last_updated
    BEFORE UPDATE ON leaderboard
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();