CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  wpm INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  chars_typed INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  is_best BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scores_best_idx ON scores (is_best, duration_seconds, wpm DESC);
