"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { Heart, Trash2, MapPin, Calendar, Loader2, Share2, GitCompare } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type WishlistItem = {
  id: string;
  listingId: string;
  listing?: {
    id: string;
    title: string;
    location: string;
    basePrice: number;
    imageUrls: string;
    maxGuests: number;
  };
  createdAt: string;
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [compareList, setCompareList] = useState<string[]>([]);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    setIsLoading(true);
    try {
      const data = await apiFetch<WishlistItem[]>("/api/wishlist");
      setItems(data || []);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function removeFromWishlist(listingId: string) {
    try {
      await apiFetch(`/api/wishlist/${listingId}`, { method: "DELETE" });
      setItems(items => items.filter(i => i.listingId !== listingId));
      setCompareList(c => c.filter(id => id !== listingId));
    } catch (err) {
      console.error("Failed to remove:", err);
    }
  }

  function toggleCompare(listingId: string) {
    if (compareList.includes(listingId)) {
      setCompareList(c => c.filter(id => id !== listingId));
    } else if (compareList.length < 3) {
      setCompareList(c => [...c, listingId]);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8 md:p-10">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl font-bold tracking-tight flex items-center gap-3">
          <Heart className="text-rose-400" size={32} />
          My Wishlist
        </h1>
        <p className="text-ink-muted">Your saved places for future trips.</p>
      </header>

      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-accent/30 bg-surface-low px-6 py-3 shadow-xl">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{compareList.length} properties selected</span>
            <Link
              href={`/compare?listings=${compareList.join(",")}`}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-canvas hover:bg-accent/90"
            >
              Compare Now
            </Link>
            <button
              onClick={() => setCompareList([])}
              className="text-sm text-ink-muted hover:text-rose-400"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border py-20 text-center space-y-4">
          <Heart size={48} className="mx-auto text-ink-muted opacity-20" />
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">No saved places yet</h3>
            <p className="text-sm text-ink-muted">Save places you love to see them here.</p>
          </div>
          <Link 
            href="/search" 
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-canvas transition-all hover:scale-105"
          >
            Explore Properties
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.listingId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface-low"
            >
              <Link href={`/listing/${item.listingId}`}>
                <div className="aspect-[4/3] overflow-hidden bg-surface-mid">
                  {item.listing?.imageUrls ? (
                    <img 
                      src={item.listing.imageUrls.split(",")[0]} 
                      alt={item.listing.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-muted/20">
                      <Heart size={48} />
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold line-clamp-1">
                      {item.listing?.title || "Property"}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-ink-muted mt-1">
                      <MapPin size={14} />
                      {item.listing?.location || "Unknown location"}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="font-display text-xl font-bold text-accent">
                    ${item.listing?.basePrice || 0}
                    <span className="text-sm font-normal text-ink-muted"> / night</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-ink-muted">
                    <Calendar size={12} />
                    {item.listing?.maxGuests || 2} guests
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => toggleCompare(item.listingId)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all",
                      compareList.includes(item.listingId)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-ink-muted hover:border-accent/30"
                    )}
                  >
                    <GitCompare size={14} />
                    {compareList.includes(item.listingId) ? "Selected" : "Compare"}
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.listingId)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 px-3 py-2 text-xs font-bold text-rose-400 transition-all hover:bg-rose-400/10"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
