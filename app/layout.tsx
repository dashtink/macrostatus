import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
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
      className={`dark ${geistSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-mono text-sm">
              <span className="size-2 rounded-sm bg-primary shadow-[0_0_8px_1px] shadow-primary/70" />
              macrostatus
            </Link>
            <nav className="flex gap-5 font-mono text-xs">
              <Link href="/architecture" className="text-muted-foreground hover:text-foreground transition-colors">
                architecture
              </Link>
              <Link href="/roadmap" className="text-muted-foreground hover:text-foreground transition-colors">
                roadmap
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
