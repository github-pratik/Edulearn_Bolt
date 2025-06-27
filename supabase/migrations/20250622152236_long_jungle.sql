/*
  # Fix Database Function Security Issues

  1. Security Fixes
    - Set search_path for all database functions to prevent security vulnerabilities
    - Update function definitions to be more secure
    - Add proper security definer settings

  2. Function Updates
    - All functions now have explicit search_path settings
    - Improved security posture for database functions
    - Maintains existing functionality while fixing security warnings
*/

-- Function to start a trial with secure search_path
CREATE OR REPLACE FUNCTION start_trial(
  user_id UUID,
  trial_type_param TEXT
)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Function to check if trial is expired with secure search_path
CREATE OR REPLACE FUNCTION is_trial_expired(user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Function to end trial with secure search_path
CREATE OR REPLACE FUNCTION end_trial(user_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Function to reset monthly upload counts with secure search_path
CREATE OR REPLACE FUNCTION reset_monthly_upload_counts()
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET 
    upload_count_this_month = 0,
    updated_at = NOW();
END;
$$;

-- Function to increment upload count with secure search_path
CREATE OR REPLACE FUNCTION increment_upload_count(user_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET 
    upload_count_this_month = COALESCE(upload_count_this_month, 0) + 1,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Function to check if user can upload videos with secure search_path
CREATE OR REPLACE FUNCTION can_upload_videos(user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  user_subscription TEXT;
  user_trial BOOLEAN;
BEGIN
  SELECT role, subscription_status, COALESCE(is_trial, FALSE)
  INTO user_role, user_subscription, user_trial
  FROM profiles
  WHERE id = user_id;

  -- Teachers can always upload
  IF user_role = 'teacher' THEN
    RETURN TRUE;
  END IF;

  -- Creator subscription holders can upload
  IF user_subscription = 'creator' THEN
    RETURN TRUE;
  END IF;

  -- Trial users can upload
  IF user_trial = TRUE THEN
    RETURN TRUE;
  END IF;

  -- Premium students can upload (limited)
  IF user_subscription = 'premium' THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Function to get upload limits for a user with secure search_path
CREATE OR REPLACE FUNCTION get_upload_limits(user_id UUID)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  user_subscription TEXT;
  user_trial BOOLEAN;
  result JSON;
BEGIN
  SELECT role, subscription_status, COALESCE(is_trial, FALSE)
  INTO user_role, user_subscription, user_trial
  FROM profiles
  WHERE id = user_id;

  -- Creator or teacher: unlimited uploads
  IF user_role = 'teacher' OR user_subscription = 'creator' OR user_trial = TRUE THEN
    result := json_build_object(
      'monthly_limit', NULL,
      'max_file_size_mb', 500,
      'allowed_formats', ARRAY['mp4', 'avi', 'mov', 'mkv', 'webm'],
      'can_monetize', TRUE
    );
  -- Premium students: limited uploads
  ELSIF user_subscription = 'premium' THEN
    result := json_build_object(
      'monthly_limit', 10,
      'max_file_size_mb', 200,
      'allowed_formats', ARRAY['mp4', 'avi', 'mov'],
      'can_monetize', FALSE
    );
  -- Free users: very limited
  ELSE
    result := json_build_object(
      'monthly_limit', 5,
      'max_file_size_mb', 100,
      'allowed_formats', ARRAY['mp4', 'avi', 'mov'],
      'can_monetize', FALSE
    );
  END IF;

  RETURN result;
END;
$$;

-- Function to check monthly upload limit with secure search_path
CREATE OR REPLACE FUNCTION check_upload_limit(user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  limits JSON;
  monthly_limit INTEGER;
  current_uploads INTEGER;
BEGIN
  -- Get user's upload limits
  limits := get_upload_limits(user_id);
  monthly_limit := (limits->>'monthly_limit')::INTEGER;

  -- If no limit (NULL), always allow
  IF monthly_limit IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Get current month's upload count
  SELECT COALESCE(upload_count_this_month, 0)
  INTO current_uploads
  FROM profiles
  WHERE id = user_id;

  RETURN current_uploads < monthly_limit;
END;
$$;

-- Function to promote user to creator with secure search_path
CREATE OR REPLACE FUNCTION promote_to_creator(user_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET 
    subscription_status = 'creator',
    updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Trigger function to check upload limits with secure search_path
CREATE OR REPLACE FUNCTION check_video_upload_limit()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT check_upload_limit(NEW.uploader_id) THEN
    RAISE EXCEPTION 'Monthly upload limit exceeded';
  END IF;

  -- Increment upload count
  PERFORM increment_upload_count(NEW.uploader_id);
  
  RETURN NEW;
END;
$$;

-- Grant necessary permissions to authenticated users
GRANT EXECUTE ON FUNCTION can_upload_videos(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upload_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_upload_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION promote_to_creator(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION start_trial(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION end_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_trial_expired(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_upload_count(UUID) TO authenticated;

-- Grant permission to service role for maintenance functions
GRANT EXECUTE ON FUNCTION reset_monthly_upload_counts() TO service_role;

-- Add comment to document the security fix
COMMENT ON FUNCTION start_trial(UUID, TEXT) IS 'Secure function to start user trial with fixed search_path';
COMMENT ON FUNCTION is_trial_expired(UUID) IS 'Secure function to check trial expiration with fixed search_path';
COMMENT ON FUNCTION end_trial(UUID) IS 'Secure function to end user trial with fixed search_path';
COMMENT ON FUNCTION reset_monthly_upload_counts() IS 'Secure function to reset monthly upload counts with fixed search_path';
COMMENT ON FUNCTION increment_upload_count(UUID) IS 'Secure function to increment upload count with fixed search_path';
COMMENT ON FUNCTION can_upload_videos(UUID) IS 'Secure function to check upload permissions with fixed search_path';
COMMENT ON FUNCTION get_upload_limits(UUID) IS 'Secure function to get upload limits with fixed search_path';
COMMENT ON FUNCTION check_upload_limit(UUID) IS 'Secure function to check upload limit with fixed search_path';
COMMENT ON FUNCTION promote_to_creator(UUID) IS 'Secure function to promote user to creator with fixed search_path';
COMMENT ON FUNCTION check_video_upload_limit() IS 'Secure trigger function to check upload limits with fixed search_path';