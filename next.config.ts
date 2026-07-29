import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@iconify/react', '@iconify-icons/cib'],
  reactCompiler: true,
  reactStrictMode: true,
  // Add the following to fix the error with styled-jsx in Turbopack
  turbopack: {
    resolveAlias: {
      // This is the specific alias needed to resolve the issue.
      'styled-jsx/style': 'styled-jsx/style.js',
    },
  },
};

export default nextConfig;
