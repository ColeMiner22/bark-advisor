/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AMAZON_AFFILIATE_TAG: process.env.AMAZON_AFFILIATE_TAG
  },
  poweredByHeader: false,
  generateEtags: false,
  distDir: '.next',
  cleanDistDir: true
}

module.exports = nextConfig 