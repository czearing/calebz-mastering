import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Pages has no Node image optimizer, so serve images as-is.
    // next/image still sets explicit width and height to reserve space and
    // prevent layout shift; we just skip the on-demand optimization endpoint.
    unoptimized: true,
  },
};

export default nextConfig;
