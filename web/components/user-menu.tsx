"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, CreditCard, LogOut, ChevronDown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  email?: string;
  name?: string;
  role?: string;
};

export function UserMenu({ email = "user@example.com", name = "John Doe", role = "user" }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { icon: User, label: "Profile", href: "#" },
    { icon: CreditCard, label: "Bookings", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
    { icon: Shield, label: "Security", href: "#" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-full border border-border bg-surface-mid/50 px-3 py-2 pr-4 transition-all hover:border-accent/30"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent">
          <User size={16} />
        </div>
        <span className="text-sm font-medium hidden md:inline">{name}</span>
        <ChevronDown size={14} className={cn("text-ink-muted transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-surface-low p-2 shadow-2xl"
          >
            <div className="border-b border-border px-4 py-3">
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-xs text-ink-muted">{email}</div>
              <div className="mt-2 inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                {role}
              </div>
            </div>

            <div className="py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-ink-muted transition-colors hover:bg-surface-mid hover:text-ink"
                  >
                    <Icon size={16} />
                    {item.label}
                  </a>
                );
              })}
            </div>

            <div className="border-t border-border pt-2">
              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-rose-400 transition-colors hover:bg-rose-400/10">
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}