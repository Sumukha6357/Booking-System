"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchItem, apiFetch } from "@/lib/api";

export default function SearchPage() {
  const [checkIn, setCheckIn] = useState("2026-03-01");
  const [checkOut, setCheckOut] = useState("2026-03-04");
  const [query, setQuery] = useState("beach");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function runSearch() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, checkIn, checkOut, lat: "37.7749", lon: "-122.4194", radiusKm: "10000" });
      const data = await apiFetch<SearchItem[]>(`/api/listings/search?${params.toString()}`);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8 md:p-10">
      <section className="card p-6 stagger-in">
        <h2 className="text-2xl font-semibold">Find Experiences</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <input className="rounded-xl border border-border bg-panel p-3" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="City or location" />
          <input className="rounded-xl border border-border bg-panel p-3" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          <input className="rounded-xl border border-border bg-panel p-3" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          <button className="rounded-xl bg-accent p-3 font-semibold text-slate-900" onClick={runSearch}>Search</button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {loading && <div className="card p-6">Loading availability...</div>}
        {!loading && results.map((item, idx) => (
          <article key={item.listingId} className="card p-6 stagger-in" style={{ animationDelay: `${idx * 80}ms` }}>
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="mt-1 text-slate-300">{item.location}</p>
            <p className="mt-3 text-lg">${item.price} total</p>
            <Link className="mt-4 inline-block rounded-xl border border-border px-4 py-2" href={`/listing/${item.listingId}?checkIn=${item.from}&checkOut=${item.to}`}>View Listing</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
