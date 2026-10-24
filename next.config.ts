import type { NextConfig } from "next";

// No full Content-Security-Policy: a nonce-based one would make every page dynamic, which rules out ISR.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  redirects: async () => [{ source: "/terms", destination: "/privacy", permanent: true }],
};

export default nextConfig;
