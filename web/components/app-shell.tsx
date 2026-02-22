"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type Mode = "user" | "vendor";

const navByMode: Record<Mode, { href: string; label: string }[]> = {
  user: [
    { href: "/search", label: "Search" },
    { href: "/booking/current/payment", label: "Payment" }
  ],
  vendor: [
    { href: "/vendor", label: "Dashboard" },
    { href: "/search", label: "User View" }
  ]
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>(pathname.startsWith("/vendor") ? "vendor" : "user");
  const nav = useMemo(() => navByMode[mode], [mode]);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-r border-border bg-panel/70 p-6 backdrop-blur">
        <div className="text-lg font-semibold">BookCore</div>
        <p className="mt-2 text-sm text-slate-300">Tenant-aware booking suite</p>
        <div className="mt-6 flex gap-2 rounded-xl border border-border p-1">
          <button onClick={() => setMode("user")} className={`flex-1 rounded-lg px-3 py-2 text-sm ${mode === "user" ? "bg-accent text-slate-900" : "text-slate-300"}`}>User</button>
          <button onClick={() => setMode("vendor")} className={`flex-1 rounded-lg px-3 py-2 text-sm ${mode === "vendor" ? "bg-accent text-slate-900" : "text-slate-300"}`}>Vendor</button>
        </div>
        <nav className="mt-6 space-y-2">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={`block rounded-xl px-4 py-3 ${pathname === item.href ? "bg-white/10" : "hover:bg-white/5"}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <header className="sticky top-0 z-10 border-b border-border bg-canvas/90 px-6 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <input placeholder="Search listings, bookings, cities" className="w-full max-w-xl rounded-xl border border-border bg-panel px-4 py-2 outline-none focus:border-accent" />
            <div className="rounded-xl border border-border px-4 py-2 text-sm">Role: {mode.toUpperCase()}</div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
