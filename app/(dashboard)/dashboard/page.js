import Link from "next/link";
import { users, exchanges, requests } from "../../../lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Avatar } from "../../../components/ui/avatar";

export default function DashboardPage() {
  const activeExchanges = exchanges.filter(e => e.status === "in-progress");
  const bestMatches = users.filter(u => u.id !== "u1").slice(0, 2);

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Greeting and Quick Search */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, Ramesh</h1>
          <p className="text-foreground-secondary mt-1">Ready for your next skill exchange?</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <input 
              type="text" 
              placeholder="Search skills..." 
              className="w-full pl-9 pr-4 py-2 bg-surface text-sm text-foreground placeholder:text-foreground-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-focus transition-colors"
            />
          </div>
          <Button as={Link} href="/discover" variant="primary">
            Browse
          </Button>
        </div>
      </section>

      {/* Summary Row */}
      <section className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="bg-surface-elevated flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle as="h2" className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Active Learning</CardTitle>
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
              <Button as={Link} href="/exchanges" variant="outline" size="small" className="w-full">View Exchanges</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-elevated flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle as="h2" className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.incoming.length > 0 ? (
              <div>
                <p className="text-lg font-medium text-foreground">{requests.incoming.length} incoming</p>
                <p className="text-sm text-foreground-secondary mt-1">{requests.incoming[0].user.name} wants to learn {requests.incoming[0].wanting}</p>
              </div>
            ) : (
              <p className="text-sm text-foreground-secondary">You're all caught up.</p>
            )}
            <div className="mt-4">
              <Button as={Link} href="/requests" variant="outline" size="small" className="w-full">Manage Requests</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-elevated flex flex-col justify-between border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle as="h2" className="text-xs font-semibold text-primary uppercase tracking-wider">Your Offerings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-surface text-foreground rounded-md border border-border">Java</span>
              <span className="px-2 py-1 text-xs font-medium bg-surface text-foreground rounded-md border border-border">DSA</span>
              <span className="px-2 py-1 text-xs font-medium bg-surface text-foreground rounded-md border border-border">HTML/CSS</span>
            </div>
            <div className="mt-4">
              <Button as={Link} href="/my-skills" variant="outline" size="small" className="w-full border-primary/30 hover:border-primary/50 text-primary hover:bg-primary/5 hover:text-primary">Update Profile</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Best Matches */}
      <section className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Recommended matches</h2>
          <Link href="/discover" className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm">View all matches</Link>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {bestMatches.map((match) => (
            <Card key={match.id} className="bg-surface-card hover:border-border-strong transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Avatar src={match.avatar} alt={match.name} size="lg" />
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-1 gap-2 sm:gap-0">
                      <h3 className="text-base font-semibold text-foreground truncate">{match.name}</h3>
                      <div className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                        {match.rating}
                      </div>
                    </div>
                    <p className="text-sm text-foreground-secondary line-clamp-2 mb-4">{match.bio}</p>
                    
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
                      <Button as={Link} href={`/profile/${match.id}`} variant="primary" size="small">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
