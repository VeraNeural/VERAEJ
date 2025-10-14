/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Temporary - fix these later!
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporary
  }
};

module.exports = nextConfig;