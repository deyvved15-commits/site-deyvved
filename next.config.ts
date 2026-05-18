import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/apresentacao",
        destination: "/apresentacao.html",
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [48, 96, 128, 256],
  },
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
    staleTimes: {
      dynamic: 0,
      static: 180,
    },
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  automaticVercelMonitors: false,
});
