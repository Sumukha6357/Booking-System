"use client";

import { useState } from "react";
import { InvoiceDetail } from "@/lib/api";
import { FileText, Printer, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  invoice: InvoiceDetail;
};

export function InvoicePanel({ invoice }: Props) {
  const [expanded, setExpanded] = useState(false);

  const isPaid = invoice.status === "CAPTURED" || invoice.status === "PAID";

  function print() {
    window.print();
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-low overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex w-full items-center justify-between p-5 hover:bg-surface-mid/30 transition-colors"
        aria-expanded={expanded ? "true" : "false"}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "rounded-xl p-2.5",
            isPaid ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"
          )}>
            <FileText size={18} />
          </div>
          <div className="text-left">
            <div className="font-semibold">{invoice.listingTitle}</div>
            <div className="text-xs text-ink-muted mt-0.5">
              Invoice · {isPaid ? "Paid" : "Pending Payment"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-bold text-accent">${invoice.total.toFixed(2)}</span>
          <span className={cn(
            "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase",
            isPaid
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
              : "border-amber-400/20 bg-amber-400/10 text-amber-400"
          )}>
            {isPaid ? <CheckCircle2 size={10} /> : <Clock size={10} />}
            {invoice.status}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-5 space-y-5 print:bg-white print:text-black">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-ink-muted font-mono">
                  Booking Ref: <span className="font-bold text-ink">{invoice.bookingId.slice(0, 13).toUpperCase()}</span>
                </div>
                {invoice.paymentId && (
                  <div className="text-xs text-ink-muted font-mono">
                    Payment ID: <span className="text-ink">{invoice.paymentId.slice(0, 8)}</span>
                  </div>
                )}
              </div>

              {/* Line items */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-ink-muted border-b border-border">
                    <th className="pb-2 text-left">Description</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="py-3">
                      <div className="font-medium">{invoice.listingTitle}</div>
                      <div className="text-xs text-ink-muted mt-0.5">
                        {new Date(invoice.checkIn).toLocaleDateString()} → {new Date(invoice.checkOut).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 text-right font-medium">${invoice.subtotal.toFixed(2)}</td>
                  </tr>
                  {invoice.discount > 0 && (
                    <tr>
                      <td className="py-3 text-emerald-400">Discount Applied</td>
                      <td className="py-3 text-right text-emerald-400 font-medium">−${invoice.discount.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border">
                    <td className="pt-4 font-bold text-base">Total Due</td>
                    <td className="pt-4 text-right font-display text-xl font-bold text-accent">${invoice.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="text-xs text-ink-muted">
                  {invoice.paidAt
                    ? `Paid on ${new Date(invoice.paidAt).toLocaleString()}`
                    : "Payment pending"}
                </div>
                <button
                  onClick={print}
                  className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs font-bold text-ink-muted transition-all hover:border-accent/30 hover:text-accent"
                >
                  <Printer size={13} />
                  Print Invoice
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
