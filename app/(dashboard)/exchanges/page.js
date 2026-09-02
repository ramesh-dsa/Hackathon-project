"use client";
import Link from "next/link";

import { useUser } from "../../../lib/user-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Avatar } from "../../../components/ui/avatar";

export default function ExchangesPage() {
  const { exchanges, completeExchange } = useUser();

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Exchanges</h1>
        <p className="text-foreground-secondary mt-1">Track your ongoing learning and teaching sessions.</p>
      </div>

      <div className="space-y-6">
        {exchanges.length === 0 ? (
          <p className="text-foreground-muted">You have no active or completed exchanges.</p>
        ) : (
          exchanges.map(exc => (
            <Card key={exc.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <Avatar src={exc.partner.avatar} alt={exc.partner.name} size="md" />
                    <div>
                      <CardTitle as="h2" className="text-xl">Exchange with {exc.partner.name}</CardTitle>
                      <CardDescription>Updated {exc.lastUpdated}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={exc.status === "completed" ? "success" : "brand"}>
                    {exc.status === "completed" ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-surface rounded-xl border border-border">
                  <div className="text-center md:text-left flex-1">
                    <p className="text-sm text-foreground-secondary mb-1">You are teaching</p>
                    <p className="text-lg font-semibold text-primary">{exc.you.offering}</p>
                  </div>
                  <div className="my-4 md:my-0 flex items-center justify-center p-3 rounded-full bg-surface-elevated border border-border">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-foreground-secondary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                  </div>
                  <div className="text-center md:text-right flex-1">
                    <p className="text-sm text-foreground-secondary mb-1">You are learning</p>
                    <p className="text-lg font-semibold text-foreground">{exc.partner.offering}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-border p-4">
                <Button variant="outline" asChild>
                  <Link href={`/messages/${exc.id}`}>Message</Link>
                </Button>
                {exc.status === "in-progress" && (
                  <Button variant="primary" onClick={() => completeExchange(exc.id)}>Mark Completed</Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
