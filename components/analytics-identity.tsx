"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { identifyClientUser } from "@/lib/analytics-client";

export function AnalyticsIdentity() {
  const { data: session } = authClient.useSession();
  useEffect(() => {
    if (session?.user.id) identifyClientUser(session.user.id);
  }, [session?.user.id]);
  return null;
}
