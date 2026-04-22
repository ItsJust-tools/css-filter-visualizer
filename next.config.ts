import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@itsjust/core'],
  poweredByHeader: false,
};

export default nextConfig;