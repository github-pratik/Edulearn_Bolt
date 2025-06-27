/*
  # Update creator upload permissions

  1. Database Changes
    - Ensure all creators can upload videos
    - Update RLS policies for video uploads
    - Add creator-specific permissions
    - Update profile constraints

  2. Security
    - Enable RLS on all tables
    - Add policies for creators to upload videos
    - Ensure proper access control
*/

-- Update the role check constraint to ensure creators are treated as teachers
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_role_check' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
  END IF;

  -- Add updated constraint
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('student', 'teacher', 'admin'));
END $$;

-- Function to check if user can upload videos
CREATE OR REPLACE FUNCTION can_upload_videos(user_id UUID)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upload limits for a user
CREATE OR REPLACE FUNCTION get_upload_limits(user_id UUID)
RETURNS JSON AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update video upload policies
DROP POLICY IF EXISTS "Authenticated users can insert videos" ON videos;
CREATE POLICY "Authenticated users can insert videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = uploader_id AND 
    can_upload_videos(auth.uid())
  );

-- Policy for updating videos (only own videos)
DROP POLICY IF EXISTS "Users can update own videos" ON videos;
CREATE POLICY "Users can update own videos"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploader_id)
  WITH CHECK (auth.uid() = uploader_id);

-- Policy for deleting videos (only own videos)
DROP POLICY IF EXISTS "Users can delete own videos" ON videos;
CREATE POLICY "Users can delete own videos"
  ON videos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = uploader_id);

-- Function to check monthly upload limit
CREATE OR REPLACE FUNCTION check_upload_limit(user_id UUID)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check upload limits before inserting videos
CREATE OR REPLACE FUNCTION check_video_upload_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_upload_limit(NEW.uploader_id) THEN
    RAISE EXCEPTION 'Monthly upload limit exceeded';
  END IF;

  -- Increment upload count
  PERFORM increment_upload_count(NEW.uploader_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS video_upload_limit_check ON videos;
CREATE TRIGGER video_upload_limit_check
  BEFORE INSERT ON videos
  FOR EACH ROW
  EXECUTE FUNCTION check_video_upload_limit();

-- Function to promote user to creator
CREATE OR REPLACE FUNCTION promote_to_creator(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    subscription_status = 'creator',
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION can_upload_videos(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upload_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_upload_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION promote_to_creator(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION start_trial(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION end_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_trial_expired(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_upload_count(UUID) TO authenticated;