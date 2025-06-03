/*
  # Create leaderboards tables and views

  1. New Tables
    - `leaderboards`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key, nullable)
      - `points` (integer)
      - `period` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for data access
  3. Views & Functions
    - Create functions to update leaderboards
    - Create triggers to maintain leaderboards automatically
*/

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) NOT NULL,
  user_id uuid REFERENCES users(id),
  points integer DEFAULT 0,
  period text NOT NULL CHECK (period IN ('weekly', 'monthly', 'all-time')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, user_id, period)
);

-- Enable Row Level Security
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- Create policies for leaderboards table
CREATE POLICY "Users can view leaderboards in their company"
  ON leaderboards
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

-- Function to update user leaderboard entries
CREATE OR REPLACE FUNCTION update_user_leaderboards()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id uuid;
  v_week_start timestamptz;
  v_month_start timestamptz;
BEGIN
  -- Get user's company_id
  SELECT company_id INTO v_company_id
  FROM users
  WHERE id = NEW.user_id;
  
  -- Calculate period start dates
  v_week_start := date_trunc('week', CURRENT_DATE);
  v_month_start := date_trunc('month', CURRENT_DATE);
  
  -- Update weekly leaderboard
  INSERT INTO leaderboards (company_id, user_id, points, period)
  VALUES (v_company_id, NEW.user_id, NEW.points_earned, 'weekly')
  ON CONFLICT (company_id, user_id, period)
  DO UPDATE SET points = leaderboards.points + NEW.points_earned;
  
  -- Update monthly leaderboard
  INSERT INTO leaderboards (company_id, user_id, points, period)
  VALUES (v_company_id, NEW.user_id, NEW.points_earned, 'monthly')
  ON CONFLICT (company_id, user_id, period)
  DO UPDATE SET points = leaderboards.points + NEW.points_earned;
  
  -- Update all-time leaderboard
  INSERT INTO leaderboards (company_id, user_id, points, period)
  VALUES (v_company_id, NEW.user_id, NEW.points_earned, 'all-time')
  ON CONFLICT (company_id, user_id, period)
  DO UPDATE SET points = leaderboards.points + NEW.points_earned;
  
  -- Update user's total points
  UPDATE users
  SET points = points + NEW.points_earned
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update leaderboards when habits are logged
CREATE TRIGGER update_leaderboards_on_habit_log
AFTER INSERT ON habits
FOR EACH ROW
EXECUTE FUNCTION update_user_leaderboards();

-- Function to update company leaderboard entries
CREATE OR REPLACE FUNCTION update_company_leaderboards()
RETURNS TRIGGER AS $$
BEGIN
  -- Update weekly company leaderboard
  INSERT INTO leaderboards (company_id, user_id, points, period)
  VALUES (NEW.company_id, NULL, NEW.points_earned, 'weekly')
  ON CONFLICT (company_id, user_id, period)
  DO UPDATE SET points = leaderboards.points + NEW.points_earned;
  
  -- Update monthly company leaderboard
  INSERT INTO leaderboards (company_id, user_id, points, period)
  VALUES (NEW.company_id, NULL, NEW.points_earned, 'monthly')
  ON CONFLICT (company_id, user_id, period)
  DO UPDATE SET points = leaderboards.points + NEW.points_earned;
  
  -- Update all-time company leaderboard
  INSERT INTO leaderboards (company_id, user_id, points, period)
  VALUES (NEW.company_id, NULL, NEW.points_earned, 'all-time')
  ON CONFLICT (company_id, user_id, period)
  DO UPDATE SET points = leaderboards.points + NEW.points_earned;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update company leaderboards when habits are logged
CREATE TRIGGER update_company_leaderboards_on_habit_log
AFTER INSERT ON habits
FOR EACH ROW
EXECUTE FUNCTION update_company_leaderboards();

-- Function to award badges based on achievements
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  v_streak integer;
  v_total_habits integer;
  v_habit_types integer;
BEGIN
  -- Check for streak badges
  SELECT COUNT(*) INTO v_streak
  FROM habits
  WHERE user_id = NEW.user_id
  AND date >= CURRENT_DATE - INTERVAL '7 days'
  AND date <= CURRENT_DATE
  GROUP BY DATE_TRUNC('day', date)
  HAVING COUNT(*) > 0;
  
  IF v_streak >= 7 THEN
    -- Award 7-day streak badge if not already awarded
    IF NOT EXISTS (
      SELECT 1 FROM badges
      WHERE user_id = NEW.user_id
      AND name = '7-Day Streak Master'
      AND date_earned >= CURRENT_DATE - INTERVAL '30 days'
    ) THEN
      INSERT INTO badges (user_id, name, description)
      VALUES (
        NEW.user_id,
        '7-Day Streak Master',
        'Completed at least one habit every day for 7 consecutive days'
      );
    END IF;
  END IF;
  
  -- Check for total habits badges
  SELECT COUNT(*) INTO v_total_habits
  FROM habits
  WHERE user_id = NEW.user_id;
  
  IF v_total_habits >= 50 THEN
    -- Award 50 habits badge if not already awarded
    IF NOT EXISTS (
      SELECT 1 FROM badges
      WHERE user_id = NEW.user_id
      AND name = 'Habit Champion'
    ) THEN
      INSERT INTO badges (user_id, name, description)
      VALUES (
        NEW.user_id,
        'Habit Champion',
        'Logged 50 or more habits'
      );
    END IF;
  END IF;
  
  -- Check for habit variety badges
  SELECT COUNT(DISTINCT habit_type_id) INTO v_habit_types
  FROM habits
  WHERE user_id = NEW.user_id;
  
  IF v_habit_types >= 4 THEN
    -- Award variety badge if not already awarded
    IF NOT EXISTS (
      SELECT 1 FROM badges
      WHERE user_id = NEW.user_id
      AND name = 'Well-Rounded'
    ) THEN
      INSERT INTO badges (user_id, name, description)
      VALUES (
        NEW.user_id,
        'Well-Rounded',
        'Logged at least 4 different types of habits'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check for and award badges
CREATE TRIGGER check_badges_on_habit_log
AFTER INSERT ON habits
FOR EACH ROW
EXECUTE FUNCTION check_and_award_badges();