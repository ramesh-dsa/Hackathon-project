"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../../../lib/user-context";
import { createClient } from "../../../lib/supabase/client";
import { Card, CardContent } from "../../../components/ui/card";
import { Avatar } from "../../../components/ui/avatar";

export default function MessagesPage() {
  const { currentUser } = useUser();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchConversations = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, 
          user1_id, 
          user2_id,
          user1:users!user1_id(id, name, avatar),
          user2:users!user2_id(id, name, avatar)
        `);

      if (!error && data) {
        // Map to get the partner info
        const mapped = data.map(conv => {
          const iAmUser1 = conv.user1_id === currentUser.id;
          const partner = iAmUser1 ? conv.user2 : conv.user1;
          return {
            id: conv.id,
            partner
          };
        });
        setConversations(mapped);
      } else if (error) {
        console.error("Error fetching conversations:", error);
      }
      setLoading(false);
    };

    fetchConversations();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-10 animate-pulse">
        <div className="h-10 w-48 bg-surface-elevated rounded"></div>
        <div className="h-24 bg-surface-elevated rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Messages</h1>
        <p className="text-foreground-secondary mt-1">Chat with your learning partners and new connections.</p>
      </div>

      <div className="space-y-4">
        {conversations.length === 0 ? (
          <p className="text-foreground-muted">You have no active conversations. Visit a user profile to start chatting.</p>
        ) : (
          conversations.map(conv => (
            <Link key={conv.id} href={`/messages/${conv.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer group bg-surface hover:bg-surface-hover">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar src={conv.partner?.avatar} alt={conv.partner?.name} size="md" />
                    <div>
                      <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {conv.partner?.name || 'Unknown User'}
                      </h2>
                      <p className="text-sm text-foreground-secondary">
                        Click to view conversation
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-8 w-8 rounded-full bg-surface-elevated group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors border border-border">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10 3c-4.31 0-8 3.033-8 7 0 2.024.978 3.825 2.533 5.012l-2.096 2.096c-.45.45-.13 1.218.507 1.218h4.634C8.75 18.665 9.362 18.75 10 18.75c4.31 0 8-3.033 8-7s-3.69-7-8-7Zm0 14.25c-.464 0-.918-.047-1.356-.134a.75.75 0 0 0-.61.168l-2.616 2.18v-2.31a.75.75 0 0 0-.317-.604C3.882 15.534 2.75 13.912 2.75 12c0-3.111 3.29-5.75 7.25-5.75s7.25 2.639 7.25 5.75-3.29 5.75-7.25 5.75Z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
