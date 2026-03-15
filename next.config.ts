import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // In production, static assets are served from CloudFront.
  // Set NEXT_PUBLIC_ASSET_PREFIX to your CloudFront distribution URL (e.g. https://d1234.cloudfront.net)
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
}

export default nextConfig
