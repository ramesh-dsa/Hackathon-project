"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";
import { useUser } from "../../../../lib/user-context";
import { Avatar } from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";

export default function ChatRoom() {
  const params = useParams();
  const router = useRouter();
  const exchangeId = params.id;
  
  const { currentUser, exchanges } = useUser();
  const [messages, setMessages] = useState([]);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const supabase = createClient();
  
  // Verify authorization contextually. 
  // RLS is the true security boundary, but this prevents unnecessary queries.
  const exchange = exchanges.find(e => e.id === exchangeId);
  const isAuthorized = !!exchange && (exchange.status === 'in-progress' || exchange.status === 'completed');

  useEffect(() => {
    // Wait until exchanges are loaded. If not loaded, we can't verify yet.
    if (!currentUser || exchanges.length === 0) return;

    if (!isAuthorized) {
      setError("Unauthorized or Conversation Not Found");
      setLoading(false);
      return;
    }

    let isMounted = true;
    let channel;

    const initializeChat = async () => {
      // 1. Establish Realtime Subscription
      channel = supabase.channel(`messages:${exchangeId}`);
      
      channel.on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `exchange_id=eq.${exchangeId}` 
      }, (payload) => {
        if (!isMounted) return;
        const newMsg = payload.new;
        
        // 5. Deduplicate and reconcile new message
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        });
      });

      // 2. Wait until realtime subscription is confirmed active
      await new Promise((resolve, reject) => {
        channel.subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            resolve();
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            reject(err);
          }
        });
      });

      if (!isMounted) return;

      // 3. Fetch latest messages (History)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('exchange_id', exchangeId)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) {
        console.error("Failed to fetch messages:", error);
        setError("Failed to load history.");
      } else if (data) {
        // Reverse to get chronological order
        const chronologicalData = data.reverse();
        
        // 4. Deduplicate/Reconcile by canonical database message.id
        setMessages(prev => {
          const combined = [...chronologicalData, ...prev];
          const unique = combined.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
          return unique.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        });
      }
      
      setLoading(false);
    };

    initializeChat();

    // 6. Cleanup subscription on unmount
    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUser, isAuthorized, exchangeId, exchanges.length]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingMessages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const content = inputText.trim();
    setInputText("");
    
    // Create optimistic local temporary ID for pending queue
    const tempId = 'temp-' + Date.now();
    const optimisticMsg = {
      id: tempId,
      sender_id: currentUser.id,
      exchange_id: exchangeId,
      content,
      created_at: new Date().toISOString(),
      is_read: false
    };

    setPendingMessages(prev => [...prev, optimisticMsg]);

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        exchange_id: exchangeId,
        sender_id: currentUser.id,
        content
      }])
      .select()
      .single();

    if (error) {
      console.error("Failed to send message:", error);
      // Remove failed message from pending
      setPendingMessages(prev => prev.filter(m => m.id !== tempId));
    } else {
      // Remove from pending
      setPendingMessages(prev => prev.filter(m => m.id !== tempId));
      
      // Add server-confirmed message manually in case Realtime event is delayed
      setMessages(prev => {
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-destructive">Error</h2>
        <p className="text-foreground-secondary">{error}</p>
        <Button onClick={() => router.push('/messages')}>Back to Messages</Button>
      </div>
    );
  }

  const allDisplayMessages = [...messages, ...pendingMessages];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] border border-border rounded-xl bg-surface overflow-hidden">
      {/* Chat Header */}
      <div className="border-b border-border bg-surface-hover p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="p-2 md:hidden" onClick={() => router.push('/messages')}>
            &larr; Back
          </Button>
          <Avatar src={exchange.partner.avatar} alt={exchange.partner.name} size="sm" />
          <div>
            <h2 className="font-semibold text-foreground">{exchange.partner.name}</h2>
            <p className="text-xs text-foreground-secondary">{exchange.partner.offering}</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {allDisplayMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-foreground-muted">No messages yet. Say hello!</p>
          </div>
        ) : (
          allDisplayMessages.map(msg => {
            const isMe = msg.sender_id === currentUser.id;
            const isPending = String(msg.id).startsWith('temp-');
            
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe 
                      ? 'bg-primary text-primary-foreground rounded-br-none' 
                      : 'bg-surface-elevated text-foreground border border-border rounded-bl-none'
                  } ${isPending ? 'opacity-70' : ''}`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                  <span className={`text-[10px] mt-1 block ${isMe ? 'text-primary-foreground/70 text-right' : 'text-foreground-muted'}`}>
                    {isPending ? 'Sending...' : new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface border-t border-border">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-surface-elevated border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
            autoComplete="off"
          />
          <Button 
            type="submit" 
            variant="primary" 
            className="rounded-full px-6"
            disabled={!inputText.trim()}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
