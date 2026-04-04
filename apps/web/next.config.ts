import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API proxying to NestJS backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/:path*",
      },
    ];
  },
};

export default nextConfig;
