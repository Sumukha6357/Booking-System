"use client";

import { useEffect, useState } from "react";
import { apiFetch, bookingsApi, BookingFull } from "@/lib/api";
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type VendorCalendarProps = {
  listings: { id: string; title: string }[];
  bookings: BookingFull[];
};

export function VendorCalendar({ listings, bookings }: VendorCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const getBookingForDay = (day: number) => {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];
    
    let listingBookings = bookings;
    if (selectedListing) {
      listingBookings = bookings.filter(b => b.listingId === selectedListing);
    }

    return listingBookings.find(b => {
      const checkIn = b.checkIn.split("T")[0];
      const checkOut = b.checkOut.split("T")[0];
      return dateStr >= checkIn && dateStr < checkOut;
    });
  };

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-2xl border border-border bg-surface-low p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
          <Calendar size={18} className="text-accent" />
          Availability Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-border hover:border-accent/30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium min-w-[140px] text-center">{monthName}</span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-border hover:border-accent/30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {listings.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedListing || ""}
            onChange={e => setSelectedListing(e.target.value || null)}
            className="w-full rounded-xl border border-border bg-surface-mid p-2 text-sm"
          >
            <option value="">All Listings</option>
            {listings.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-[10px] font-bold uppercase text-ink-muted py-2">
            {d}
          </div>
        ))}

        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const booking = getBookingForDay(day);
          const dateStr = new Date(year, month, day).toISOString().split("T")[0];
          const isToday = dateStr === today;

          return (
            <div
              key={day}
              className={cn(
                "aspect-square flex flex-col items-center justify-center text-xs rounded-lg border transition-all",
                booking 
                  ? booking.state === "CONFIRMED" 
                    ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
                    : booking.state === "HELD"
                      ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                      : booking.state === "COMPLETED"
                        ? "bg-blue-400/10 border-blue-400/30 text-blue-400"
                        : "bg-rose-400/10 border-rose-400/30 text-rose-400"
                  : "border-border text-ink-muted hover:border-accent/30",
                isToday && "ring-2 ring-accent"
              )}
            >
              <span className="font-medium">{day}</span>
              {booking && (
                <span className="text-[8px] truncate max-w-full px-0.5">
                  {booking.state.slice(0, 3)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-400/20 border border-amber-400/30" />
          <span className="text-ink-muted">Held</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-400/20 border border-emerald-400/30" />
          <span className="text-ink-muted">Confirmed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-400/20 border border-blue-400/30" />
          <span className="text-ink-muted">Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-rose-400/20 border border-rose-400/30" />
          <span className="text-ink-muted">Cancelled</span>
        </div>
      </div>
    </div>
  );
}
