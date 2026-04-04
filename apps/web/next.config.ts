import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API proxying to NestJS backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/:path*",
      },
    ];
  },
};

export default nextConfig;
