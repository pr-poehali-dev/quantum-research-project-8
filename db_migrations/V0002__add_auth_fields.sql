ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username) WHERE username != '';
