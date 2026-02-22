"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

type PaymentResult = {
  paymentId: string;
  amount: number;
  status: string;
};

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const [result, setResult] = useState<PaymentResult | null>(null);

  async function payNow() {
    const idempotencyKey = crypto.randomUUID();
    const response = await apiFetch<PaymentResult>(`/api/payments/bookings/${params.id}/confirm`, {
      method: "POST",
      body: JSON.stringify({ idempotencyKey })
    });
    setResult(response);
  }

  return (
    <main className="p-8 md:p-10">
      <section className="card p-8 stagger-in">
        <h1 className="text-2xl font-semibold">Payment</h1>
        <p className="mt-2 text-slate-300">Confirm held booking with idempotent payment request.</p>
        <button onClick={payNow} className="mt-6 rounded-xl bg-accent px-5 py-3 font-semibold text-slate-900">Pay & Confirm</button>
        {result && (
          <div className="mt-6 rounded-xl border border-border p-4">
            <p>Payment ID: {result.paymentId}</p>
            <p>Status: {result.status}</p>
            <p>Amount: ${result.amount}</p>
            <Link className="mt-3 inline-block rounded-xl border border-border px-4 py-2" href={`/booking/${params.id}/confirmation`}>Go to Confirmation</Link>
          </div>
        )}
      </section>
    </main>
  );
}
