"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type BookedRange = {
  from: string;
  to: string;
};

type Props = {
  listingId: string;
};

export function AvailabilityCalendar({ listingId }: Props) {
  const [bookedDates, setBookedDates] = useState<BookedRange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await apiFetch<BookedRange[]>(`/api/listings/${listingId}/booked-dates`);
        setBookedDates(data || []);
      } catch (err) {
        console.error("Failed to load availability:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [listingId]);

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  }

  function isBooked(day: number, monthDate: Date) {
    const check = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    check.setHours(0, 0, 0, 0);
    return bookedDates.some(range => {
      const from = new Date(range.from);
      const to = new Date(range.to);
      from.setHours(0, 0, 0, 0);
      to.setHours(0, 0, 0, 0);
      return check >= from && check <= to;
    });
  }

  const { days, firstDay } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));

  return (
    <article className="rounded-2xl border border-border bg-surface-low p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
          <CalendarIcon size={18} className="text-accent" />
          Availability Calendar
        </h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={prevMonth} 
            title="Previous Month"
            className="p-2 rounded-lg hover:bg-surface-mid transition-colors text-ink-muted"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={nextMonth} 
            title="Next Month"
            className="p-2 rounded-lg hover:bg-surface-mid transition-colors text-ink-muted"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4 text-center">
        <div className="text-sm font-bold tracking-tight">{monthName}</div>
        
        <div className="grid grid-cols-7 gap-1">
          {["S", "M", "T", "W", "T", "F", "S"].map(d => (
            <div key={d} className="py-2 text-[10px] font-bold text-ink-muted uppercase">{d}</div>
          ))}
          
          {isLoading ? (
            <div className="col-span-7 py-12 flex justify-center">
              <Loader2 size={24} className="animate-spin text-accent/30" />
            </div>
          ) : (
            <>
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="p-3" />
              ))}
              {Array.from({ length: days }).map((_, i) => {
                const day = i + 1;
                const booked = isBooked(day, currentMonth);
                const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                
                return (
                  <div 
                    key={day}
                    className={cn(
                      "relative flex h-10 w-full items-center justify-center rounded-lg text-xs font-medium transition-all",
                      booked 
                        ? "bg-rose-400/10 text-rose-400 line-through cursor-not-allowed" 
                        : "text-ink hover:bg-accent/10 hover:text-accent cursor-default",
                      isToday && !booked && "border border-accent ring-2 ring-accent/10"
                    )}
                  >
                    {day}
                    {booked && (
                      <div className="absolute bottom-1 h-1 w-1 rounded-full bg-rose-400/40" />
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
         <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent/20 border border-accent/30" />
            <span className="text-[10px] uppercase font-bold text-ink-muted">Available</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-rose-400/20 border border-rose-400/30" />
            <span className="text-[10px] uppercase font-bold text-ink-muted">Booked</span>
         </div>
      </div>
    </article>
  );
}
