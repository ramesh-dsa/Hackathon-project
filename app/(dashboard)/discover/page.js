"use client";

import { useState, useMemo } from "react";
import { users } from "../../../lib/mock-data";
import { MatchCard } from "../../../components/dashboard/MatchCard";
import { EmptyState } from "../../../components/ui/states";

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Exclude current user
  const availableUsers = users.filter((u) => u.id !== "u1");

  const bestMatches = useMemo(() => {
    if (!searchQuery.trim()) return availableUsers;

    const query = searchQuery.toLowerCase();
    return availableUsers.filter(
      (u) =>
        u.offers.some((skill) => skill.toLowerCase().includes(query)) ||
        u.needs.some((skill) => skill.toLowerCase().includes(query)) ||
        u.name.toLowerCase().includes(query)
    );
  }, [searchQuery, availableUsers]);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Discover</h1>
          <p className="text-foreground-secondary mt-1">Find people to learn from and share your skills with.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          <input 
            type="search" 
            placeholder="Search skills, topics, or people..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface text-sm text-foreground placeholder:text-foreground-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-focus transition-colors"
          />
        </div>
      </div>

      {bestMatches.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {bestMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <EmptyState 
          title="No matches found"
          description="Try adjusting your search terms to find more people."
          className="py-12"
        />
      )}
    </div>
  );
}
