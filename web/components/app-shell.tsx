"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutDashboard, User, Globe, Wallet, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "user" | "vendor";

const navByMode: Record<Mode, { href: string; label: string; icon: any }[]> = {
  user: [
    { href: "/search", label: "Explore", icon: Globe },
    { href: "/booking/current/payment", label: "Active Booking", icon: Wallet }
  ],
  vendor: [
    { href: "/vendor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/search", label: "Switch to User", icon: User }
  ]
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>(pathname.startsWith("/vendor") ? "vendor" : "user");
  const nav = useMemo(() => navByMode[mode], [mode]);

  return (
    <div className="min-h-screen bg-canvas text-ink selection:bg-accent/30 md:grid md:grid-cols-[280px_1fr]">
      <aside className="relative flex flex-col border-r border-border bg-surface-low/50 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="font-display text-xl font-bold tracking-tight">BookCore</div>
            <p className="text-[10px] uppercase tracking-widest text-ink-muted">Enterprise Suite</p>
          </div>
        </div>

        <div className="mt-8 flex gap-1 rounded-2xl border border-border bg-surface-mid/50 p-1">
          {(["user", "vendor"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "relative flex-1 rounded-xl py-2 text-sm font-medium transition-all duration-300",
                mode === m ? "text-canvas" : "text-ink-muted hover:text-ink"
              )}
            >
              {mode === m && (
                <motion.div
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-xl bg-accent"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 capitalize">{m}</span>
            </button>
          ))}
        </div>

        <nav className="mt-8 flex-1 space-y-1">
          {nav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  isActive ? "bg-accent/5 text-accent" : "text-ink-muted hover:bg-white/5 hover:text-ink"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl border border-accent/20 bg-accent/5"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={18} className={cn("relative z-10", isActive ? "text-accent" : "text-ink-muted group-hover:text-ink")} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-surface-mid to-surface-low p-4">
            <div className="text-xs font-semibold text-ink-muted">Active Tenant</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <div className="text-sm font-medium">Global AI Hub</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-canvas/60 px-8 py-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
            <input
              placeholder="Search listings, bookings, cities..."
              className="w-full rounded-2xl border border-border bg-surface-mid/50 py-2.5 pl-12 pr-4 outline-none transition-all focus:border-accent/50 focus:bg-surface-mid focus:ring-4 focus:ring-accent/5"
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-mid/50 px-4 py-2 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                ROLE: {mode.toUpperCase()}
             </div>
             <div className="h-10 w-10 rounded-full border border-border bg-surface-mid" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

