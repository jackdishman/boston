import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@coinbase/onchainkit/styles.css';
import Providers from "@/providers/privy";
import OnchainProvider from "@/providers/onchainkit";
import App from "./components/App";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Farcaster Toolbelt",
  description:
    "Browse channel stats, advanced profile search, install Cast Actions, and frames!",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100`}>
        <OnchainProvider>
          <Providers>
            <App>
              <main className="flex flex-col items-center w-full min-h-screen z-0 pt-20">
                <div className="w-full max-w-7xl">{children}</div>
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
                  </div>
                </div>
              </footer>
            </App>
          </Providers>
        </OnchainProvider>
      </body>
    </html>
  );
}
