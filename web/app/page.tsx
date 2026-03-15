import Link from "next/link";
import { ArrowRight, Globe, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden p-8 md:p-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,var(--accent-glow),transparent_60%)]" />
      
      <section className="relative z-10 max-w-3xl text-center">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">
          <Shield size={12} />
          Enterprise-Grade Infrastructure
        </div>
        
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
          The Next Generation of <br />
          <span className="bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">Multi-Tenant Booking</span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink-muted">
          A seamless, high-performance platform for managing global listings and residential reservations with real-time sync.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link 
            href="/search" 
            className="group flex items-center gap-2 rounded-2xl bg-accent px-8 py-4 text-sm font-bold text-canvas transition-all hover:scale-105 active:scale-95"
          >
            Start Exploring
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link 
            href="/vendor" 
            className="flex items-center gap-2 rounded-2xl border border-border bg-surface-mid/50 px-8 py-4 text-sm font-bold backdrop-blur-sm transition-all hover:bg-surface-mid"
          >
            Vendor Portal
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-8 opacity-50">
          {[
            { label: "10ms", sub: "Latency" },
            { label: "100%", sub: "Uptime" },
            { label: "256-bit", sub: "Security" }
          ].map((stat) => (
            <div key={stat.sub} className="text-center">
              <div className="font-display text-xl font-bold">{stat.label}</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-muted">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

