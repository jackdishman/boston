/** @type {import('next').NextConfig} */
const nextConfig = {
  // add dotenv keys
  env: {
    NEYNAR_API_KEY: process.env.NEYNAR_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PRIVY_APP_ID: process.env.PRIVY_APP_ID,
    PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET,
    NEXT_PUBLIC_HOST: process.env.NEXT_PUBLIC_HOST,
    HUB_URL: process.env.HUB_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
