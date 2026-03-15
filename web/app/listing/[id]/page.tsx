"use client";

import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BookingTimer } from "@/components/booking-timer";
import { apiFetch } from "@/lib/api";
import { ShieldCheck, Calendar, DollarSign, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type HoldResponse = {
  bookingId: string;
  holdExpiresAt: string;
  quotedPrice: number;
  state: string;
};

export default function ListingPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkIn = searchParams.get("checkIn") ?? "2026-03-01";
  const checkOut = searchParams.get("checkOut") ?? "2026-03-04";
  const [hold, setHold] = useState<HoldResponse | null>(null);
  const [isHolding, setIsHolding] = useState(false);

  async function holdBooking() {
    setIsHolding(true);
    try {
      const response = await apiFetch<HoldResponse>("/api/bookings/hold", {
        method: "POST",
        body: JSON.stringify({ listingId: params.id, checkIn, checkOut })
      });
      setHold(response);
      localStorage.setItem("activeBookingId", response.bookingId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsHolding(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-8 md:p-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent">
            <Sparkles size={12} />
            Verified Listing
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Luxury Suite</h1>
          <div className="flex items-center gap-3 text-sm text-ink-muted">
             <div className="flex items-center gap-1">
               <Calendar size={14} />
               {new Date(checkIn).toLocaleDateString()} &rsaquo; {new Date(checkOut).toLocaleDateString()}
             </div>
             <span>&bull;</span>
             <span>Ref: {params.id.slice(0, 8)}</span>
          </div>
        </div>
        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface-low md:flex">
          <ShieldCheck size={24} className="text-accent" />
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-surface-mid">
             {/* Main Image Placeholder */}
             <div className="flex h-full w-full items-center justify-center text-ink-muted/10">
               <Sparkles size={64} />
             </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface-low p-6">
            <h3 className="font-display text-lg font-semibold">About this experience</h3>
            <p className="mt-4 text-ink-muted">
              Experience unparalleled luxury in this meticulously designed suite. Featuring floor-to-ceiling windows, 
              high-performance sound systems, and 24/7 concierge support. Perfect for both business and leisure.
            </p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="sticky top-24 rounded-2xl border border-border bg-surface-low p-6 shadow-2xl">
            <h3 className="font-display text-lg font-semibold">Reserve your dates</h3>
            <div className="mt-6 space-y-4">
               <div className="flex items-center justify-between rounded-xl border border-border bg-surface-mid/50 p-4">
                  <div className="text-xs text-ink-muted">Base Rate</div>
                  <div className="font-display font-bold text-accent">$320 / night</div>
               </div>
               
               <AnimatePresence mode="wait">
                 {!hold ? (
                   <motion.button
                     key="hold-btn"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={holdBooking}
                     disabled={isHolding}
                     className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-sm font-bold text-canvas transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                   >
                     {isHolding ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                     Secure with 10min Hold
                   </motion.button>
                 ) : (
                   <motion.div
                     key="hold-active"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="space-y-4"
                   >
                     <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-center">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Inventory Reserved</div>
                        <BookingTimer expiresAt={hold.holdExpiresAt} />
                     </div>
                     <div className="flex items-center justify-between border-t border-border pt-4">
                        <span className="text-sm font-medium">Quoted Total</span>
                        <span className="font-display text-2xl font-bold text-accent">${hold.quotedPrice}</span>
                     </div>
                     <Link 
                       href={`/booking/${hold.bookingId}/payment`} 
                       className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-sm font-bold text-canvas transition-all hover:scale-[1.02]"
                     >
                       Complete Payment
                       <ArrowRight size={18} />
                     </Link>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
            <p className="mt-4 text-center text-[10px] text-ink-muted">
              Price includes all tenant-mandated fees and taxes.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

