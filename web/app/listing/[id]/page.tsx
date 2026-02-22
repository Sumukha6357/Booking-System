"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BookingTimer } from "@/components/booking-timer";
import { apiFetch } from "@/lib/api";

type HoldResponse = {
  bookingId: string;
  holdExpiresAt: string;
  quotedPrice: number;
  state: string;
};

export default function ListingPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const checkIn = searchParams.get("checkIn") ?? "2026-03-01";
  const checkOut = searchParams.get("checkOut") ?? "2026-03-04";
  const [hold, setHold] = useState<HoldResponse | null>(null);

  async function holdBooking() {
    const response = await apiFetch<HoldResponse>("/api/bookings/hold", {
      method: "POST",
      body: JSON.stringify({ listingId: params.id, checkIn, checkOut })
    });
    setHold(response);
    localStorage.setItem("activeBookingId", response.bookingId);
  }

  return (
    <main className="p-8 md:p-10">
      <section className="card p-8 stagger-in">
        <h1 className="text-3xl font-semibold">Listing {params.id.slice(0, 8)}</h1>
        <p className="mt-2 text-slate-300">Availability checked for {checkIn} to {checkOut}</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <button onClick={holdBooking} className="rounded-xl bg-accent px-5 py-3 font-semibold text-slate-900">Hold for 10 min</button>
          {hold && <Link href={`/booking/${hold.bookingId}/payment`} className="rounded-xl border border-border px-5 py-3">Go to Payment</Link>}
        </div>
        {hold && (
          <div className="mt-6 space-y-3">
            <BookingTimer expiresAt={hold.holdExpiresAt} />
            <p>Quoted Price: ${hold.quotedPrice}</p>
          </div>
        )}
      </section>
    </main>
  );
}
