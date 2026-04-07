"use client";

import { useEffect, useState } from "react";
import { couponsApi, Coupon } from "@/lib/api";
import { Plus, Tag, Trash2, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const EMPTY_FORM = {
  code: "",
  discountType: "PERCENTAGE" as "PERCENTAGE" | "FLAT",
  discountValue: 10,
  minBookingValue: "",
  maxUses: "",
  expiresAt: ""
};

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setIsLoading(true);
    try {
      const data = await couponsApi.list();
      setCoupons(data || []);
    } catch { /* vendor may not have coupons yet */ }
    finally { setIsLoading(false); }
  }

  async function create() {
    setIsSaving(true);
    try {
      await couponsApi.create({
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: form.discountValue,
        minBookingValue: form.minBookingValue ? Number(form.minBookingValue) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        active: true
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      console.error("Failed to create coupon:", err);
    } finally { setIsSaving(false); }
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      await couponsApi.delete(id);
      setCoupons(c => c.filter(x => x.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeletingId(null); }
  }

  const isExpired = (c: Coupon) => c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
  const isExhausted = (c: Coupon) => c.maxUses != null && c.usedCount >= c.maxUses;

  return (
    <article className="rounded-2xl border border-border bg-surface-low p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <Tag size={18} className="text-accent" />
            Coupon Management
          </h3>
          <p className="mt-0.5 text-xs text-ink-muted">{coupons.length} active promotion{coupons.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all",
            showForm
              ? "border-rose-400/30 bg-rose-400/10 text-rose-400"
              : "border-border bg-surface-mid text-ink-muted hover:border-accent/30 hover:text-accent"
          )}
        >
          <Plus size={14} />
          {showForm ? "Cancel" : "New Coupon"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 overflow-hidden"
          >
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Code</label>
                  <input
                    className="mt-1.5 w-full rounded-lg border border-border bg-surface-mid p-2.5 text-sm font-mono outline-none focus:border-accent/50 uppercase"
                    placeholder="SUMMER20"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Type</label>
                  <select
                    className="mt-1.5 w-full rounded-lg border border-border bg-surface-mid p-2.5 text-sm outline-none focus:border-accent/50"
                    value={form.discountType}
                    onChange={e => setForm({ ...form, discountType: e.target.value as any })}
                    aria-label="Discount type"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount ($)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    {form.discountType === "PERCENTAGE" ? "Discount %" : "Discount $"}
                  </label>
                  <input
                    id="coupon-discount"
                    title="Discount value"
                    type="number"
                    className="mt-1.5 w-full rounded-lg border border-border bg-surface-mid p-2.5 text-sm outline-none focus:border-accent/50"
                    value={form.discountValue}
                    onChange={e => setForm({ ...form, discountValue: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Min Booking ($)</label>
                  <input
                    id="coupon-min-value"
                    title="Minimum booking value"
                    type="number"
                    placeholder="None"
                    className="mt-1.5 w-full rounded-lg border border-border bg-surface-mid p-2.5 text-sm outline-none focus:border-accent/50"
                    value={form.minBookingValue}
                    onChange={e => setForm({ ...form, minBookingValue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Max Uses</label>
                  <input
                    id="coupon-max-uses"
                    title="Maximum uses"
                    type="number"
                    placeholder="Unlimited"
                    className="mt-1.5 w-full rounded-lg border border-border bg-surface-mid p-2.5 text-sm outline-none focus:border-accent/50"
                    value={form.maxUses}
                    onChange={e => setForm({ ...form, maxUses: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Expires At</label>
                <input
                  id="coupon-expiry"
                  title="Expiry date"
                  type="date"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface-mid p-2.5 text-sm outline-none focus:border-accent/50"
                  value={form.expiresAt}
                  onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
              <button
                onClick={create}
                disabled={isSaving || !form.code.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-canvas transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Create Coupon
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-mid" />
          ))
        ) : coupons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-ink-muted">
            No coupons yet. Create your first promotion above.
          </div>
        ) : (
          coupons.map(coupon => {
            const expired = isExpired(coupon);
            const exhausted = isExhausted(coupon);
            const health = expired || exhausted || !coupon.active ? "inactive" : "active";
            return (
              <motion.div
                key={coupon.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-4",
                  health === "active"
                    ? "border-emerald-400/20 bg-emerald-400/5"
                    : "border-border bg-surface-mid/50 opacity-60"
                )}
              >
                <div className="flex items-center gap-3">
                  {health === "active" ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : expired ? (
                    <Clock size={16} className="text-amber-400 shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold tracking-wide">{coupon.code}</span>
                      <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                        {coupon.discountType === "PERCENTAGE"
                          ? `${coupon.discountValue}% OFF`
                          : `$${coupon.discountValue} OFF`}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-ink-muted">
                      Used {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ""} times
                      {coupon.minBookingValue ? ` · Min $${coupon.minBookingValue}` : ""}
                      {expired ? " · EXPIRED" : coupon.expiresAt ? ` · Expires ${new Date(coupon.expiresAt).toLocaleDateString()}` : ""}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => remove(coupon.id)}
                  disabled={deletingId === coupon.id}
                  aria-label={`Delete coupon ${coupon.code}`}
                  className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-rose-400/10 hover:text-rose-400 disabled:opacity-50"
                >
                  {deletingId === coupon.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />}
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </article>
  );
}
