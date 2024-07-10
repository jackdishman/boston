import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/privy";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Farcaster Channel",
  description:
    "Browse channel members, view channel stats, and view recent casts!",
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
          <div className="fixed top-0 right-0 min-h-screen -z-10">
            <img
              src="/sand.jpg"
              alt="background image of sand dunes"
              className="w-full min-h-screen object-cover"
            />
          </div>
          <main className="flex justify-center w-full scrollable-content min-h-screen z-0">
            <div className="w-full max-w-7xl pt-20">{children}</div>
          </main>
          {/* footer */}
          <footer>
            <div className="flex justify-center items-center w-full h-20 bg-gray-100 mt-10">
              <div className="flex flex-col sm:flex-row justify-center w-full max-w-7xl items-center h-10 pb-2 sm:pb-0">
                <p className="text-sm flex items-center">
                  Made with <span className="text-2xl mx-1">❤️</span> by{" "}
                  <a
                    href="https://warpcast.com/dish"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline ml-1"
                  >
                    Jack Dishman
                  </a>
                </p>
                {/* <p className="text-sm">
                  msg{" "}
                  <a
                    href="https://warpcast.com/dish"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline ml-1"
                  >
                    @dish
                  </a>{" "}
                  to sponsor or collab
                </p> */}
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
