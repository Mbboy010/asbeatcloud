/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  env: {
    NEXT_PUBLIC_MAILER_API_URL: process.env.NEXT_PUBLIC_MAILER_API_URL,
  },
};

export default nextConfig;