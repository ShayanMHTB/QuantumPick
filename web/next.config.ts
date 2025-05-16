/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Updated to match the new port configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/:path*`,
      },
    ];
  },
  // Enable SWC minification - NOTE: This might be deprecated in Next.js 15
  // swcMinify: true, 
  // Configure image domains for external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.example.com',
      },
    ],
  },
  // Remove i18n configuration as it's not supported in App Router
  // Use the app/[locale] pattern instead
  
  // Environment variables that will be available at build time
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.PROJECT_NAME || 'QuantumPick',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_WEB3_PROVIDER_URL: process.env.WEB3_PROVIDER_URL || '',
    NEXT_PUBLIC_SIWE_DOMAIN: process.env.SIWE_DOMAIN || 'quantumpick.example.com',
    JWT_SECRET: process.env.JWT_SECRET || 'quantum-pick-development-secret-key-2025',
  },
  // Add webpack configuration if needed
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix for "Can't resolve 'fs' in NextJS" error when using certain packages
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
