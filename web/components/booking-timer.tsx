"use client";

import { useEffect, useMemo, useState } from "react";

export function BookingTimer({ expiresAt }: { expiresAt: string }) {
  const target = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.floor((target - Date.now()) / 1000)));

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm">Hold expires in {mins}:{secs.toString().padStart(2, "0")}</div>;
}
