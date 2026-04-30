/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Ignorar quejas de estilo (ESLint)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 2. Ignorar quejas de tipos (TypeScript)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;