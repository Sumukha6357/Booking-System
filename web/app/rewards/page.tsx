"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Gift, Star, Award, TrendingUp, CreditCard, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type LoyaltyPoints = {
  totalPoints: number;
  lifetimePoints: number;
  tier: string;
  lastEarnedAt: string;
};

const tierInfo: Record<string, { color: string; multiplier: string; min: number }> = {
  BRONZE: { color: "text-amber-600 bg-amber-600/10", multiplier: "1x", min: 0 },
  SILVER: { color: "text-gray-400 bg-gray-400/10", multiplier: "1.25x", min: 5000 },
  GOLD: { color: "text-yellow-400 bg-yellow-400/10", multiplier: "1.5x", min: 15000 },
  PLATINUM: { color: "text-purple-400 bg-purple-400/10", multiplier: "2x", min: 50000 }
};

export default function LoyaltyPage() {
  const [points, setPoints] = useState<LoyaltyPoints | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<LoyaltyPoints>("/api/loyalty/points");
        setPoints(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  const currentTier = points?.tier || "BRONZE";
  const info = tierInfo[currentTier];
  const nextTier = currentTier === "BRONZE" ? "SILVER" : currentTier === "SILVER" ? "GOLD" : currentTier === "GOLD" ? "PLATINUM" : null;
  const nextInfo = nextTier ? tierInfo[nextTier] : null;
  const pointsToNext = nextInfo ? nextInfo.min - (points?.lifetimePoints || 0) : 0;
  const progress = nextInfo ? ((points?.lifetimePoints || 0) - info.min) / (nextInfo.min - info.min) * 100 : 100;

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-8 md:p-10">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
          <Award className="text-accent" size={28} />
          Rewards Program
        </h1>
        <p className="text-ink-muted mt-1">Earn points with every booking and unlock exclusive perks.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-surface-low p-6"
        >
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Current Tier</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${info.color}`}>
              {currentTier}
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold">{points?.totalPoints || 0}</span>
            <span className="text-ink-muted">points</span>
          </div>
          <div className="mt-2 text-sm text-ink-muted">
            {points?.lifetimePoints || 0} lifetime points earned
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-surface-low p-6"
        >
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Earning Rate</span>
            <Star className="text-accent" size={18} />
          </div>
          <div className="mt-4">
            <span className="font-display text-4xl font-bold">{info.multiplier}</span>
            <span className="text-ink-muted ml-2">points per $1</span>
          </div>
          <div className="mt-2 text-sm text-ink-muted">
            Current tier bonus
          </div>
        </motion.div>
      </div>

      {nextInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-surface-low p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Progress to {nextTier}</span>
            <span className="text-sm text-ink-muted">{Math.max(0, pointsToNext)} points to go</span>
          </div>
          <div className="h-3 rounded-full bg-surface-mid overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              className="h-full bg-gradient-to-r from-accent to-blue-400"
            />
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Star size={14} className={tierInfo.BRONZE.color.split(" ")[0]} />
              <span>BRONZE</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={14} className={tierInfo.SILVER.color.split(" ")[0]} />
              <span>SILVER</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={14} className={tierInfo.GOLD.color.split(" ")[0]} />
              <span>GOLD</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={14} className={tierInfo.PLATINUM.color.split(" ")[0]} />
              <span>PLATINUM</span>
            </div>
          </div>
        </motion.div>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">How to Earn</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-low p-4">
            <TrendingUp size={20} className="text-accent mb-2" />
            <div className="font-medium">Book a Stay</div>
            <div className="text-sm text-ink-muted">Earn 10 points per $1 spent</div>
          </div>
          <div className="rounded-xl border border-border bg-surface-low p-4">
            <Star size={20} className="text-accent mb-2" />
            <div className="font-medium">Write a Review</div>
            <div className="text-sm text-ink-muted">Earn 100 points per review</div>
          </div>
          <div className="rounded-xl border border-border bg-surface-low p-4">
            <Gift size={20} className="text-accent mb-2" />
            <div className="font-medium">Refer a Friend</div>
            <div className="text-sm text-ink-muted">Earn 500 points per referral</div>
          </div>
          <div className="rounded-xl border border-border bg-surface-low p-4">
            <CreditCard size={20} className="text-accent mb-2" />
            <div className="font-medium">Gift Card Purchase</div>
            <div className="text-sm text-ink-muted">Earn 1 point per $1 gifted</div>
          </div>
        </div>
      </section>
    </main>
  );
}
