import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "BookCore - Enterprise Booking Platform",
  description: "Multi-tenant travel and experience booking platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>
          {children}
          <Footer />
        </AppShell>
      </body>
    </html>
  );
}
