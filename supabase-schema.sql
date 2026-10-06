-- Arc Fitness Tracker — Supabase Schema v2
-- Multi-user, RLS-enabled. Run this in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at      TIMESTAMPTZ,
  session_label TEXT
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_sessions" ON sessions FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_settings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_calories  INTEGER NOT NULL DEFAULT 1200,
  target_protein   INTEGER NOT NULL DEFAULT 70,
  target_carbs     INTEGER NOT NULL DEFAULT 150,
  target_fat       INTEGER NOT NULL DEFAULT 40,
  target_water     INTEGER NOT NULL DEFAULT 2500,
  goal_weight      NUMERIC(5,2) NOT NULL DEFAULT 80,
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_user_settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS food_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  UUID REFERENCES sessions(id) ON DELETE CASCADE,
  meal_type   TEXT NOT NULL DEFAULT 'meal',
  food_name   TEXT NOT NULL,
  calories    NUMERIC(8,2),
  protein     NUMERIC(8,2),
  carbs       NUMERIC(8,2),
  fat         NUMERIC(8,2),
  fiber       NUMERIC(8,2),
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_food_logs" ON food_logs FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS workout_logs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id         UUID REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_name      TEXT NOT NULL,
  sets               INTEGER,
  reps               INTEGER,
  duration_minutes   NUMERIC(8,2),
  calories_burned    NUMERIC(8,2),
  notes              TEXT,
  logged_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_workout_logs" ON workout_logs FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS water_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  UUID REFERENCES sessions(id) ON DELETE CASCADE,
  amount_ml   INTEGER NOT NULL,
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_water_logs" ON water_logs FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS weight_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  UUID REFERENCES sessions(id) ON DELETE CASCADE,
  weight_kg   NUMERIC(5,2) NOT NULL,
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_weight_logs" ON weight_logs FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS sleep_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id      UUID REFERENCES sessions(id) ON DELETE CASCADE,
  sleep_start     TIMESTAMPTZ NOT NULL,
  sleep_end       TIMESTAMPTZ,
  duration_hours  NUMERIC(5,2),
  quality_rating  INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_sleep_logs" ON sleep_logs FOR ALL USING (auth.uid() = user_id);
