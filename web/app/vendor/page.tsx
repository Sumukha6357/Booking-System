"use client";

import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { apiFetch } from "@/lib/api";
import { Plus, Calendar, DollarSign, Activity, ChevronRight, MoreHorizontal, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Booking = {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  state: string;
  price: number;
};

const stateColors: Record<string, string> = {
  HELD: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  CONFIRMED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  CANCELLED: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  COMPLETED: "text-blue-400 bg-blue-400/10 border-blue-400/20"
};

export default function VendorDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [title, setTitle] = useState("Cliffside Villa");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const tenantId = typeof window !== "undefined" ? localStorage.getItem("tenantId") : null;
    if (!tenantId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/ws`),
      reconnectDelay: 5000
    });

    client.onConnect = () => {
      client.subscribe(`/topic/tenants/${tenantId}/bookings`, () => {
        refresh();
      });
    };

    client.activate();
    return () => {
      void client.deactivate();
    };
  }, []);

  async function refresh() {
    setIsLoading(true);
    try {
      const data = await apiFetch<Booking[]>("/api/bookings");
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function createListing() {
    await apiFetch("/api/listings", {
      method: "POST",
      body: JSON.stringify({
        title,
        description: "Ocean-facing property with seasonal pricing.",
        location: "California Coast",
        latitude: 36.7783,
        longitude: -119.4179,
        basePrice: 320
      })
    });
    setTitle("Cliffside Villa");
    // refresh(); // Optional: if listings are shown as well
  }

  return (
    <main className="space-y-8 p-8 md:p-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">Mission Control</h1>
        <p className="text-ink-muted">Manage your property portfolio and real-time booking operations.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Listings", value: "12", icon: Layers, trend: "+2 this month" },
          { label: "Total Bookings", value: bookings.length.toString(), icon: Activity, trend: "Real-time" },
          { label: "Revenue", value: "$14,240", icon: DollarSign, trend: "+12.5%" },
          { label: "Check-ins", value: "3", icon: Calendar, trend: "Today" }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface-low p-6 transition-all hover:border-accent/30"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-surface-mid p-2.5 text-ink-muted group-hover:text-accent">
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{stat.trend}</span>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium text-ink-muted">{stat.label}</div>
              <div className="font-display text-2xl font-bold">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-border bg-surface-low p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Quick Actions</h3>
            <Plus size={18} className="text-ink-muted" />
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Listing Title</label>
              <input
                className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none transition-all focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
                placeholder="e.g. Modern Studio"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <button
                onClick={createListing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-canvas transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={18} />
                Create New Listing
              </button>
              <button className="w-full rounded-xl border border-border bg-surface-mid px-4 py-3 text-sm font-medium transition-colors hover:bg-surface-high">
                Bulk Availability Editor
              </button>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-surface-low p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Recent Bookings</h3>
            <button className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface-mid/30">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-mid/50 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-6 font-medium text-ink-muted">Refreshing secure link...</td>
                    </tr>
                  ))
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-ink-muted italic">No active bookings detected.</td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="group transition-colors hover:bg-white/5">
                      <td className="px-6 py-4 font-mono text-xs text-ink-muted">{b.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 font-medium">Cliffside Villa</td>
                      <td className="px-6 py-4 text-xs font-medium">
                        {new Date(b.checkIn).toLocaleDateString()} &rsaquo; {new Date(b.checkOut).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight",
                          stateColors[b.state] || "text-ink-muted bg-white/5 border-white/10"
                        )}>
                          {b.state}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-accent">${b.price}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-ink-muted transition-colors hover:text-ink">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}

