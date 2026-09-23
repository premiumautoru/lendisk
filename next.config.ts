import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 85],
    localPatterns: [
      { pathname: "/catalog/**", search: "" },
      { pathname: "/media/**", search: "" },
      { pathname: "/brand/**", search: "" },
    ],
  },
  experimental: {
    // photo / GLB uploads from the admin panel go through Server Actions
    serverActions: { bodySizeLimit: "45mb" },
  },
  async headers() {
    return [
      {
        source: "/catalog/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
