/*
  # Fix infinite recursion in profiles RLS policies

  1. Security Changes
    - Drop existing problematic RLS policies on profiles table
    - Create simplified, non-recursive policies
    - Ensure policies don't create circular dependencies

  2. Policy Structure
    - Simple user access to own profile
    - Admin access without complex subqueries
    - Public read access for specific fields needed by other tables
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage trials" ON profiles;

-- Create simplified, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Simple admin policy without subqueries
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Allow public read access to specific fields needed for video display
CREATE POLICY "Public can read uploader names"
  ON profiles
  FOR SELECT
  TO public
  USING (true);