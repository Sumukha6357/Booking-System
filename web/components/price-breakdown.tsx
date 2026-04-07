"use client";

import { PriceQuote } from "@/lib/api";
import { TrendingUp, Sun, Calendar, Zap, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  quote: PriceQuote;
};

export function PriceBreakdown({ quote }: Props) {
  const surcharges = [
    {
      label: "Weekend Premium",
      active: quote.weekendSurcharge,
      value: "+15%",
      icon: Calendar,
      description: "Applies when stay includes Sat or Sun"
    },
    {
      label: "Seasonal High Demand",
      active: quote.seasonalSurcharge,
      value: "+20%",
      icon: Sun,
      description: "Jun, Jul, Dec are peak season"
    },
    {
      label: "Demand Surge",
      active: quote.demandSurcharge,
      value: "Variable",
      icon: TrendingUp,
      description: "Based on recent booking volume"
    }
  ];

  const totalSurchargePercent = ((quote.multiplierTotal - 1) * 100).toFixed(0);
  const hasSurcharge = quote.multiplierTotal > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-surface-mid/40 p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-accent" />
        <span className="text-xs font-bold uppercase tracking-wider text-accent">Live Price Breakdown</span>
      </div>

      {/* Base Calculation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">${quote.basePricePerNight} × {quote.nights} night{quote.nights !== 1 ? "s" : ""}</span>
          <span className="font-medium">${quote.subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Surcharges */}
      <div className="space-y-2 border-t border-border pt-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Dynamic Pricing Factors</span>
        {surcharges.map(s => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full",
                s.active ? "bg-accent/20" : "bg-border/50"
              )}>
                {s.active
                  ? <Check size={11} className="text-accent" />
                  : <X size={11} className="text-ink-muted" />}
              </div>
              <div>
                <div className={cn("text-xs font-medium", s.active ? "text-ink" : "text-ink-muted line-through")}>
                  {s.label}
                </div>
              </div>
            </div>
            <span className={cn("text-xs font-bold", s.active ? "text-accent" : "text-ink-muted")}>
              {s.active ? s.value : "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-border pt-3 space-y-2">
        {hasSurcharge && (
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Combined multiplier</span>
            <span className="font-mono font-bold text-amber-400">×{quote.multiplierTotal.toFixed(2)} (+{totalSurchargePercent}%)</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">Estimated Total</span>
          <span className="font-display text-xl font-bold text-accent">${quote.finalPrice.toFixed(2)}</span>
        </div>
        {hasSurcharge && (
          <div className="text-[10px] text-ink-muted">
            You save ${(quote.finalPrice - quote.subtotal).toFixed(2) === "0.00" ? "nothing" : ""}
            {quote.finalPrice > quote.subtotal
              ? `Pricing adjusted +${totalSurchargePercent}% from base`
              : ""}
          </div>
        )}
      </div>
    </motion.div>
  );
}
