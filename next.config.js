/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Fix for WalletConnect / MetaMask SDK warnings
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
    };
    config.externals.push("pino-pretty", "encoding");
    return config;
  },
};

module.exports = nextConfig;
