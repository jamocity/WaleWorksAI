import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.180.101.25"],
  poweredByHeader: false,
  images: { remotePatterns: [] },
};

export default nextConfig;
