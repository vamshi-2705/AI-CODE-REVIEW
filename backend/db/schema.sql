CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255),
  name           VARCHAR(255),
  google_id      VARCHAR(255) UNIQUE,
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id             SERIAL PRIMARY KEY,
  user_id        INT REFERENCES users(id) ON DELETE CASCADE,
  original_code  TEXT NOT NULL,
  improved_code  TEXT NOT NULL,
  suggestions    JSONB NOT NULL,
  metrics        JSONB,
  language       VARCHAR(50),
  model_used     VARCHAR(50),
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qna (
  id             SERIAL PRIMARY KEY,
  user_id        INT REFERENCES users(id) ON DELETE CASCADE,
  question       TEXT NOT NULL,
  answer         TEXT NOT NULL,
  model_used     VARCHAR(50),
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversions (
  id             SERIAL PRIMARY KEY,
  user_id        INT REFERENCES users(id) ON DELETE CASCADE,
  original_code  TEXT NOT NULL,
  converted_code TEXT NOT NULL,
  target_language VARCHAR(50),
  model_used     VARCHAR(50),
  created_at     TIMESTAMP DEFAULT NOW()
);
