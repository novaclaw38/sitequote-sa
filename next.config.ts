import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  allowedDevOrigins: ["localhost", "127.0.0.1", "10.0.0.206"],
};

export default nextConfig;
