/*
  # Create habits related tables

  1. New Tables
    - `habit_types`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - `name` (text)
      - `points_per_minute` (integer)
      - `icon` (text, nullable)
      - `color` (text, nullable)
      - `created_at` (timestamptz)
    - `habits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `company_id` (uuid, foreign key)
      - `habit_type_id` (uuid, foreign key)
      - `duration` (integer)
      - `date` (timestamptz)
      - `points_earned` (integer)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Add policies for HR admins to manage habit types
*/

-- Create habit types table
CREATE TABLE IF NOT EXISTS habit_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) NOT NULL,
  name text NOT NULL,
  points_per_minute integer DEFAULT 1,
  icon text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  company_id uuid REFERENCES companies(id) NOT NULL,
  habit_type_id uuid REFERENCES habit_types(id) NOT NULL,
  duration integer NOT NULL,
  date timestamptz DEFAULT now(),
  points_earned integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE habit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Create policies for habit_types table
CREATE POLICY "Users can view habit types in their company"
  ON habit_types
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "HR Admins can create habit types"
  ON habit_types
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid() AND role = 'HR Admin'
  ));

CREATE POLICY "HR Admins can update habit types"
  ON habit_types
  FOR UPDATE
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid() AND role = 'HR Admin'
  ));

-- Create policies for habits table
CREATE POLICY "Users can view their own habits"
  ON habits
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view habits in their company for leaderboards"
  ON habits
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create their own habits"
  ON habits
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Insert default habit types for each company
CREATE OR REPLACE FUNCTION create_default_habit_types()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO habit_types (company_id, name, points_per_minute, icon, color)
  VALUES
    (NEW.id, 'Meditation', 2, 'brain', '#8B5CF6'),
    (NEW.id, 'Exercise', 1, 'dumbbell', '#EF4444'),
    (NEW.id, 'Learning', 1, 'book-open', '#3B82F6'),
    (NEW.id, 'Healthy Eating', 2, 'utensils', '#10B981');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_company_habit_types
AFTER INSERT ON companies
FOR EACH ROW
EXECUTE FUNCTION create_default_habit_types();