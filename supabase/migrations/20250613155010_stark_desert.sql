/*
  # Create supporting tables

  1. New Tables
    - `video_timestamps`
      - `id` (uuid, primary key)
      - `video_id` (uuid, references videos)
      - `title` (text, not null)
      - `time_seconds` (integer, not null)
      - `created_at` (timestamptz, default now)
    
    - `comments`
      - `id` (uuid, primary key)
      - `video_id` (uuid, references videos)
      - `user_id` (uuid, references profiles)
      - `content` (text, not null)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
    
    - `classrooms`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `code` (text, unique, not null)
      - `teacher_id` (uuid, references profiles)
      - `created_at` (timestamptz, default now)
    
    - `classroom_students`
      - `id` (uuid, primary key)
      - `classroom_id` (uuid, references classrooms)
      - `student_id` (uuid, references profiles)
      - `joined_at` (timestamptz, default now)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Video Timestamps Table
CREATE TABLE IF NOT EXISTS video_timestamps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  title text NOT NULL,
  time_seconds integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE video_timestamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read video timestamps"
  ON video_timestamps
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Video owners can manage timestamps"
  ON video_timestamps
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_timestamps.video_id 
      AND videos.uploader_id = auth.uid()
    )
  );

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

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

-- Classrooms Table
CREATE TABLE IF NOT EXISTS classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;

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

-- Classroom Students Table
CREATE TABLE IF NOT EXISTS classroom_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(classroom_id, student_id)
);

ALTER TABLE classroom_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own classroom memberships"
  ON classroom_students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can manage classroom students"
  ON classroom_students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classrooms 
      WHERE classrooms.id = classroom_students.classroom_id 
      AND classrooms.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can join classrooms"
  ON classroom_students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);