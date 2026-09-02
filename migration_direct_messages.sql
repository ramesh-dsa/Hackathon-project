-- ===========================================
-- SKILL EXCHANGE: DIRECT MESSAGING REFACTOR
-- ===========================================
-- Run this in Supabase SQL Editor.
-- This replaces the exchange-bound messaging with a direct user-to-user conversation model.

-- 1. Drop the old messages table safely (it was just created for the hackathon and contains test data).
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- 2. Create Conversations Table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraint: user1_id must always be less than user2_id to ensure deterministic ordering.
    -- This prevents duplicates like (A, B) and (B, A).
    CONSTRAINT conversations_user_order CHECK (user1_id < user2_id),
    
    -- Constraint: Ensure only ONE conversation exists between any two users.
    UNIQUE (user1_id, user2_id)
);

-- 3. Create Messages Table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Indexes for efficient fetching
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON public.conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON public.conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

-- 5. Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS: Conversations
CREATE POLICY "Participants can view conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Participants can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 7. RLS: Messages
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
  )
);

CREATE POLICY "Participants can insert messages" ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
  )
);

CREATE POLICY "Participants can update read status" ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (auth.uid() = c.user1_id OR auth.uid() = c.user2_id)
  )
);

-- 8. Trigger: Prevent modification of message content, sender, or conversation.
CREATE OR REPLACE FUNCTION public.prevent_message_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id <> OLD.id OR 
       NEW.conversation_id <> OLD.conversation_id OR 
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

-- 9. Grant permissions
GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;

-- 10. Enable Realtime for the messages table
-- We don't need realtime on conversations table immediately, but messages must have it.
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
