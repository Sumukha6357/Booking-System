"use client";

import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { BookingTimer } from "@/components/booking-timer";
import { apiFetch, Listing as ListingType, PriceQuote, bookingsApi, listingsApi, Review } from "@/lib/api";
import { ShieldCheck, Calendar, DollarSign, ArrowRight, Loader2, Sparkles, Coffee, Heart, Star, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PriceBreakdown } from "@/components/price-breakdown";
import { ReviewModal } from "@/components/review-modal";
import { AvailabilityCalendar } from "@/components/availability-calendar";

type SimilarProperty = {
  id: string;
  title: string;
  location: string;
  basePrice: number;
  imageUrls: string;
};

type HoldResponse = {
  bookingId: string;
  holdExpiresAt: string;
  quotedPrice: number;
};

export default function ListingPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkIn = searchParams.get("checkIn") ?? "2026-06-01";
  const checkOut = searchParams.get("checkOut") ?? "2026-06-04";
  
  const [listing, setListing] = useState<ListingType | null>(null);
  const [hold, setHold] = useState<HoldResponse | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingSummary, setRatingSummary] = useState<{ averageRating: number; totalReviews: number } | null>(null);
  const [similarProperties, setSimilarProperties] = useState<SimilarProperty[]>([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWaitlisting, setIsWaitlisting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [myCompletedBookingId, setMyCompletedBookingId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Guest User");

  useEffect(() => {
    async function init() {
      try {
        const [listingData, reviewsData, summaryData, wishlistData] = await Promise.all([
          apiFetch<ListingType>(`/api/listings/${params.id}`),
          apiFetch<Review[]>(`/api/reviews/listing/${params.id}`),
          apiFetch<any>(`/api/reviews/listing/${params.id}/summary`),
          apiFetch<boolean>(`/api/wishlist/check/${params.id}`).catch(() => false)
        ]);
        setListing(listingData);
        setReviews(reviewsData || []);
        setRatingSummary(summaryData);
        setIsInWishlist(wishlistData);
        
        // Fetch similar properties from same vendor
        const allListings = await apiFetch<any[]>("/api/listings/search?q=").catch(() => []);
        setSimilarProperties(allListings.filter((l: any) => l.listingId !== params.id).slice(0, 3).map((l: any) => ({
          id: l.listingId,
          title: l.title,
          location: l.location,
          basePrice: l.price,
          imageUrls: l.imageUrls
        })));

        // Get user profile for reviews
        const profile = await apiFetch<any>("/api/users/profile").catch(() => null);
        if (profile) setUserName(`${profile.firstName || ""} ${profile.lastName || "Guest"}`.trim());

        // Check for a completed booking to enable reviews
        const myBookings = await bookingsApi.myBookings().catch(() => []);
        const completed = myBookings.find(b => b.listingId === params.id && (b.state === "COMPLETED" || b.state === "CONFIRMED"));
        if (completed) setMyCompletedBookingId(completed.id);

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [params.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (checkIn && checkOut) {
        getQuote();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [checkIn, checkOut, couponCode, params.id]);

  async function getQuote() {
    setIsQuoting(true);
    try {
      const q = await listingsApi.priceQuote(params.id, checkIn, checkOut, couponCode);
      setQuote(q);
    } catch (err) {
      console.error("Quote failed:", err);
      setQuote(null);
    } finally {
      setIsQuoting(false);
    }
  }

  const refreshReviews = useCallback(async () => {
    try {
      const [reviewsData, summaryData] = await Promise.all([
        apiFetch<Review[]>(`/api/reviews/listing/${params.id}`),
        apiFetch<any>(`/api/reviews/listing/${params.id}/summary`)
      ]);
      setReviews(reviewsData || []);
      setRatingSummary(summaryData);
    } catch (err) { console.error(err); }
  }, [params.id]);

  async function holdBooking() {
    setIsHolding(true);
    try {
      const response = await apiFetch<HoldResponse>(`/api/bookings/hold${couponCode ? `?coupon=${couponCode}` : ""}`, {
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

  async function toggleWishlist() {
    try {
      if (isInWishlist) {
        await apiFetch(`/api/wishlist/${params.id}`, { method: "DELETE" });
        setIsInWishlist(false);
      } else {
        await apiFetch(`/api/wishlist/${params.id}`, { method: "POST" });
        setIsInWishlist(true);
      }
    } catch (err) { console.error(err); }
  }

  async function joinWaitlist() {
    setIsWaitlisting(true);
    try {
      await apiFetch(`/api/waitlist/${params.id}?from=${checkIn}&to=${checkOut}`, { method: "POST" });
      alert("You've been added to the waitlist! We'll notify you if these dates become available.");
    } catch (err) { console.error(err); }
    finally { setIsWaitlisting(false); }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  const images = listing?.imageUrls?.split(",") || [];

  return (
    <main className="mx-auto max-w-7xl animate-in space-y-8 p-8 md:p-10 pb-24">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent">
            <Sparkles size={12} />
            Verified Enterprise Property
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight">{listing?.title}</h1>
          <div className="flex items-center gap-3 text-sm text-ink-muted">
             <div className="flex items-center gap-1">
               <Calendar size={14} />
               {new Date(checkIn).toLocaleDateString()} &rsaquo; {new Date(checkOut).toLocaleDateString()}
             </div>
             <span>&bull;</span>
             <div className="flex items-center gap-1 font-medium text-amber-400">
               <Star size={14} fill="currentColor" />
               {ratingSummary?.averageRating || 0} ({ratingSummary?.totalReviews || 0} reviews)
             </div>
             <span>&bull;</span>
             <span>Ref: {params.id.slice(0, 8)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleWishlist}
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border transition-all",
              isInWishlist ? "border-rose-400/30 bg-rose-400/10 text-rose-400 scale-110" : "border-border bg-surface-low text-ink-muted hover:border-accent/30"
            )}
          >
            <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
          </button>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          {/* Enhanced Multi-image Carousel */}
          <div className="group relative aspect-video overflow-hidden rounded-3xl border border-border bg-surface-mid shadow-inner">
             {images.length > 0 ? (
                <>
                  <motion.img 
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={images[currentImageIndex].trim()} 
                    className="h-full w-full object-cover" 
                    alt={listing?.title}
                  />
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length)}
                        title="Previous Image"
                        aria-label="Previous Image"
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-canvas/20 p-2 text-canvas opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 hover:bg-canvas/40"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={() => setCurrentImageIndex((currentImageIndex + 1) % images.length)}
                        title="Next Image"
                        aria-label="Next Image"
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-canvas/20 p-2 text-canvas opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 hover:bg-canvas/40"
                      >
                        <ChevronRight size={24} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                         {images.map((_, i) => (
                           <div key={i} className={cn("h-1.5 w-1.5 rounded-full transition-all", i === currentImageIndex ? "w-4 bg-canvas" : "bg-canvas/40")} />
                         ))}
                      </div>
                    </>
                  )}
                </>
             ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-mid text-ink-muted/10">
                  <Sparkles size={64} />
                </div>
             )}
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface-low p-6">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Coffee size={18} className="text-accent" />
                Experience Overview
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                {listing?.description}
              </p>
            </div>
            
            <div className="rounded-2xl border border-border bg-surface-low p-6">
              <h3 className="font-display text-lg font-semibold">Curated Amenities</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {listing?.amenities?.split(",").map(a => (
                  <span key={a} className="rounded-xl border border-border bg-surface-mid px-3 py-2 text-xs font-medium">
                    {a.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <section className="space-y-6">
             <div className="flex items-center justify-between">
               <h3 className="font-display text-2xl font-bold">Resident Experiences</h3>
               {myCompletedBookingId && (
                 <ReviewModal
                   listingId={params.id}
                   bookingId={myCompletedBookingId}
                   guestName={userName}
                   onSubmitted={refreshReviews}
                 />
               )}
             </div>
             <div className="grid gap-4 md:grid-cols-2">
                {reviews.length > 0 ? reviews.map((r, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={r.id} 
                    className="rounded-2xl border border-border bg-surface-low p-5 space-y-3"
                  >
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{r.guestName}</span>
                        <div className="flex gap-0.5 text-amber-400">
                           {Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                        </div>
                     </div>
                      <p className="text-xs text-ink-muted italic leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                     <div className="text-[10px] text-ink-faint">{new Date(r.createdAt).toLocaleDateString()} &bull; Verified Stay</div>
                  </motion.div>
                )) : (
                  <p className="text-sm text-ink-muted py-8 text-center col-span-2 border border-dashed border-border rounded-2xl">
                    Be the first to share your experience at this property.
                  </p>
                )}
             </div>
          </section>

          {similarProperties.length > 0 && (
            <section className="space-y-6 border-t border-border pt-12">
               <h3 className="font-display text-2xl font-bold">Similar Discoveries</h3>
               <div className="grid gap-6 md:grid-cols-3">
                  {similarProperties.map(p => (
                    <Link href={`/listing/${p.id}`} key={p.id} className="group overflow-hidden rounded-2xl border border-border bg-surface-low transition-all hover:border-accent/30 hover:shadow-xl">
                      <div className="aspect-[4/3] w-full overflow-hidden bg-surface-mid">
                        <img src={p.imageUrls.split(",")[0]} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt={p.title} />
                      </div>
                      <div className="p-4 space-y-1">
                        <div className="text-xs font-bold text-accent">${p.basePrice} / night</div>
                        <h4 className="font-semibold text-sm truncate">{p.title}</h4>
                      </div>
                    </Link>
                  ))}
               </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-3xl border border-border bg-surface-low p-8 shadow-2xl">
              <h3 className="font-display text-xl font-bold tracking-tight">Reserve Snapshot</h3>
              <div className="mt-6 space-y-4">
                 <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-mid/50 p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-ink-muted">Nightly Base</div>
                    <div className="font-display text-xl font-bold text-accent">${listing?.basePrice}</div>
                 </div>

                 <div className="space-y-2">
                   <label htmlFor="listing-coupon" className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Optional Coupon</label>
                   <input 
                     id="listing-coupon"
                     placeholder="SAVE10"
                     value={couponCode}
                     onChange={e => setCouponCode(e.target.value.toUpperCase())}
                     className="w-full rounded-xl border border-border bg-surface-mid p-3 text-sm focus:border-accent/50 outline-none"
                   />
                 </div>

                 <AnimatePresence>
                   {quote && !hold && (
                     <PriceBreakdown quote={quote} />
                   )}
                 </AnimatePresence>
                 
                 <AnimatePresence mode="wait">
                   {!hold ? (
                      <div className="space-y-3">
                        <motion.button
                          key="hold-btn"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={holdBooking}
                          disabled={isHolding || isQuoting}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-5 text-sm font-bold text-canvas shadow-lg shadow-accent/10 transition-all hover:scale-[1.02] hover:shadow-accent/20 active:scale-[0.98] disabled:opacity-50"
                        >
                          {isHolding || isQuoting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                          Secure with 10min Hold
                        </motion.button>
                        
                        <button 
                          onClick={joinWaitlist}
                          disabled={isWaitlisting}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border p-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted hover:border-accent/30 hover:text-accent disabled:opacity-50"
                        >
                          <Bell size={12} />
                          Join Availability Waitlist
                        </button>
                      </div>
                   ) : (
                      <motion.div
                        key="hold-active"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                      >
                        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-center">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Inventory Reserved</div>
                          <BookingTimer expiresAt={hold.holdExpiresAt} />
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-4">
                          <span className="text-sm font-medium">Estimated Total</span>
                          <span className="font-display text-3xl font-bold text-accent">${hold.quotedPrice}</span>
                        </div>
                        <Link 
                          href={`/booking/${hold.bookingId}/payment`} 
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-5 text-sm font-bold text-canvas shadow-lg shadow-accent/20 transition-all hover:scale-[1.02]"
                        >
                          Proceed to Secure Payment
                          <ArrowRight size={18} />
                        </Link>
                      </motion.div>
                   )}
                 </AnimatePresence>
              </div>
              <p className="mt-4 text-center text-[10px] leading-relaxed text-ink-muted">
                Prices for {listing?.title} include tenant-mandated service fees and state-machine integrity checks.
              </p>
            </div>
            
            <AvailabilityCalendar listingId={params.id} />
          </div>
        </aside>
      </section>
    </main>
  );
}
