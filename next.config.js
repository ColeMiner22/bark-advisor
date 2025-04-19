/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AMAZON_AFFILIATE_TAG: process.env.AMAZON_AFFILIATE_TAG
  },
  // Ensure proper handling of the app directory
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig 