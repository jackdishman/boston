import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Farcaster from "./components/icons/Farcaster";
import Providers from "@/providers/privy";
import Header from "./components/Header";

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
        <Providers>
          <div className="z-30">
            <Header />
          </div>
          {/* background */}
          <div className="fixed top-0 right-0 min-h-screen -z-10">
            <img
              src="/boston.png"
              alt="Boston 🦞 FC"
              className="w-full min-h-screen object-cover"
            />
          </div>
          <main className="flex justify-center w-full scrollable-content min-h-screen z-0">
            <div className="w-full max-w-7xl pt-20">{children}</div>
          </main>
          {/* footer */}
          <footer>
            <div className="flex justify-center items-center w-full h-20 bg-gray-100 mt-10">
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
        </Providers>
      </body>
    </html>
  );
}
