/*
  # Create badges and rewards tables

  1. New Tables
    - `badges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `image_url` (text, nullable)
      - `date_earned` (timestamptz)
      - `created_at` (timestamptz)
    - `rewards`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `point_cost` (integer)
      - `stock` (integer)
      - `image_url` (text, nullable)
      - `created_at` (timestamptz)
    - `reward_redemptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `reward_id` (uuid, foreign key)
      - `date` (timestamptz)
      - `status` (text)
      - `points_spent` (integer)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for data access
*/

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  image_url text,
  date_earned timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  point_cost integer NOT NULL,
  stock integer DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create reward redemptions table
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  reward_id uuid REFERENCES rewards(id) NOT NULL,
  date timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  points_spent integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Create policies for badges table
CREATE POLICY "Users can view their own badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view colleagues' badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM users WHERE company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  ));

-- Create policies for rewards table
CREATE POLICY "Users can view rewards in their company"
  ON rewards
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "HR Admins can manage rewards"
  ON rewards
  FOR ALL
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid() AND role = 'HR Admin'
  ));

-- Create policies for reward_redemptions table
CREATE POLICY "Users can view their own redemptions"
  ON reward_redemptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create redemptions"
  ON reward_redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "HR Admins can view all redemptions in their company"
  ON reward_redemptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'HR Admin'
      AND users.company_id IN (
        SELECT company_id FROM rewards
        WHERE rewards.id = reward_redemptions.reward_id
      )
    )
  );

CREATE POLICY "HR Admins can update redemption status"
  ON reward_redemptions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'HR Admin'
      AND users.company_id IN (
        SELECT company_id FROM rewards
        WHERE rewards.id = reward_redemptions.reward_id
      )
    )
  );

-- Create function to redeem rewards
CREATE OR REPLACE FUNCTION redeem_reward(
  p_user_id uuid,
  p_reward_id uuid,
  p_points_cost integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_points integer;
  v_reward_stock integer;
BEGIN
  -- Get user's current points
  SELECT points INTO v_user_points
  FROM users
  WHERE id = p_user_id;
  
  -- Get reward's current stock
  SELECT stock INTO v_reward_stock
  FROM rewards
  WHERE id = p_reward_id;
  
  -- Check if user has enough points and reward is in stock
  IF v_user_points >= p_points_cost AND v_reward_stock > 0 THEN
    -- Begin transaction
    -- Deduct points from user
    UPDATE users
    SET points = points - p_points_cost
    WHERE id = p_user_id;
    
    -- Reduce reward stock
    UPDATE rewards
    SET stock = stock - 1
    WHERE id = p_reward_id;
    
    -- Create redemption record
    INSERT INTO reward_redemptions (
      user_id,
      reward_id,
      points_spent
    ) VALUES (
      p_user_id,
      p_reward_id,
      p_points_cost
    );
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;