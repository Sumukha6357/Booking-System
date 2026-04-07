"use client";

import { useEffect, useState, use } from "react";
import { apiFetch, Listing } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Check, X, Users, Bed, Bath, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ListingDetail = Listing & {
  houseRules?: string;
  checkInInstructions?: string;
  amenities?: string;
};

export default function ComparePage({ searchParams }: { searchParams: Promise<{ listings?: string }> }) {
  const params = use(searchParams);
  const [listings, setListings] = useState<ListingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!params.listings) return;
      const ids = params.listings.split(",");
      try {
        const data = await Promise.all(
          ids.map(id => apiFetch<ListingDetail>(`/api/listings/${id}`))
        );
        setListings(data);
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params.listings]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <main className="mx-auto max-w-4xl p-8 text-center">
        <p className="text-ink-muted">No listings to compare.</p>
        <Link href="/search" className="text-accent hover:underline mt-4 inline-block">
          Back to search
        </Link>
      </main>
    );
  }

  const amenitiesSet = new Set<string>();
  listings.forEach(l => l.amenities?.split(",").forEach(a => amenitiesSet.add(a.trim())));
  const allAmenities = Array.from(amenitiesSet);

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8 md:p-10">
      <header className="flex items-center gap-4">
        <Link href="/wishlist" className="p-2 rounded-xl border border-border hover:border-accent/30">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold">Compare Properties</h1>
          <p className="text-ink-muted">{listings.length} properties side by side</p>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="p-4 text-left text-sm font-medium text-ink-muted">Property</th>
              {listings.map(l => (
                <th key={l.id} className="p-4 text-left">
                  <div className="rounded-2xl border border-border bg-surface-low overflow-hidden">
                    <div className="aspect-video bg-surface-mid">
                      {l.imageUrls && (
                        <img 
                          src={l.imageUrls.split(",")[0]} 
                          alt={l.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-lg font-semibold line-clamp-1">{l.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-ink-muted mt-1">
                        <MapPin size={12} />
                        {l.location}
                      </div>
                      <Link 
                        href={`/listing/${l.id}`}
                        className="mt-3 block w-full rounded-xl bg-accent px-4 py-2 text-center text-sm font-bold text-canvas"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="p-4 font-medium">Price per night</td>
              {listings.map(l => (
                <td key={l.id} className="p-4">
                  <span className="font-display text-2xl font-bold text-accent">${l.basePrice}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-medium">Max Guests</td>
              {listings.map(l => (
                <td key={l.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-ink-muted" />
                    {l.maxGuests}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-medium">House Rules</td>
              {listings.map(l => (
                <td key={l.id} className="p-4 text-sm text-ink-muted">
                  {l.houseRules || "Not specified"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-medium">Check-in Instructions</td>
              {listings.map(l => (
                <td key={l.id} className="p-4 text-sm text-ink-muted">
                  {l.checkInInstructions || "Not specified"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-medium">Amenities</td>
              {listings.map(l => (
                <td key={l.id} className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {allAmenities.slice(0, 6).map(amenity => {
                      const has = l.amenities?.toLowerCase().includes(amenity.toLowerCase());
                      return (
                        <span 
                          key={amenity}
                          className={cn(
                            "flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium",
                            has ? "bg-emerald-400/10 text-emerald-400" : "bg-surface-mid text-ink-muted"
                          )}
                        >
                          {has ? <Check size={10} /> : <X size={10} />}
                          {amenity}
                        </span>
                      );
                    })}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
