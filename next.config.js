/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config, options) => {
    config.experiments.asyncWebAssembly = true
    return config
  }
}

module.exports = nextConfig
