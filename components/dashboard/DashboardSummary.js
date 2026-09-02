"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { useUser } from "../../lib/user-context";

export function DashboardSummary({ activeExchanges, incomingRequests }) {
  const { currentUser } = useUser();
  const offerings = currentUser.offers;
  return (
    <section className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="bg-surface-elevated flex flex-col justify-between hover:border-border-strong transition-colors duration-200 group">
        <CardHeader className="pb-2">
          <CardTitle as="h2" className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider flex items-center justify-between">
            Active Learning
            <Link href="/exchanges" className="text-primary hover:text-primary-hover lowercase opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100" aria-label="View all active exchanges">
              View all
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeExchanges.length > 0 ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-foreground">{activeExchanges[0].partner.offering}</p>
                <p className="text-sm text-foreground-secondary mt-1">Exchanging with {activeExchanges[0].partner.name}</p>
              </div>
              <Avatar src={activeExchanges[0].partner.avatar} alt={activeExchanges[0].partner.name} size="md" />
            </div>
          ) : (
            <p className="text-sm text-foreground-secondary">No active exchanges. Start exploring!</p>
          )}
          <div className="mt-4">
            <Button as={Link} href="/exchanges" variant="outline" size="small" className="w-full transition-colors">
              Go to Exchanges
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface-elevated flex flex-col justify-between hover:border-border-strong transition-colors duration-200 group">
        <CardHeader className="pb-2">
          <CardTitle as="h2" className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider flex items-center justify-between">
            Pending Requests
            <Link href="/requests" className="text-primary hover:text-primary-hover lowercase opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100" aria-label="View all pending requests">
              View all
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incomingRequests.length > 0 ? (
            <div>
              <p className="text-lg font-medium text-foreground">{incomingRequests.length} incoming</p>
              <p className="text-sm text-foreground-secondary mt-1">{incomingRequests[0].user.name} wants to learn {incomingRequests[0].wanting}</p>
            </div>
          ) : (
            <p className="text-sm text-foreground-secondary">You're all caught up.</p>
          )}
          <div className="mt-4">
            <Button as={Link} href="/requests" variant="outline" size="small" className="w-full transition-colors">
              Manage Requests
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface-elevated flex flex-col justify-between border-primary/20 hover:border-primary/40 transition-all duration-300 group shadow-sm hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle as="h2" className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center justify-between">
            Your Offerings
            <Link href="/my-skills" className="text-primary hover:text-primary-hover lowercase opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100" aria-label="Update your skills">
              Edit
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 justify-between">
          <div className="flex flex-wrap gap-2 mb-4">
            {offerings.length > 0 ? (
              offerings.map((skill) => (
                <span key={skill} className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-colors">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-foreground-secondary">You haven't added any offerings yet.</p>
            )}
          </div>
          <div>
            <Button as={Link} href="/my-skills" variant="outline" size="small" className="w-full border-primary/30 hover:border-primary/50 text-primary hover:bg-primary/5 transition-all duration-200">
              Update Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
