import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  experimental: {
    reactCompiler: true,
  },
  cacheHandler: process.env.VERCEL ? undefined : require.resolve("./cache-handler.mjs"),
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
