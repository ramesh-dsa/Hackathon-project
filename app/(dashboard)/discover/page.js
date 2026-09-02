"use client";

import { useState, useMemo } from "react";
import { useUser } from "../../../lib/user-context";
import { MatchCard } from "../../../components/dashboard/MatchCard";
import { EmptyState } from "../../../components/ui/states";

export default function DiscoverPage() {
  const { allUsers, currentUser } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Exclude current user
  const availableUsers = useMemo(() => allUsers.filter((u) => u.id !== currentUser?.id), [allUsers, currentUser?.id]);

  const bestMatches = useMemo(() => {
    if (!searchQuery.trim()) return availableUsers;

    // Split search query into individual words (tokens)
    const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    
    return availableUsers.filter((u) => {
      // Combine all searchable text for this user into one big string
      const searchableText = [
        u.name,
        u.bio,
        u.location,
        ...(u.offers || []),
        ...(u.needs || []),
        ...(u.languages || []),
      ].join(" ").toLowerCase();

      // Check if EVERY search term is found in the searchable text
      return searchTerms.every(term => searchableText.includes(term));
    });
  }, [searchQuery, availableUsers]);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Discover</h1>
          <p className="text-foreground-secondary mt-1">Find people to learn from and share your skills with.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted group-focus-within:text-primary transition-colors" 
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          
          <input 
            type="text" 
            placeholder="Search skills, topics, or people..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 bg-surface text-sm text-foreground placeholder:text-foreground-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
          />
          
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-foreground-muted hover:text-foreground bg-surface hover:bg-surface-hover rounded-full transition-colors"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
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
          description={`We couldn't find anyone matching "${searchQuery}". Try adjusting your search terms.`}
          className="py-12"
          action={
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-4 px-4 py-2 bg-surface border border-border rounded-md text-sm font-medium hover:bg-surface-hover transition-colors"
            >
              Clear search
            </button>
          }
        />
      )}
    </div>
  );
}
