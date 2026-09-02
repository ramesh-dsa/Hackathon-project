"use client";

import { useState, useMemo } from "react";
import { MatchCard } from "./MatchCard";
import { EmptyState } from "../ui/states";
import Link from "next/link";

export function DashboardSearch({ users, currentUser }) {
  const [searchQuery, setSearchQuery] = useState("");

  const myOffers = (currentUser?.offers || []).map((s) => s.toLowerCase());
  const myNeeds = (currentUser?.needs || []).map((s) => s.toLowerCase());
  const hasSkills = myOffers.length > 0 || myNeeds.length > 0;

  const displayedUsers = useMemo(() => {
    let pool = users || [];

    if (searchQuery.trim()) {
      const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      pool = pool.filter((u) => {
        const text = [
          u.name,
          u.bio,
          u.location,
          ...(u.offers || []),
          ...(u.needs || []),
          ...(u.languages || []),
        ]
          .join(" ")
          .toLowerCase();
        return terms.every((t) => text.includes(t));
      });
      return pool;
    }

    // Default: show top 2 recommended (already sorted by match score in parent)
    return pool.slice(0, 2);
  }, [searchQuery, users]);

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {hasSearch ? "Search Results" : "Recommended matches"}
          </h2>
          {!hasSearch && hasSkills && (
            <p className="text-xs text-foreground-muted mt-0.5">
              Based on your skills and learning goals
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <input
              type="search"
              placeholder="Search skills or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface text-sm text-foreground placeholder:text-foreground-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-focus transition-colors"
              aria-label="Search skills or users"
            />
          </div>
          {!hasSearch && (
            <Link
              href="/discover"
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors whitespace-nowrap"
            >
              Browse more
            </Link>
          )}
        </div>
      </div>

      {displayedUsers.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {displayedUsers.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={hasSearch ? "No results found" : "No matches found"}
          description={
            hasSearch
              ? `No users match "${searchQuery}". Try different keywords.`
              : hasSkills
              ? "No users match your skills yet. Try browsing the Discover page!"
              : "Add skills on your profile to see personalized recommendations."
          }
          className="py-12"
        />
      )}
    </section>
  );
}
