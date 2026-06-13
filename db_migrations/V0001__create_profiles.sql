CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(6) PRIMARY KEY,
  nickname VARCHAR(64) DEFAULT '',
  balance INTEGER DEFAULT 100,
  privileges TEXT[] DEFAULT '{}',
  avatar TEXT DEFAULT '',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
