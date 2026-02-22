"use client";

import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { apiFetch } from "@/lib/api";

type Booking = {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  state: string;
  price: number;
};

export default function VendorDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [title, setTitle] = useState("Cliffside Villa");

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const tenantId = localStorage.getItem("tenantId");
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
    const data = await apiFetch<Booking[]>("/api/bookings");
    setBookings(data);
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
  }

  return (
    <main className="p-8 md:p-10 space-y-6">
      <section className="card p-6 stagger-in">
        <h2 className="text-2xl font-semibold">Vendor Dashboard</h2>
        <p className="mt-2 text-slate-300">Manage listings, pricing, availability, and booking operations.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="card p-6">
          <h3 className="text-lg font-semibold">Manage Listings</h3>
          <input className="mt-4 w-full rounded-xl border border-border bg-panel p-3" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="mt-4 flex gap-3">
            <button onClick={createListing} className="rounded-xl bg-accent px-4 py-2 font-semibold text-slate-900">Create Listing</button>
            <button className="rounded-xl border border-border px-4 py-2">Pricing Editor</button>
            <button className="rounded-xl border border-border px-4 py-2">Availability Calendar</button>
          </div>
        </article>

        <article className="card p-6">
          <h3 className="text-lg font-semibold">Booking Management</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-300">
                <tr>
                  <th className="px-3 py-2 text-left">Listing</th>
                  <th className="px-3 py-2 text-left">Dates</th>
                  <th className="px-3 py-2 text-left">State</th>
                  <th className="px-3 py-2 text-left">Price</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-border">
                    <td className="px-3 py-2">{b.listingId.slice(0, 8)}</td>
                    <td className="px-3 py-2">{b.checkIn} to {b.checkOut}</td>
                    <td className="px-3 py-2">{b.state}</td>
                    <td className="px-3 py-2">${b.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}
