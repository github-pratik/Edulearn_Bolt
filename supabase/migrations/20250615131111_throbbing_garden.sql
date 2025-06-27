/*
  # Complete Database Schema Setup

  1. New Tables
    - `profiles` - User profile information
    - `videos` - Video content with metadata
    - `video_timestamps` - Chapter markers for videos
    - `comments` - User comments on videos
    - `classrooms` - Teacher-created classroom groups
    - `classroom_students` - Student enrollment in classrooms

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Ensure proper foreign key relationships

  3. Performance
    - Add indexes for common queries
    - Optimize for video browsing and filtering
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'student',
  subscription_status text DEFAULT 'free',
  reddit_username text,
  revenuecat_user_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key to auth.users if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add role check constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_role_check' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role = ANY (ARRAY['student'::text, 'teacher'::text, 'admin'::text]));
  END IF;
END $$;

-- Create videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  subject text NOT NULL,
  grade_level text NOT NULL,
  uploader_id uuid,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer DEFAULT 0,
  view_count integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  premium_price numeric(10,2),
  algorand_txn_id text,
  reddit_discussion_url text,
  voice_summary_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clean up any orphaned video records before adding foreign key
UPDATE videos 
SET uploader_id = NULL 
WHERE uploader_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = videos.uploader_id);

-- Add foreign key constraint for videos.uploader_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'videos_uploader_id_fkey' 
    AND table_name = 'videos'
  ) THEN
    ALTER TABLE videos 
    ADD CONSTRAINT videos_uploader_id_fkey 
    FOREIGN KEY (uploader_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create other required tables
CREATE TABLE IF NOT EXISTS video_timestamps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid,
  title text NOT NULL,
  time_seconds integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key for video_timestamps
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'video_timestamps_video_id_fkey' 
    AND table_name = 'video_timestamps'
  ) THEN
    ALTER TABLE video_timestamps 
    ADD CONSTRAINT video_timestamps_video_id_fkey 
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid,
  user_id uuid,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign keys for comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_video_id_fkey' 
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE comments 
    ADD CONSTRAINT comments_video_id_fkey 
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_user_id_fkey' 
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE comments 
    ADD CONSTRAINT comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  teacher_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint for classroom code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'classrooms_code_key' 
    AND table_name = 'classrooms'
  ) THEN
    ALTER TABLE classrooms 
    ADD CONSTRAINT classrooms_code_key UNIQUE (code);
  END IF;
END $$;

-- Add foreign key for classrooms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'classrooms_teacher_id_fkey' 
    AND table_name = 'classrooms'
  ) THEN
    ALTER TABLE classrooms 
    ADD CONSTRAINT classrooms_teacher_id_fkey 
    FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS classroom_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid,
  student_id uuid,
  joined_at timestamptz DEFAULT now()
);

-- Add unique constraint for classroom_students
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'classroom_students_classroom_id_student_id_key' 
    AND table_name = 'classroom_students'
  ) THEN
    ALTER TABLE classroom_students 
    ADD CONSTRAINT classroom_students_classroom_id_student_id_key UNIQUE (classroom_id, student_id);
  END IF;
END $$;

-- Add foreign keys for classroom_students
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'classroom_students_classroom_id_fkey' 
    AND table_name = 'classroom_students'
  ) THEN
    ALTER TABLE classroom_students 
    ADD CONSTRAINT classroom_students_classroom_id_fkey 
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'classroom_students_student_id_fkey' 
    AND table_name = 'classroom_students'
  ) THEN
    ALTER TABLE classroom_students 
    ADD CONSTRAINT classroom_students_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_timestamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_students ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Anyone can read videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can insert videos" ON videos;
DROP POLICY IF EXISTS "Users can update own videos" ON videos;
DROP POLICY IF EXISTS "Users can delete own videos" ON videos;

DROP POLICY IF EXISTS "Anyone can read video timestamps" ON video_timestamps;
DROP POLICY IF EXISTS "Video owners can manage timestamps" ON video_timestamps;

DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

DROP POLICY IF EXISTS "Anyone can read classrooms" ON classrooms;
DROP POLICY IF EXISTS "Teachers can manage own classrooms" ON classrooms;

DROP POLICY IF EXISTS "Students can read own classroom memberships" ON classroom_students;
DROP POLICY IF EXISTS "Students can join classrooms" ON classroom_students;
DROP POLICY IF EXISTS "Teachers can manage classroom students" ON classroom_students;

-- Create RLS policies for profiles
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
  USING (auth.uid() = id);

-- Create RLS policies for videos
CREATE POLICY "Anyone can read videos"
  ON videos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can update own videos"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploader_id);

CREATE POLICY "Users can delete own videos"
  ON videos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = uploader_id);

-- Create RLS policies for video_timestamps
CREATE POLICY "Anyone can read video timestamps"
  ON video_timestamps
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Video owners can manage timestamps"
  ON video_timestamps
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM videos 
    WHERE videos.id = video_timestamps.video_id 
    AND videos.uploader_id = auth.uid()
  ));

-- Create RLS policies for comments
CREATE POLICY "Anyone can read comments"
  ON comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for classrooms
CREATE POLICY "Anyone can read classrooms"
  ON classrooms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Teachers can manage own classrooms"
  ON classrooms
  FOR ALL
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Create RLS policies for classroom_students
CREATE POLICY "Students can read own classroom memberships"
  ON classroom_students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can join classrooms"
  ON classroom_students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can manage classroom students"
  ON classroom_students
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM classrooms 
    WHERE classrooms.id = classroom_students.classroom_id 
    AND classrooms.teacher_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_uploader_id ON videos(uploader_id);
CREATE INDEX IF NOT EXISTS idx_videos_subject ON videos(subject);
CREATE INDEX IF NOT EXISTS idx_videos_grade_level ON videos(grade_level);
CREATE INDEX IF NOT EXISTS idx_videos_is_premium ON videos(is_premium);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);