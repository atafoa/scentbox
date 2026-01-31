import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fimgs.net",
        pathname: "/mdimg/**",
      },
    ],
  },
};

export default nextConfig;
