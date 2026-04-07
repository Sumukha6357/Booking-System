"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchItem, apiFetch } from "@/lib/api";
import { Search, MapPin, Calendar, ArrowRight, Loader2, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const [checkIn, setCheckIn] = useState("2026-03-01");
  const [checkOut, setCheckOut] = useState("2026-03-04");
  const [guests, setGuests] = useState(2);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [query, setQuery] = useState("beach");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  async function runSearch() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        q: query, 
        checkIn, 
        checkOut, 
        guests: guests.toString(),
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
        lat: "37.7749", 
        lon: "-122.4194", 
        radiusKm: "10000" 
      });
      const data = await apiFetch<SearchItem[]>(`/api/listings/search?${params.toString()}`);
      setResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-8 p-8 md:p-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">Find your next stay</h1>
        <p className="text-ink-muted">Discover curated listings from our global network of verified hosts.</p>
      </header>

      <section className="rounded-2xl border border-border bg-surface-low p-1 shadow-2xl transition-all">
        <div className="grid gap-2 p-1 md:grid-cols-4 lg:grid-cols-5">
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
            <input 
               className="w-full rounded-xl border border-transparent bg-surface-mid/50 py-4 pl-12 pr-4 text-sm outline-none transition-all focus:bg-surface-mid focus:ring-2 focus:ring-accent/20" 
               value={query} 
               onChange={(e) => setQuery(e.target.value)} 
               placeholder="Where are you going?" 
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
            <input 
              aria-label="Check-in Date"
              className="w-full rounded-xl border border-transparent bg-surface-mid/50 py-4 pl-12 pr-4 text-sm outline-none transition-all focus:bg-surface-mid focus:ring-2 focus:ring-accent/20" 
              type="date" 
              value={checkIn} 
              onChange={(e) => setCheckIn(e.target.value)} 
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
            <input 
              aria-label="Check-out Date"
              className="w-full rounded-xl border border-transparent bg-surface-mid/50 py-4 pl-12 pr-4 text-sm outline-none transition-all focus:bg-surface-mid focus:ring-2 focus:ring-accent/20" 
              type="date" 
              value={checkOut} 
              onChange={(e) => setCheckOut(e.target.value)} 
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-4 text-sm font-medium transition-all hover:bg-surface-mid",
                showFilters && "border-accent bg-accent/5 text-accent"
              )}
            >
              Filters
            </button>
            <button 
              className="group flex flex-[2] items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-sm font-bold text-canvas transition-all hover:scale-[1.02] active:scale-[0.98]" 
              onClick={runSearch}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Search
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="grid gap-6 p-6 md:grid-cols-3">
                <div className="space-y-3">
                   <label className="text-xs font-bold uppercase tracking-widest text-ink-muted">Guests</label>
                   <div className="flex items-center gap-4">
                      <button onClick={() => setGuests(Math.max(1, guests - 1))} className="h-10 w-10 rounded-full border border-border bg-surface-mid transition-all hover:bg-surface-high">-</button>
                      <span className="font-display text-lg font-bold">{guests}</span>
                      <button onClick={() => setGuests(guests + 1)} className="h-10 w-10 rounded-full border border-border bg-surface-mid transition-all hover:bg-surface-high">+</button>
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-xs font-bold uppercase tracking-widest text-ink-muted">Price Range ($)</label>
                   <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={minPrice} 
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none" 
                        placeholder="Min"
                      />
                      <span className="text-ink-muted">&rsaquo;</span>
                      <input 
                        type="number" 
                        value={maxPrice} 
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-surface-mid p-3 text-sm outline-none" 
                        placeholder="Max"
                      />
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-xs font-bold uppercase tracking-widest text-ink-muted">Property Amenities</label>
                   <div className="flex flex-wrap gap-2">
                      {["Wifi", "Pool", "Kitchen", "AC", "Parking"].map(a => (
                        <button key={a} className="rounded-full border border-border bg-surface-mid px-3 py-1.5 text-xs font-medium transition-all hover:border-accent/40">
                          {a}
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-border bg-surface-mid/50" />
            ))
          ) : results.length === 0 ? (
            <div className="col-span-full py-20 text-center">
               <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-mid text-ink-muted">
                 <Search size={24} />
               </div>
               <h3 className="mt-4 font-display text-lg font-semibold">No results found</h3>
               <p className="text-sm text-ink-muted">Try adjusting your search filters or destination.</p>
            </div>
          ) : (
            results.map((item, idx) => (
              <motion.article 
                key={item.listingId} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface-low transition-all hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5"
              >
                <div className="aspect-[16/10] bg-surface-mid">
                  {/* Placeholder for real images */}
                  <div className="flex h-full w-full items-center justify-center text-ink-muted/20">
                    <MapPin size={48} />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-accent">
                    <span>{item.location}</span>
                    <div className="flex items-center gap-1">
                      <Star size={10} fill="currentColor" />
                      4.9 (120)
                    </div>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold leading-tight line-clamp-1">{item.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-surface-mid px-2 py-0.5 text-[8px] font-bold uppercase text-ink-muted">
                      {item.maxGuests} Guests
                    </span>
                    {item.amenities && item.amenities.split(",").slice(0, 2).map(a => (
                      <span key={a} className="flex items-center gap-1 rounded-full bg-surface-mid px-2 py-0.5 text-[8px] font-bold uppercase text-ink-muted">
                        {a.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <div>
                      <span className="text-xs text-ink-muted">Total for dates</span>
                      <div className="font-display text-xl font-bold text-accent">${item.price}</div>
                    </div>
                    <Link 
                       href={`/listing/${item.listingId}?checkIn=${item.from}&checkOut=${item.to}`}
                       className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-mid text-ink transition-all group-hover:bg-accent group-hover:text-canvas"
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

