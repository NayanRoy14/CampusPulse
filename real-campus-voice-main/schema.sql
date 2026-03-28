-- SQL Schema for CampusPulse (Supabase compatible)

-- 1. Create Tables
-- Profiles table (independent of Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_display TEXT UNIQUE NOT NULL, -- The username/ID they chose
  password TEXT, -- Simple password for basic protection
  full_name TEXT,
  avatar_url TEXT,
  is_banned BOOLEAN DEFAULT false, -- New: Support for banning users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_alias TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  sentiment_score FLOAT DEFAULT 0,
  votes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Open',
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID NOT NULL,
  type TEXT CHECK (type IN ('post', 'comment')) NOT NULL,
  reason TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_alias TEXT,
  content TEXT NOT NULL,
  parent_id UUID,
  votes INTEGER DEFAULT 0,
  reactions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Reactions tracking table (to prevent multiple reactions)
CREATE TABLE IF NOT EXISTS user_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reactions ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (Checks if they already exist to avoid errors)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow all access to profiles') THEN
        CREATE POLICY "Allow all access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow all access to posts') THEN
        CREATE POLICY "Allow all access to posts" ON posts FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow all access to reports') THEN
        CREATE POLICY "Allow all access to reports" ON reports FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow all access to comments') THEN
        CREATE POLICY "Allow all access to comments" ON comments FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow all access to user_reactions') THEN
        CREATE POLICY "Allow all access to user_reactions" ON user_reactions FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- 4. Create Automation Triggers
-- Function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id_display, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'user_id_display', new.raw_user_meta_data->>'full_name', 'user_' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'user_id_display'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a new user is created in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment comment count on posts
CREATE OR REPLACE FUNCTION public.increment_comments_count()
RETURNS trigger AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = comments_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a new comment is created
CREATE OR REPLACE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.increment_comments_count();

-- Function to decrement comment count on posts
CREATE OR REPLACE FUNCTION public.decrement_comments_count()
RETURNS trigger AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = GREATEST(0, comments_count - 1)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a comment is deleted
CREATE OR REPLACE TRIGGER on_comment_deleted
  AFTER DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.decrement_comments_count();

-- Maintenance: SQL to recalculate all comment counts to fix existing errors
-- You can run this once in Supabase SQL Editor if your counts are currently wrong:
-- UPDATE posts p
-- SET comments_count = (
--   SELECT count(*)
--   FROM comments c
--   WHERE c.post_id = p.id
-- );

