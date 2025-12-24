/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'supabase.co'],
  },
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
