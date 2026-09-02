"use client";

import { useState, useEffect } from "react";
import { useUser } from "../../../lib/user-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Avatar } from "../../../components/ui/avatar";

export default function RequestsPage() {
  const { requests, acceptRequest, declineRequest, cancelRequest } = useUser();
  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('highlight');
      if (id) {
        setHighlightId(id);
        
        // Auto-dismiss highlight and clean URL after a few seconds
        const timer = setTimeout(() => {
          setHighlightId(null);
          window.history.replaceState(null, '', window.location.pathname);
        }, 3500);
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Exchange Requests</h1>
        <p className="text-foreground-secondary mt-1">Manage incoming and outgoing skill exchange requests.</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Incoming Requests</h2>
          {requests.incoming.length === 0 ? (
            <p className="text-foreground-muted">You have no pending requests.</p>
          ) : (
            requests.incoming.map(req => (
              <Card key={req.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <Avatar src={req.user.avatar} alt={req.user.name} size="md" />
                      <div>
                        <CardTitle as="h3" className="text-lg">Request from {req.user.name}</CardTitle>
                        <CardDescription>{req.date}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="warning">Action Needed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-surface rounded-lg border border-border">
                      <p className="text-xs text-foreground-secondary mb-1">They want to learn</p>
                      <p className="font-medium text-foreground">{req.wanting}</p>
                    </div>
                    <div className="p-4 bg-surface rounded-lg border border-border">
                      <p className="text-xs text-foreground-secondary mb-1">They are offering</p>
                      <p className="font-medium text-primary">{req.offering}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                  <Button variant="outline" onClick={() => declineRequest(req.id)}>Decline</Button>
                  <Button variant="primary" onClick={() => acceptRequest(req.id)}>Accept Exchange</Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Sent Requests</h2>
          {requests.sent.length === 0 ? (
            <p className="text-foreground-muted">You haven't sent any requests.</p>
          ) : (
            requests.sent.map(req => {
              const isHighlighted = req.id === highlightId;
              return (
                <Card 
                  key={req.id}
                  className={`transition-all duration-1000 ${isHighlighted ? "ring-2 ring-primary bg-primary/5 shadow-lg shadow-primary/20 scale-[1.02]" : ""}`}
                >
                  <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <Avatar src={req.user.avatar} alt={req.user.name} size="md" />
                      <div>
                        <CardTitle as="h3" className="text-lg">Sent to {req.user.name}</CardTitle>
                        <CardDescription>{req.date}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="info">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-surface rounded-lg border border-border">
                      <p className="text-xs text-foreground-secondary mb-1">You want to learn</p>
                      <p className="font-medium text-primary">{req.wanting}</p>
                    </div>
                    <div className="p-4 bg-surface rounded-lg border border-border">
                      <p className="text-xs text-foreground-secondary mb-1">You are offering</p>
                      <p className="font-medium text-foreground">{req.offering}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                  <Button variant="ghost" className="text-error" onClick={() => cancelRequest(req.id)}>Cancel Request</Button>
                </CardFooter>
              </Card>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
}
