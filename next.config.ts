import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@iconify/react', '@iconify-icons/cib'],
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
