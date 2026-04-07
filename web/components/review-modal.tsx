"use client";

import { useState } from "react";
import { reviewsApi } from "@/lib/api";
import { Star, Loader2, Send, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  listingId: string;
  bookingId: string;
  guestName: string;
  onSubmitted: () => void;
};

export function ReviewModal({ listingId, bookingId, guestName, onSubmitted }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (!comment.trim()) { setError("Please write a comment."); return; }
    setIsSubmitting(true);
    setError("");
    try {
      await reviewsApi.submit({ listingId, bookingId, rating, comment: comment.trim(), guestName });
      setIsOpen(false);
      setRating(0);
      setComment("");
      onSubmitted();
    } catch (err: any) {
      setError(err?.message || "Failed to submit review.");
    } finally { setIsSubmitting(false); }
  }

  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        id="write-review-btn"
        className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-bold text-accent transition-all hover:bg-accent/20 hover:scale-[1.02]"
      >
        <MessageSquare size={15} />
        Write a Review
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              className="w-full max-w-md rounded-3xl border border-border bg-surface-low p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold">Share Your Experience</h2>
                  <p className="mt-0.5 text-xs text-ink-muted">Your review helps other guests</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close review modal"
                  className="rounded-xl p-2 text-ink-muted hover:bg-surface-mid hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Star Rating */}
              <div className="text-center space-y-3">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      id={`star-${star}`}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={36}
                        className={cn(
                          "transition-colors",
                          (hoverRating || rating) >= star ? "text-amber-400" : "text-border"
                        )}
                        fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  {(hoverRating || rating) > 0 && (
                    <motion.div
                      key={hoverRating || rating}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-semibold text-amber-400"
                    >
                      {labels[hoverRating || rating]}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Comment */}
              <div className="mt-6">
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Your Review</label>
                <textarea
                  id="review-comment"
                  rows={4}
                  placeholder="Describe your stay. What made it special? Any tips for future guests?"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  maxLength={2000}
                  className="mt-2 w-full resize-none rounded-xl border border-border bg-surface-mid p-4 text-sm leading-relaxed outline-none transition-all focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
                />
                <div className="mt-1 text-right text-[10px] text-ink-muted">{comment.length}/2000</div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-400"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                onClick={submit}
                disabled={isSubmitting}
                id="submit-review-btn"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4 text-sm font-bold text-canvas shadow-lg shadow-accent/10 transition-all hover:scale-[1.02] hover:shadow-accent/20 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Submit Review
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
