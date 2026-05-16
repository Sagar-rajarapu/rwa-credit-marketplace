-- Users (borrowers and investors)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  stellar_address VARCHAR(56) UNIQUE NOT NULL,
  role VARCHAR(16) NOT NULL CHECK (role IN ('borrower', 'investor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset listings mirrored from on-chain
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER UNIQUE NOT NULL,  -- on-chain listing id
  borrower_address VARCHAR(56) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  asset_type VARCHAR(64),
  target_amount BIGINT NOT NULL,
  interest_bps INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  status VARCHAR(16) DEFAULT 'open' CHECK (status IN ('open', 'funded', 'cancelled')),
  loan_pool_contract VARCHAR(56),
  loan_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment records
CREATE TABLE IF NOT EXISTS investments (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(listing_id),
  investor_address VARCHAR(56) NOT NULL,
  amount BIGINT NOT NULL,
  tx_hash CHAR(64) UNIQUE NOT NULL,  -- Stellar tx hash: exactly 64 hex chars, must be unique
  created_at TIMESTAMPTZ DEFAULT NOW()
);
