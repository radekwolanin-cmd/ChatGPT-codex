import type { Metadata } from "next";
import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SessionProvider } from "@/components/layout/session-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "Project Tracker",
  description: "Track projects, estimates, orders, and more",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable}`}> 
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950 text-slate-50">
        <SessionProvider>
          <ThemeProvider>
            <div className="relative min-h-screen">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-glow-gradient opacity-60" />
              <main className="relative z-10 min-h-screen">{children}</main>
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
