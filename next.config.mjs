/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: '/offline.html', destination: '/offline', permanent: true }];
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
      {
        source: '/pdfs/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store',
          },
        ],
      },
      // Content-versioned links change whenever a local PDF is replaced.
      // Keep unversioned links revalidating, but reuse versioned downloads.
      {
        source: '/pdfs/:path*',
        has: [{ type: 'query', key: 'v', value: '[a-f0-9]{20}' }],
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
          { key: 'CDN-Cache-Control', value: 'public, s-maxage=86400' },
          { key: 'Vercel-CDN-Cache-Control', value: 'public, s-maxage=86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
