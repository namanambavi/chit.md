"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatExpiryCompact, formatExpiryRemaining } from "@/lib/expiry";

export function ExpiryCountdown({ expiresAt }: { expiresAt: number }) {
  const router = useRouter();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let refreshed = false;
    const update = () => {
      const next = expiresAt - Date.now();
      setRemaining(next);
      if (next <= 0 && !refreshed) {
        refreshed = true;
        router.refresh();
      }
    };
    update();
    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, [expiresAt, router]);

  const full = remaining === null ? "Expires soon" : formatExpiryRemaining(remaining);
  const compact = remaining === null ? "Soon" : formatExpiryCompact(remaining);
  return <span className="expiry-countdown" aria-label={full}><span className="expiry-full" aria-hidden="true">{full}</span><span className="expiry-compact" aria-hidden="true">{compact}</span></span>;
}
