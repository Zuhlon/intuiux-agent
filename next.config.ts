import type { NextConfig } from "next";

// v3.2: Force recompilation after fixing regex patterns
const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
