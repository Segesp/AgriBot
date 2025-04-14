import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Deshabilitar verificación de ESLint durante el build
    ignoreDuringBuilds: true,
  },
  
  // Ignorar errores de TypeScript en compilación
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuración para optimización de producción
  productionBrowserSourceMaps: false,
  
  // Configuración para módulos externos
  webpack: (config, { isServer }) => {
    // Resolver problemas con módulos específicos
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
