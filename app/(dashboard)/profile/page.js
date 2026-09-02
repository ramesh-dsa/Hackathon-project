"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../lib/user-context";

export default function ProfileRedirect() {
  const router = useRouter();
  const { currentUser } = useUser();

  useEffect(() => {
    if (currentUser?.id) {
      router.replace(`/profile/${currentUser.id}`);
    } else {
      router.replace('/dashboard');
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}
