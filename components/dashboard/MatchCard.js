"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { useUser } from "../../lib/user-context";

export function MatchCard({ match }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const { currentUser, sendRequest, requests } = useUser();

  // Check if we already requested this user
  const sentRequest = requests?.sent?.find(r => r.user.id === match.id);
  const hasRequestedGlobally = !!sentRequest;
  const showAsRequested = isRequested || hasRequestedGlobally;

  const handleRequestExchange = () => {
    // Pick the first matching skill for simplicity, or just their top skill
    const offering = currentUser.offers[0] || "General Help";
    const wanting = match.offers[0] || "General Knowledge";
    
    sendRequest(match, offering, wanting);
    setIsRequested(true);
    
    // Close modal after a short delay
    setTimeout(() => {
      setIsModalOpen(false);
    }, 1500);
  };

  return (
    <>
      <Card className="h-full bg-surface-card hover:border-border-strong transition-all duration-200 group relative focus-within:ring-2 focus-within:ring-focus overflow-hidden flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="shrink-0">
              <Avatar src={match.avatar} alt={match.name} size="lg" />
            </div>
            <div className="flex-1 min-w-0 w-full flex flex-col h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-1 gap-2 sm:gap-0">
                <h3 className="text-base font-semibold text-foreground truncate">{match.name}</h3>
                <div className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full w-fit shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3" aria-hidden="true"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                  <span className="sr-only">Rating:</span> {match.rating}
                </div>
              </div>
              <p className="text-sm text-foreground-secondary line-clamp-2 mb-4">{match.bio}</p>
              
              <div className="mt-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-surface rounded-md p-3 border border-border">
                    <span className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Can teach</span>
                    <span className="font-medium text-primary line-clamp-1">{match.offers.join(", ")}</span>
                  </div>
                  <div className="bg-surface rounded-md p-3 border border-border">
                    <span className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-1">Wants to learn</span>
                    <span className="font-medium text-foreground line-clamp-1">{match.needs.join(", ")}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                  <Button 
                    onClick={() => {
                      if (showAsRequested) {
                        const reqId = sentRequest?.id || requests?.sent?.[0]?.id;
                        router.push(`/requests${reqId ? `?highlight=${reqId}` : ''}`);
                      } else {
                        setIsModalOpen(true);
                      }
                    }}
                    variant={showAsRequested ? "secondary" : "primary"} 
                    size="small"
                    className="group-hover:-translate-y-0.5 transition-transform duration-200 focus:outline-none"
                  >
                    {showAsRequested ? "View Request" : "View Profile"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-card rounded-xl p-6 w-full max-w-md border border-border shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              <span className="sr-only">Close</span>
            </button>
            
            <div className="flex flex-col items-center text-center mt-2">
              <Avatar src={match.avatar} alt={match.name} size="lg" className="w-24 h-24 mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-1">{match.name}</h2>
              <p className="text-sm text-foreground-muted mb-2">{match.location || "Remote"}</p>
              
              <div className="flex items-center gap-1 text-sm font-medium text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                {match.rating} ({match.reviewCount || match.reviews?.length || 0} reviews)
              </div>
              
              <p className="text-foreground-secondary mb-6">{match.bio}</p>
            </div>
            
            <div className="space-y-5 text-left w-full">
              <div>
                <h4 className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-3">Skills to Teach</h4>
                <div className="flex flex-wrap gap-2">
                  {match.offers.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-3">Skills to Learn</h4>
                <div className="flex flex-wrap gap-2">
                  {match.needs.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-surface text-foreground text-sm rounded-full border border-border font-medium">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3 w-full">
              <Button onClick={() => setIsModalOpen(false)} variant="secondary" className="flex-1">
                Close
              </Button>
              <Button 
                onClick={() => {
                  if (showAsRequested) {
                    const reqId = sentRequest?.id || requests?.sent?.[0]?.id;
                    router.push(`/requests${reqId ? `?highlight=${reqId}` : ''}`);
                  } else {
                    handleRequestExchange();
                  }
                }} 
                className="flex-1"
                variant={showAsRequested ? "secondary" : "primary"}
              >
                {showAsRequested ? "View Request" : "Request Exchange"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
