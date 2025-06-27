/*
  # Create videos table

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `subject` (text, not null)
      - `grade_level` (text, not null)
      - `uploader_id` (uuid, references profiles)
      - `video_url` (text, not null)
      - `thumbnail_url` (text)
      - `duration` (integer, duration in seconds)
      - `view_count` (integer, default 0)
      - `is_premium` (boolean, default false)
      - `premium_price` (decimal)
      - `algorand_txn_id` (text)
      - `reddit_discussion_url` (text)
      - `voice_summary_url` (text)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `videos` table
    - Add policy for public read access to videos
    - Add policy for uploaders to manage their own videos
*/

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  subject text NOT NULL,
  grade_level text NOT NULL,
  uploader_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer DEFAULT 0,
  view_count integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  premium_price decimal(10,2),
  algorand_txn_id text,
  reddit_discussion_url text,
  voice_summary_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

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