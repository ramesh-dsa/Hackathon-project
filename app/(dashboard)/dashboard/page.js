"use client";

import { useUser } from "../../../lib/user-context";
import { DashboardSummary } from "../../../components/dashboard/DashboardSummary";
import { DashboardSearch } from "../../../components/dashboard/DashboardSearch";

export default function DashboardPage() {
  const {
    exchanges = [],
    requests = { incoming: [], sent: [] },
    allUsers = [],
    currentUser,
  } = useUser() || {};

  const activeExchanges = (exchanges || []).filter(
    (e) => e?.status === "in-progress"
  );

  // Get first name only (e.g. "Ramesh S" → "Ramesh")
  const firstName = (currentUser?.name || "there").split(" ")[0];

  // Smart matching: users who CAN TEACH what I want to learn, OR want to learn what I can teach
  const myOffers = (currentUser?.offers || []).map((s) => s.toLowerCase());
  const myNeeds = (currentUser?.needs || []).map((s) => s.toLowerCase());

  const matchedUsers = (allUsers || [])
    .filter((u) => u?.id !== currentUser?.id)
    .map((u) => {
      const theirOffers = (u.offers || []).map((s) => s.toLowerCase());
      const theirNeeds = (u.needs || []).map((s) => s.toLowerCase());

      // Score: +2 for each skill they teach that I want to learn
      //        +1 for each skill I teach that they want to learn
      let score = 0;
      theirOffers.forEach((s) => { if (myNeeds.includes(s)) score += 2; });
      theirNeeds.forEach((s) => { if (myOffers.includes(s)) score += 1; });

      return { ...u, _matchScore: score };
    })
    // If I have no skills at all, show all users sorted by rating
    .filter((u) => (myOffers.length === 0 && myNeeds.length === 0) ? true : u._matchScore > 0)
    .sort((a, b) => b._matchScore - a._matchScore || (b.rating || 0) - (a.rating || 0));

  // If no skill-based matches, fall back to showing everyone (sorted by rating)
  const availableUsers =
    matchedUsers.length > 0
      ? matchedUsers
      : (allUsers || [])
          .filter((u) => u?.id !== currentUser?.id)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Greeting */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="text-foreground-secondary mt-1">
            Ready for your next skill exchange?
          </p>
        </div>
      </section>

      {/* Summary Row */}
      <DashboardSummary
        activeExchanges={activeExchanges}
        incomingRequests={requests?.incoming || []}
      />

      {/* Recommended Matches */}
      <DashboardSearch users={availableUsers} currentUser={currentUser} />
    </div>
  );
}
