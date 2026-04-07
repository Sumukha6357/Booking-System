import Link from "next/link";
import { ArrowRight, Globe, Shield, Building2, Trees, Waves, Palmtree, Castle, Warehouse, Home } from "lucide-react";

const categories = [
  { icon: Building2, label: "Apartments", count: "12.4k" },
  { icon: Waves, label: "Beachfront", count: "8.2k" },
  { icon: Trees, label: "Cabins", count: "5.1k" },
  { icon: Castle, label: "Historic", count: "2.3k" },
  { icon: Palmtree, label: "Tropical", count: "4.7k" },
  { icon: Warehouse, label: "Urban", count: "9.8k" },
];

export default function HomePage() {
  return (
    <main className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden p-8 md:p-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,var(--accent-glow),transparent_60%)]" />
      
      <section className="relative z-10 max-w-5xl text-center">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">
          <Shield size={12} />
          Enterprise-Grade Infrastructure
        </div>
        
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
          Find your perfect <br />
          <span className="bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">place to stay</span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink-muted">
          Explore thousands of unique homes and experiences around the world.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link 
            href="/search" 
            className="group flex items-center gap-2 rounded-2xl bg-accent px-8 py-4 text-sm font-bold text-canvas transition-all hover:scale-105 active:scale-95"
          >
            Start exploring
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link 
            href="/vendor" 
            className="flex items-center gap-2 rounded-2xl border border-border bg-surface-mid/50 px-8 py-4 text-sm font-bold backdrop-blur-sm transition-all hover:bg-surface-mid"
          >
            List your property
          </Link>
        </div>
      </section>

      <section className="relative z-10 mt-16 w-full max-w-4xl">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href={`/search?q=${cat.label.toLowerCase()}`}
                className="group flex min-w-[140px] flex-col items-center gap-3 rounded-2xl border border-border bg-surface-low/50 p-5 transition-all hover:border-accent/30 hover:bg-surface-mid/50"
              >
                <div className="rounded-xl bg-surface-mid p-3 text-ink-muted transition-colors group-hover:bg-accent/10 group-hover:text-accent">
                  <Icon size={24} />
                </div>
                <div className="text-sm font-medium">{cat.label}</div>
                <div className="text-xs text-ink-muted">{cat.count} stays</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mt-16 grid w-full max-w-3xl grid-cols-3 gap-8 border-t border-border pt-8 opacity-50">
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
      </section>
    </main>
  );
}

