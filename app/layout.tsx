import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "macrostatus — Regime Monitor",
  description:
    "A live macro/market regime monitor for equity risk — the kind of glanceable read a capital-markets risk desk keeps open.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="font-semibold tracking-tight">
              macrostatus
            </Link>
            <nav className="flex gap-5 text-sm">
              <Link href="/architecture" className="text-muted-foreground hover:text-foreground">
                Architecture
              </Link>
              <Link href="/roadmap" className="text-muted-foreground hover:text-foreground">
                Roadmap
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
