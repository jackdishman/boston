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
        <main className="flex justify-center w-full scrollable-content min-h-screen">
          <div className="w-full max-w-7xl pt-20">{children}</div>
        </main>
        {/* footer */}
        <footer>
          <div className="flex justify-center items-center w-full h-20 fixed-header">
            <div className="flex justify-between w-full max-w-7xl items-center h-20">
              <p className="text-sm flex items-center">
                Made with <span className="text-2xl mx-1">❤️</span> by{" "}
                <a
                  href="https://jackdishman.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline ml-1"
                >
                  Jack Dishman
                </a>
              </p>
              {/* join farcaster channel */}
              <a
                href="https://warpcast.com/~/channel/boston"
                className="flex items-center"
                target="_blank"
                referrerPolicy="no-referrer"
              >
                <Farcaster />
                <span className="ml-2 text-sm">Boston Channel</span>
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
