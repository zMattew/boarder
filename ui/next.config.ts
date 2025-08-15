import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  experimental: {
    reactCompiler: true,
    nodeMiddleware: true
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
