CREATE TABLE reviews (
  id             SERIAL PRIMARY KEY,
  original_code  TEXT NOT NULL,
  improved_code  TEXT NOT NULL,
  suggestions    JSONB NOT NULL,
  language       VARCHAR(50),
  model_used     VARCHAR(50),
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE qna (
  id             SERIAL PRIMARY KEY,
  question       TEXT NOT NULL,
  answer         TEXT NOT NULL,
  model_used     VARCHAR(50),
  created_at     TIMESTAMP DEFAULT NOW()
);
