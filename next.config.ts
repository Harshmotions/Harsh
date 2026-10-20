import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Work and showreel posters on Cloudflare R2 (lib/work.ts)
      {
        protocol: 'https',
        hostname: 'media.motionbyharsh.com',
        pathname: '/**',
      },
    ],
  },
  // Reels and landscape became one /work page
  async redirects() {
    return [
      { source: '/reels', destination: '/work', permanent: true },
      { source: '/landscape', destination: '/work', permanent: true },
    ];
  },
};

export default nextConfig;
