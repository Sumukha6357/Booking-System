"use client";

import { useParams } from "next/navigation";

export default function ConfirmationPage() {
  const params = useParams<{ id: string }>();
  return (
    <main className="p-8 md:p-10">
      <section className="card p-8 stagger-in">
        <h1 className="text-3xl font-semibold">Booking Confirmed</h1>
        <p className="mt-3 text-slate-300">Your reservation {params.id} is confirmed. A real-time notification has been published.</p>
      </section>
    </main>
  );
}
