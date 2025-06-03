/*
  # Authentication and User Management Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (text, either 'HR Admin' or 'Employee')
      - `company_id` (uuid, foreign key)
      - `points` (integer)
      - `theme_preference` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)

    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `logo_url` (text)
      - `working_days` (text array)
      - `tier` (text)
      - `api_key` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access
    - Add policies for company access
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  logo_url text,
  working_days text[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  tier text DEFAULT 'free',
  api_key text,
  created_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('HR Admin', 'Employee')),
  company_id uuid REFERENCES companies(id) NOT NULL,
  points integer DEFAULT 0,
  theme_preference text DEFAULT 'dark',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies for companies
CREATE POLICY "Users can view their own company"
  ON companies
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT company_id 
    FROM users 
    WHERE users.id = auth.uid()
  ));

CREATE POLICY "HR Admins can update their company"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (id IN (
    SELECT company_id 
    FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'HR Admin'
  ));

-- Policies for users
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view colleagues in their company"
  ON users
  FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id 
    FROM users 
    WHERE users.id = auth.uid()
  ));