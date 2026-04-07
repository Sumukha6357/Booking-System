"use client";

import Link from "next/link";
import { ShieldCheck, Github, Twitter, Mail } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Search", href: "/search" },
    { label: "List your property", href: "/vendor" },
    { label: "Pricing", href: "#" },
    { label: "Enterprise", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Press", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Safety", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Trust & Security", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Accessibility", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-low/50">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid gap-8 md:grid-cols-6">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="font-display text-xl font-bold tracking-tight">BookCore</div>
                <p className="text-[10px] uppercase tracking-widest text-ink-muted">Enterprise Suite</p>
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-ink-muted">
              The next-generation multi-tenant booking platform with real-time sync and enterprise-grade security.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="#" className="text-ink-muted transition-colors hover:text-accent">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-ink-muted transition-colors hover:text-accent">
                <Github size={18} />
              </a>
              <a href="#" className="text-ink-muted transition-colors hover:text-accent">
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-ink">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-ink">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-ink">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-ink">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-ink-muted">
            &copy; {new Date().getFullYear()} BookCore. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}