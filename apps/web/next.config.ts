import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  //eslint-disable-next-line @typescript-eslint/require-await
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ]
  },
}

export default nextConfig
