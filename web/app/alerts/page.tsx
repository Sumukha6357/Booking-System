"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { Bell, Search, Trash2, Loader2, Plus, MapPin, DollarSign, Users } from "lucide-react";
import { motion } from "framer-motion";

type SavedSearch = {
  id: string;
  query: string;
  maxPrice?: number;
  minGuests?: number;
  location?: string;
  createdAt: string;
  lastNotifiedAt?: string;
};

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ query: "", maxPrice: "", minGuests: "", location: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSearches();
  }, []);

  async function loadSearches() {
    setIsLoading(true);
    try {
      const data = await apiFetch<SavedSearch[]>("/api/searches");
      setSearches(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function createSearch() {
    if (!form.query && !form.location) return;
    setIsSaving(true);
    try {
      await apiFetch("/api/searches", {
        method: "POST",
        body: JSON.stringify({
          query: form.query || null,
          maxPrice: form.maxPrice ? parseFloat(form.maxPrice) : null,
          minGuests: form.minGuests ? parseInt(form.minGuests) : null,
          location: form.location || null
        })
      });
      setForm({ query: "", maxPrice: "", minGuests: "", location: "" });
      setShowForm(false);
      loadSearches();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteSearch(id: string) {
    try {
      await apiFetch(`/api/searches/${id}`, { method: "DELETE" });
      setSearches(s => s.filter(x => x.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-8 md:p-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="text-accent" size={28} />
            Price Alerts
          </h1>
          <p className="text-ink-muted mt-1">Get notified when properties match your criteria.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-canvas"
        >
          <Plus size={16} />
          New Alert
        </button>
      </header>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-surface-low p-6 space-y-4"
        >
          <h3 className="font-semibold">Create New Price Alert</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase text-ink-muted">Search Query</label>
              <input
                value={form.query}
                onChange={e => setForm({ ...form, query: e.target.value })}
                placeholder="e.g. beach, cabin"
                className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-ink-muted">Location</label>
              <input
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. California"
                className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-ink-muted">Max Price</label>
              <input
                type="number"
                value={form.maxPrice}
                onChange={e => setForm({ ...form, maxPrice: e.target.value })}
                placeholder="300"
                className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-ink-muted">Min Guests</label>
              <input
                type="number"
                value={form.minGuests}
                onChange={e => setForm({ ...form, minGuests: e.target.value })}
                placeholder="2"
                className="mt-2 w-full rounded-xl border border-border bg-surface-mid p-3 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-xl border border-border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={createSearch}
              disabled={isSaving || (!form.query && !form.location)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-canvas disabled:opacity-50"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Create Alert
            </button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-accent" size={24} />
        </div>
      ) : searches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Bell size={40} className="mx-auto text-ink-muted opacity-20" />
          <p className="mt-4 text-ink-muted">No price alerts set</p>
          <p className="text-sm text-ink-muted">Create an alert to get notified about new properties</p>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((search, i) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-xl border border-border bg-surface-low p-4"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-accent/10 p-2">
                  <Search size={18} className="text-accent" />
                </div>
                <div>
                  <div className="font-medium">
                    {search.query || search.location || "All properties"}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-muted mt-1">
                    {search.location && <span className="flex items-center gap-1"><MapPin size={12} />{search.location}</span>}
                    {search.maxPrice && <span className="flex items-center gap-1"><DollarSign size={12} />Up to ${search.maxPrice}</span>}
                    {search.minGuests && <span className="flex items-center gap-1"><Users size={12} />{search.minGuests}+ guests</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/search?q=${search.query || ""}&location=${search.location || ""}`}
                  className="text-sm text-accent hover:underline"
                >
                  View Results
                </Link>
                <button
                  onClick={() => deleteSearch(search.id)}
                  className="p-2 text-ink-muted hover:text-rose-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
