"use client";

import { useEffect, useState } from "react";
import { apiFetch, bookingsApi, BookingFull, InvoiceDetail } from "@/lib/api";
import { 
  Calendar, MapPin, DollarSign, Activity, FileText, 
  MessageSquare, Loader2, ChevronRight, Inbox, Clock, CheckCircle2, XCircle, Award, X, Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { InvoicePanel } from "@/components/invoice-panel";

const stateColors: Record<string, string> = {
  HELD: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  CONFIRMED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  COMPLETED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  CANCELLED: "text-rose-400 bg-rose-400/10 border-rose-400/20"
};

type BookingWithInvoice = BookingFull & {
  invoice?: InvoiceDetail;
  listingTitle?: string;
};

type ModifyModalProps = {
  booking: BookingWithInvoice;
  onClose: () => void;
  onSuccess: () => void;
};

function ModifyModal({ booking, onClose, onSuccess }: ModifyModalProps) {
  const [checkIn, setCheckIn] = useState(booking.checkIn.split("T")[0]);
  const [checkOut, setCheckOut] = useState(booking.checkOut.split("T")[0]);
  const [guestCount, setGuestCount] = useState(booking.guestCount);
  const [guestNotes, setGuestNotes] = useState(booking.guestNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setIsSaving(true);
    setError("");
    try {
      await bookingsApi.modify(booking.id, {
        checkIn,
        checkOut,
        guestCount,
        guestNotes
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to modify booking");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-3xl border border-border bg-surface-low p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">Modify Booking</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-mid rounded-xl">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-rose-400/20 bg-rose-400/10 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Check-in</label>
              <input
                type="date"
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Check-out</label>
              <input
                type="date"
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Guests</label>
            <input
              type="number"
              min={1}
              value={guestCount}
              onChange={e => setGuestCount(parseInt(e.target.value) || 1)}
              className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Special Requests</label>
            <textarea
              value={guestNotes}
              onChange={e => setGuestNotes(e.target.value)}
              placeholder="Any special requests..."
              rows={3}
              className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-canvas disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);
  const [modifyingBooking, setModifyingBooking] = useState<BookingWithInvoice | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(bookingId: string) {
    const reason = prompt("Please provide a reason for cancellation:");
    if (reason === null) return;
    setCancellingId(bookingId);
    try {
      await bookingsApi.cancel(bookingId, reason);
      setBookings(bs => bs.map(b => b.id === bookingId ? { ...b, state: "CANCELLED" } : b));
    } catch (err) {
      alert("Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  }

  async function load() {
    setIsLoading(true);
    try {
      const data = await bookingsApi.myBookings();
      // Fetch listing details to get titles
      const enriched = await Promise.all((data || []).map(async b => {
        try {
          const l = await apiFetch<any>(`/api/listings/${b.listingId}`);
          return { ...b, listingTitle: l.title };
        } catch {
          return b;
        }
      }));
      setBookings(enriched);
    } catch { /* handle unauth */ }
    finally { setIsLoading(false); }
  }

  async function fetchInvoice(bookingId: string) {
    if (loadingInvoiceId) return;
    setLoadingInvoiceId(bookingId);
    try {
      const inv = await bookingsApi.invoice(bookingId);
      setBookings(bs => bs.map(b => b.id === bookingId ? { ...b, invoice: inv } : b));
    } catch (err) {
      console.error("Failed to fetch invoice:", err);
    } finally {
      setLoadingInvoiceId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-10 p-8 md:p-12 pb-24">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl font-bold tracking-tight flex items-center gap-3">
          <Calendar className="text-accent" size={32} />
          My Reservations
        </h1>
        <p className="text-sm text-ink-muted">Track your stays, download invoices and manage your upcoming experiences.</p>
      </header>

      <section className="space-y-6">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
             <div key={i} className="h-48 animate-pulse rounded-3xl bg-surface-low" />
          ))
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-20 text-center space-y-4">
             <Inbox size={48} className="mx-auto text-ink-muted opacity-20" />
             <div className="space-y-1">
               <h3 className="font-semibold text-lg">No reservations found</h3>
               <p className="text-sm text-ink-muted">Explore our curated stays and start your next journey.</p>
             </div>
             <Link 
               href="/search" 
               className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-canvas transition-all hover:scale-105"
             >
               Find a Property
               <ChevronRight size={16} />
             </Link>
          </div>
        ) : (
          bookings.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group overflow-hidden rounded-3xl border border-border bg-surface-low shadow-sm transition-all hover:border-accent/30 hover:shadow-xl"
            >
              <div className="grid md:grid-cols-4">
                {/* Status & Side Info */}
                <div className="flex flex-col justify-between border-b border-border p-6 md:border-b-0 md:border-r">
                   <div className="space-y-4">
                     <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                        stateColors[b.state] || "text-ink-muted bg-white/5 border-white/10"
                     )}>
                        {b.state === "CONFIRMED" && <CheckCircle2 size={12} />}
                        {b.state === "HELD" && <Clock size={12} />}
                        {b.state === "COMPLETED" && <Award size={12} />}
                        {b.state === "CANCELLED" && <XCircle size={12} />}
                        {b.state}
                     </span>
                     <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Reservation Total</div>
                        <div className="font-display text-2xl font-bold text-accent">${b.price.toFixed(2)}</div>
                     </div>
                   </div>
                   <div className="mt-6 text-[10px] font-mono text-ink-faint">
                     #{b.id.slice(0, 13).toUpperCase()}
                   </div>
                </div>

                {/* Main Details */}
                <div className="col-span-3 p-8 space-y-6">
                   <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                         <h2 className="font-display text-2xl font-bold group-hover:text-accent transition-colors">
                           {b.listingTitle || "Enterprise Property"}
                         </h2>
                         <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                            <div className="flex items-center gap-1.5">
                               <Calendar size={14} className="text-accent" />
                               {new Date(b.checkIn).toLocaleDateString()} &rsaquo; {new Date(b.checkOut).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1.5">
                               <Activity size={14} className="text-accent" />
                               {b.guestCount} Resident{b.guestCount !== 1 ? "s" : ""}
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                         <Link 
                           href={`/listing/${b.listingId}`}
                           className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-mid text-ink-muted transition-all hover:border-accent/30 hover:text-accent"
                           title="View Listing"
                         >
                           <ChevronRight size={18} />
                         </Link>
                         <button 
                           onClick={() => fetchInvoice(b.id)}
                           disabled={loadingInvoiceId === b.id}
                           className={cn(
                             "flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all",
                             b.invoice 
                               ? "border-accent/30 bg-accent/10 text-accent" 
                               : "border-border bg-surface-mid text-ink-muted hover:border-accent/30 hover:text-accent"
                           )}
                         >
                            {loadingInvoiceId === b.id ? (
                               <Loader2 size={14} className="animate-spin" />
                            ) : (
                               <FileText size={14} />
                            )}
                            {b.invoice ? "Invoice Loaded" : "Fetch Invoice"}
                         </button>
                      {(b.state === "HELD" || b.state === "CONFIRMED") && (
                        <>
                          <button 
                            onClick={() => setModifyingBooking(b)}
                            className="flex items-center gap-2 rounded-xl border border-border bg-surface-mid px-4 py-2 text-xs font-bold text-ink-muted transition-all hover:border-accent/30 hover:text-accent"
                          >
                            <Edit3 size={14} />
                            Modify
                          </button>
                          <button 
                            onClick={() => handleCancel(b.id)}
                            disabled={cancellingId === b.id}
                            className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs font-bold text-rose-400 transition-all hover:bg-rose-400/20 disabled:opacity-50"
                          >
                            {cancellingId === b.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                            Cancel
                          </button>
                        </>
                      )}
                      <Link 
                            href="/messages"
                            className="flex items-center gap-2 rounded-xl border border-border bg-surface-mid px-4 py-2 text-xs font-bold text-ink-muted transition-all hover:border-accent/30 hover:text-accent"
                          >
                             <MessageSquare size={14} />
                             Message Vendor
                          </Link>
                      </div>
                   </div>

                   {/* Embedded Invoice Panel */}
                   <AnimatePresence>
                     {b.invoice && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 border-t border-border pt-6"
                        >
                           <InvoicePanel invoice={b.invoice} />
                        </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </section>

      <footer className="pt-12 text-center text-[10px] text-ink-muted leading-relaxed">
         All reservations are governed by the Titanium Integrity Engine. 
         <br />
         Cancellations must be requested via the Vendor Messaging channel.
      </footer>

      <AnimatePresence>
        {modifyingBooking && (
          <ModifyModal
            booking={modifyingBooking}
            onClose={() => setModifyingBooking(null)}
            onSuccess={load}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
