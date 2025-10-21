import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  // Configuración para Hostinger con Node.js
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Variables para producción en Hostinger
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default withNextIntl(nextConfig);
