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
