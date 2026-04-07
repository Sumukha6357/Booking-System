"use client";

import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { apiFetch, bookingsApi, listingsApi, Listing, BookingFull } from "@/lib/api";
import { Plus, Calendar, DollarSign, Activity, ChevronRight, MoreHorizontal, Layers, Pencil, Trash2, Loader2, Save, X, CheckCircle2, XCircle, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CouponManager } from "@/components/coupon-manager";
import { VendorCalendar } from "@/components/vendor-calendar";

type Booking = BookingFull;

const stateColors: Record<string, string> = {
  HELD: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  CONFIRMED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  CANCELLED: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  COMPLETED: "text-blue-400 bg-blue-400/10 border-blue-400/20"
};

export default function VendorDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [title, setTitle] = useState("Cliffside Villa");
  const [isLoading, setIsLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editForm, setEditForm] = useState<Partial<Listing>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<{
    totalRevenue: number;
    occupancyRate: number;
    bookingConversionRate: number;
    averageBookingValue: number;
  } | null>(null);

  useEffect(() => {
    refresh();
    refreshListings();
    refreshAnalytics();
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

  async function refreshAnalytics() {
    try {
      const data = await apiFetch<any>("/api/analytics/tenant");
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function refreshListings() {
    try {
      const data = await apiFetch<Listing[]>("/api/vendor/listings");
      setListings(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function createListing() {
    try {
      await listingsApi.create({
        title,
        description: "Ocean-facing property with seasonal pricing.",
        location: "California Coast",
        latitude: 36.7783,
        longitude: -119.4179,
        basePrice: 320,
        active: true
      });
      setTitle("Cliffside Villa");
      refreshListings();
    } catch (err) {
      console.error("Failed to create listing:", err);
    }
  }

  async function updateListing() {
    if (!editingListing) return;
    setIsSaving(true);
    try {
      await listingsApi.update(editingListing.id, editForm);
      setEditingListing(null);
      setEditForm({});
      refreshListings();
    } catch (err) {
      console.error("Failed to update listing:", err);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteListing(id: string) {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await listingsApi.delete(id);
      refreshListings();
    } catch (err) {
      console.error("Failed to delete listing:", err);
    }
  }

  function startEditing(listing: Listing) {
    setEditingListing(listing);
    setEditForm(listing);
  }

  async function confirmBooking(id: string) {
    setActionLoadingId(id);
    try {
      const updated = await bookingsApi.confirm(id);
      setBookings(bs => bs.map(b => b.id === id ? updated : b));
    } catch (err) { console.error(err); }
    finally { setActionLoadingId(null); setOpenMenuId(null); }
  }

  async function completeBooking(id: string) {
    setActionLoadingId(id);
    try {
      const updated = await bookingsApi.complete(id);
      setBookings(bs => bs.map(b => b.id === id ? updated : b));
    } catch (err) { console.error(err); }
    finally { setActionLoadingId(null); setOpenMenuId(null); }
  }

  async function cancelBooking(id: string) {
    setActionLoadingId(id);
    try {
      const updated = await bookingsApi.cancel(id);
      setBookings(bs => bs.map(b => b.id === id ? updated : b));
    } catch (err) { console.error(err); }
    finally { setActionLoadingId(null); setOpenMenuId(null); }
  }

  function getListingTitle(listingId: string) {
    return listings.find(l => l.id === listingId)?.title ?? listingId.slice(0, 8);
  }

  return (
    <main className="space-y-8 p-8 md:p-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">Mission Control</h1>
        <p className="text-ink-muted">Manage your property portfolio and real-time booking operations.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Listings", value: listings.length.toString(), icon: Layers, trend: "+2 this month" },
          { label: "Total Bookings", value: bookings.length.toString(), icon: Activity, trend: "Real-time" },
          { label: "Revenue", value: analytics ? `$${analytics.totalRevenue.toLocaleString()}` : "...", icon: DollarSign, trend: analytics ? `${analytics.occupancyRate}% Occ` : "..." },
          { label: "Conversion", value: analytics ? `${analytics.bookingConversionRate}%` : "...", icon: Calendar, trend: "Avg Value" }
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
              <label htmlFor="quick-title" className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Listing Title</label>
              <input
                id="quick-title"
                aria-label="New listing title"
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
            <h3 className="font-display text-lg font-semibold">Your Listings</h3>
            <button className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface-mid/30">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-mid/50 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-ink-muted italic">No listings found. Create one above!</td>
                  </tr>
                ) : (
                  listings.map((listing) => (
                    <tr key={listing.id} className="group transition-colors hover:bg-white/5">
                      <td className="px-6 py-4 font-medium">{listing.title}</td>
                      <td className="px-6 py-4 text-xs">{listing.location}</td>
                      <td className="px-6 py-4 font-bold text-accent">${listing.basePrice}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight",
                          listing.active 
                            ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" 
                            : "text-ink-muted bg-white/5 border-white/10"
                        )}>
                          {listing.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => startEditing(listing)}
                            title="Edit Listing"
                            aria-label={`Edit listing ${listing.title}`}
                            className="text-ink-muted transition-colors hover:text-ink"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => deleteListing(listing.id)}
                            title="Delete Listing"
                            aria-label={`Delete listing ${listing.title}`}
                            className="text-ink-muted transition-colors hover:text-rose-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
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
                    <tr key={b.id} className="group relative transition-colors hover:bg-white/5">
                      <td className="px-6 py-4 font-mono text-xs text-ink-muted">{b.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 font-medium text-sm">{getListingTitle(b.listingId)}</td>
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
                        <div className="relative inline-block">
                          <button
                            id={`booking-menu-${b.id}`}
                            title="More Actions"
                            aria-label="Show more booking options"
                            onClick={() => setOpenMenuId(openMenuId === b.id ? null : b.id)}
                            className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-mid hover:text-ink"
                          >
                            {actionLoadingId === b.id
                              ? <Loader2 size={16} className="animate-spin" />
                              : <MoreHorizontal size={18} />}
                          </button>
                          <AnimatePresence>
                            {openMenuId === b.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-xl border border-border bg-surface-low shadow-2xl"
                              >
                                {b.state === "HELD" && (
                                  <button
                                    onClick={() => confirmBooking(b.id)}
                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-emerald-400 hover:bg-emerald-400/10"
                                  >
                                    <CheckCircle2 size={14} /> Confirm
                                  </button>
                                )}
                                {b.state === "CONFIRMED" && (
                                  <button
                                    onClick={() => completeBooking(b.id)}
                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-blue-400 hover:bg-blue-400/10"
                                  >
                                    <Award size={14} /> Mark Complete
                                  </button>
                                )}
                                {(b.state === "HELD" || b.state === "CONFIRMED") && (
                                  <button
                                    onClick={() => cancelBooking(b.id)}
                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-rose-400 hover:bg-rose-400/10"
                                  >
                                    <XCircle size={14} /> Cancel
                                  </button>
                                )}
                                {b.state !== "HELD" && b.state !== "CONFIRMED" && (
                                  <div className="px-4 py-3 text-xs text-ink-muted italic">No actions available</div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* Calendar View */}
      <section>
        <VendorCalendar 
          listings={listings.map(l => ({ id: l.id, title: l.title }))} 
          bookings={bookings} 
        />
      </section>

      {/* Coupon Management */}
      <section className="grid gap-6 lg:grid-cols-2">
        <CouponManager />
      </section>

      {/* Edit Listing Modal */}

      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-border bg-surface-low p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold">Edit Listing</h3>
              <button 
                title="Close"
                aria-label="Close editing modal"
                onClick={() => setEditingListing(null)} 
                className="text-ink-muted hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Title</label>
                <input
                  title="Title"
                  className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none transition-all focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
                  value={editForm.title || ""}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Description</label>
                <textarea
                  title="Description"
                  className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none transition-all focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
                  rows={3}
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Location</label>
                  <input
                    title="Location"
                    className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none transition-all focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
                    value={editForm.location || ""}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Base Price ($)</label>
                  <input
                    type="number"
                    title="Base Price"
                    className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none transition-all focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
                    value={editForm.basePrice || 0}
                    onChange={(e) => setEditForm({ ...editForm, basePrice: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Max Guests</label>
                  <input
                    type="number"
                    title="Max Guests"
                    className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none transition-all focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
                    value={editForm.maxGuests || 2}
                    onChange={(e) => setEditForm({ ...editForm, maxGuests: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Amenities (comma sep)</label>
                  <input
                    title="Amenities"
                    className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none transition-all focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
                    placeholder="Wifi, Pool, AC"
                    value={editForm.amenities || ""}
                    onChange={(e) => setEditForm({ ...editForm, amenities: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-surface-mid/50 p-4">
                <div>
                  <div className="font-medium">Active Status</div>
                  <div className="text-xs text-ink-muted">Listing visibility</div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    title="Active Status"
                    type="checkbox"
                    checked={editForm.active ?? false}
                    onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-surface-mid after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-accent peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditingListing(null)}
                className="flex-1 rounded-xl border border-border bg-surface-mid px-4 py-3 text-sm font-medium transition-colors hover:bg-surface-high"
              >
                Cancel
              </button>
              <button
                onClick={updateListing}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-canvas transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
