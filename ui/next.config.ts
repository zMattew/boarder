import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  experimental: {
    reactCompiler: true,
  },
  cacheHandler: process.env.VERCEL ? undefined : process.env.NODE_ENV == "production" ?  require.resolve("./cache-handler.mjs") : undefined,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
