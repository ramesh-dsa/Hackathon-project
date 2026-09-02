"use client";

import { useUser } from "../../../lib/user-context";
import { DashboardSummary } from "../../../components/dashboard/DashboardSummary";
import { DashboardSearch } from "../../../components/dashboard/DashboardSearch";

export default function DashboardPage() {
  const { exchanges, requests, allUsers, currentUser } = useUser();
  
  const activeExchanges = exchanges.filter((e) => e.status === "in-progress");
  
  // Exclude current user
  const availableUsers = allUsers.filter((u) => u.id !== currentUser?.id);

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Greeting */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {currentUser?.name || 'there'}</h1>
          <p className="text-foreground-secondary mt-1">Ready for your next skill exchange?</p>
        </div>
      </section>

      {/* Summary Row */}
      <DashboardSummary 
        activeExchanges={activeExchanges}
        incomingRequests={requests.incoming}
      />

      {/* Search and Matches */}
      <DashboardSearch users={availableUsers} />
    </div>
  );
}
