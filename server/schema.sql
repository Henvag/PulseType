CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  keyboard_model TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  unlocked_titles TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS keyboard_model TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS unlocked_titles TEXT[] DEFAULT '{}'::text[];

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
