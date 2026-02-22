import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-8 md:p-10">
      <section className="card p-8 stagger-in">
        <h1 className="text-3xl font-semibold">Multi-Tenant Booking Platform</h1>
        <p className="mt-4 text-slate-300">Use search to start booking, or switch to vendor mode to manage listings and reservations.</p>
        <div className="mt-6 flex gap-4">
          <Link href="/search" className="rounded-xl bg-accent px-5 py-3 font-semibold text-slate-900">Start Booking</Link>
          <Link href="/vendor" className="rounded-xl border border-border px-5 py-3">Vendor Dashboard</Link>
        </div>
      </section>
    </main>
  );
}
