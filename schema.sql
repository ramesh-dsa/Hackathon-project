-- ===========================================
-- SKILL EXCHANGE: AUTH-READY SCHEMA
-- ===========================================
-- Run this in Supabase SQL Editor.
-- This replaces the old TEXT-id schema with UUID-based auth.

-- 1. Drop old tables
DROP TABLE IF EXISTS public.requests CASCADE;
DROP TABLE IF EXISTS public.exchanges CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.user_languages CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Create Users Table (linked to auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar TEXT,
    location TEXT,
    bio TEXT,
    rating NUMERIC(3,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    cover_image TEXT,
    availability TEXT,
    joined_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create User Languages Table
CREATE TABLE public.user_languages (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    language TEXT NOT NULL
);

-- 4. Create User Skills Table (Offers and Needs)
CREATE TABLE public.skills (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('offer', 'need')),
    skill_name TEXT NOT NULL
);

-- 5. Create Reviews Table
CREATE TABLE public.reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    date_display TEXT
);

-- 6. Create Exchanges Table
CREATE TABLE public.exchanges (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    status TEXT CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user1_offering TEXT,
    user2_offering TEXT,
    last_updated TEXT
);

-- 7. Create Requests Table
CREATE TABLE public.requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    offering TEXT NOT NULL,
    wanting TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
    date_display TEXT
);


-- ===========================================
-- AUTO-CREATE PROFILE ON SIGNUP (TRIGGER)
-- ===========================================

-- Drop old trigger/function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Function: create a public.users row when a new auth.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, name, location, avatar, joined_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'New User'),
    COALESCE(NEW.raw_user_meta_data ->> 'location', ''),
    'https://i.pravatar.cc/150?u=' || NEW.id::text,
    to_char(now(), 'FMMonth YYYY')
  );
  RETURN NEW;
END;
$$;

-- Trigger: fire after insert on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

-- ---- USERS ----
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (public discover)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profile insert is handled by the trigger (SECURITY DEFINER), no direct insert needed.
-- But we add a policy so the user can insert their own row if needed.
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ---- SKILLS ----
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills are viewable by everyone"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own skills"
  ON public.skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON public.skills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills"
  ON public.skills FOR DELETE
  USING (auth.uid() = user_id);


-- ---- USER_LANGUAGES ----
ALTER TABLE public.user_languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Languages are viewable by everyone"
  ON public.user_languages FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own languages"
  ON public.user_languages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own languages"
  ON public.user_languages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own languages"
  ON public.user_languages FOR DELETE
  USING (auth.uid() = user_id);


-- ---- REVIEWS ----
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = author_id);


-- ---- EXCHANGES ----
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view exchanges"
  ON public.exchanges FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Authenticated users can insert exchanges"
  ON public.exchanges FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Participants can update exchanges"
  ON public.exchanges FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);


-- ---- REQUESTS ----
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sender and receiver can view requests"
  ON public.requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can insert requests"
  ON public.requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Sender and receiver can update requests"
  ON public.requests FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Sender can delete requests"
  ON public.requests FOR DELETE
  USING (auth.uid() = sender_id);


-- ===========================================
-- GRANT PROPER PERMISSIONS
-- ===========================================
-- Revoke the old blanket grants first
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

-- Grant SELECT on public-facing tables to anon (for landing page / discover)
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.skills TO anon;
GRANT SELECT ON public.user_languages TO anon;
GRANT SELECT ON public.reviews TO anon;

-- Grant full CRUD to authenticated role (RLS will enforce ownership)
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.skills TO authenticated;
GRANT ALL ON public.user_languages TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.exchanges TO authenticated;
GRANT ALL ON public.requests TO authenticated;

-- Grant sequence usage to authenticated (for SERIAL columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
\n-- ===========================================\n-- ENABLE REALTIME FOR USERS\n-- ===========================================\n-- To make new users show up instantly without refreshing:\nALTER PUBLICATION supabase_realtime ADD TABLE public.users;\n
-- ===========================================
-- SKILL EXCHANGE: MESSAGING MIGRATION
-- ===========================================
-- Run this in Supabase SQL Editor to add the messaging feature.

-- 1. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exchange_id TEXT REFERENCES public.exchanges(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Index for efficient fetching by exchange
CREATE INDEX IF NOT EXISTS idx_messages_exchange_id ON public.messages(exchange_id);

-- 3. Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. SELECT Policy: Only participants can view messages if exchange is active/completed
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.exchanges e
    WHERE e.id = messages.exchange_id
    AND e.status IN ('in-progress', 'completed')
    AND (auth.uid() = e.user1_id OR auth.uid() = e.user2_id)
  )
);

-- 5. INSERT Policy: Enforce sender ownership and active exchange participation
CREATE POLICY "Participants can insert messages" ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.exchanges e
    WHERE e.id = messages.exchange_id
    AND e.status IN ('in-progress', 'completed')
    AND (auth.uid() = e.user1_id OR auth.uid() = e.user2_id)
  )
);

-- 6. UPDATE Policy: Participants can only update the 'is_read' state of messages in their exchange
CREATE POLICY "Participants can update read status" ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.exchanges e
    WHERE e.id = messages.exchange_id
    AND (auth.uid() = e.user1_id OR auth.uid() = e.user2_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.exchanges e
    WHERE e.id = messages.exchange_id
    AND (auth.uid() = e.user1_id OR auth.uid() = e.user2_id)
  )
);

-- Protect essential columns from being updated using a trigger
CREATE OR REPLACE FUNCTION public.prevent_message_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id <> OLD.id OR 
       NEW.exchange_id <> OLD.exchange_id OR 
       NEW.sender_id <> OLD.sender_id OR 
       NEW.content <> OLD.content OR 
       NEW.created_at <> OLD.created_at THEN
        RAISE EXCEPTION 'Only is_read can be updated on messages.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_message_mod_trigger ON public.messages;
CREATE TRIGGER prevent_message_mod_trigger
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.prevent_message_modification();


-- 7. Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;

-- 8. Enable Realtime for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
