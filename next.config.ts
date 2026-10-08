import type { NextConfig } from 'next';

const requested = process.env.CSS_CHUNKING;
const cssChunking = requested === 'strict' || requested === 'loose' ? requested : 'loose';

const nextConfig: NextConfig = {
  experimental: {
    cssChunking
  }
};

export default nextConfig;
