/*
  # Add trial features to user profiles

  1. New Columns
    - `is_trial` (boolean) - Whether user is currently on trial
    - `trial_start_date` (timestamptz) - When trial started
    - `trial_end_date` (timestamptz) - When trial ends
    - `trial_type` (text) - Type of trial (teacher/student)
    - `upload_count_this_month` (integer) - Track monthly uploads

  2. Security
    - Update existing RLS policies
    - Add policies for trial management

  3. Functions
    - Add function to check trial status
    - Add function to reset monthly upload count
*/

-- Add trial-related columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_trial'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_trial BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_start_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_start_date TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_end_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_end_date TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_type TEXT CHECK (trial_type IN ('teacher', 'student'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'upload_count_this_month'
  ) THEN
    ALTER TABLE profiles ADD COLUMN upload_count_this_month INTEGER DEFAULT 0;
  END IF;
END $$;

-- Function to start a trial
CREATE OR REPLACE FUNCTION start_trial(
  user_id UUID,
  trial_type_param TEXT
)
RETURNS VOID AS $$
DECLARE
  trial_duration INTERVAL;
BEGIN
  -- Set trial duration based on type
  IF trial_type_param = 'teacher' THEN
    trial_duration := INTERVAL '30 days';
  ELSE
    trial_duration := INTERVAL '14 days';
  END IF;

  -- Update user profile with trial information
  UPDATE profiles
  SET 
    is_trial = TRUE,
    trial_start_date = NOW(),
    trial_end_date = NOW() + trial_duration,
    trial_type = trial_type_param,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if trial is expired
CREATE OR REPLACE FUNCTION is_trial_expired(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  trial_end TIMESTAMPTZ;
BEGIN
  SELECT trial_end_date INTO trial_end
  FROM profiles
  WHERE id = user_id AND is_trial = TRUE;

  IF trial_end IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN NOW() > trial_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end trial
CREATE OR REPLACE FUNCTION end_trial(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    is_trial = FALSE,
    trial_start_date = NULL,
    trial_end_date = NULL,
    trial_type = NULL,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly upload count (to be called monthly)
CREATE OR REPLACE FUNCTION reset_monthly_upload_counts()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    upload_count_this_month = 0,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment upload count
CREATE OR REPLACE FUNCTION increment_upload_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    upload_count_this_month = COALESCE(upload_count_this_month, 0) + 1,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_trial_status ON profiles(is_trial, trial_end_date);
CREATE INDEX IF NOT EXISTS idx_profiles_upload_count ON profiles(upload_count_this_month);

-- Update RLS policies to include trial users
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy for trial management (admin only)
CREATE POLICY "Admins can manage trials"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );