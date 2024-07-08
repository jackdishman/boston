import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Farcaster from "./components/icons/Farcaster";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Boston Farcaster Channel",
  description: "Made with <3 by Jack Dishman",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* background */}
        <div className="fixed top-0 right-0 min-h-screen -z-10">
          <img
            src="/boston.png"
            alt="Boston 🦞 FC"
            className="w-full min-h-screen object-cover"
          />
        </div>
        <header className="flex justify-center items-center w-full fixed z-20 fixed-header">
          <nav className="flex justify-between w-full max-w-7xl items-center h-20">
            <Link
              href="/"
              className="text-4xl font-bold font-serif rounded-lg px-4 py-2"
            >
              Boston 🦞 FC
            </Link>
            <Link href="/members">Members</Link>
            <Link href="/events">Events</Link>
            <Link href="/casts">Casts</Link>
            <div>
              <a href="https://warpcast.com/~/channel/boston">
                <Farcaster />
              </a>
            </div>
          </nav>
        </header>
        <main className="flex justify-center w-full scrollable-content">
          <div className="w-full max-w-7xl pt-20">{children}</div>
        </main>
      </body>
    </html>
  );
}
