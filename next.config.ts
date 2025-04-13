import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Deshabilitar verificación de ESLint durante el build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
