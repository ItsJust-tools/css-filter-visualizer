import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@itsjust/core'],
  poweredByHeader: false,
  devIndicators: false,
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

  // Uncomment for static export (e.g. GitHub Pages, Cloudflare Pages):
  // output: 'export',
  // images: { unoptimized: true },

  // Sensible security headers for production
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self'";
    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self'",
      "img-src 'self' blob: data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ');
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;