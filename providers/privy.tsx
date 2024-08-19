"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="clx0tnyvg00y3kb5xn4623xe0"
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          logo: `${process.env.NEXT_PUBLIC_HOST}/fc-og.png`,
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
