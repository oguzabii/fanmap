"use client";

import { useEffect } from "react";

// Persists the supporter id locally so the daily host-region check-in can be
// attached to a known supporter (best-effort; the battle works without it).
export function RememberSupporter({ id }: { id: string }) {
  useEffect(() => {
    try {
      localStorage.setItem("fanmap_supporter_id", id);
    } catch {
      /* ignore (private mode / storage disabled) */
    }
  }, [id]);
  return null;
}
