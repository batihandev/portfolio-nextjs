import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
  redirects: async () => [{ source: "/terms", destination: "/privacy", permanent: true }],
};

export default nextConfig;
