"use client";

import Link from "next/link";
import { useUser } from "../../../lib/user-context";
import { Card, CardContent } from "../../../components/ui/card";
import { Avatar } from "../../../components/ui/avatar";

export default function MessagesPage() {
  const { exchanges } = useUser();

  // Only show accepted exchanges (in-progress or completed) as conversations
  const conversations = exchanges.filter(exc => 
    exc.status === "in-progress" || exc.status === "completed"
  );

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Messages</h1>
        <p className="text-foreground-secondary mt-1">Chat with your learning partners.</p>
      </div>

      <div className="space-y-4">
        {conversations.length === 0 ? (
          <p className="text-foreground-muted">You have no active conversations. Accept a request to start chatting.</p>
        ) : (
          conversations.map(exc => (
            <Link key={exc.id} href={`/messages/${exc.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer group bg-surface hover:bg-surface-hover">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar src={exc.partner.avatar} alt={exc.partner.name} size="md" />
                    <div>
                      <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {exc.partner.name}
                      </h2>
                      <p className="text-sm text-foreground-secondary">
                        Exchange: {exc.partner.offering} ↔ {exc.you.offering}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-foreground-muted block mb-1">
                      {exc.status === "in-progress" ? "Active" : "Completed"}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-surface-elevated group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors border border-border">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
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
