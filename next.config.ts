// @ts-ignore
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  experimental: {
    // Enable server actions
    serverActions: true,
  },
  
  // Add webpack configuration to handle specific modules in the browser
  webpack: (config, { isServer }) => {
    // If client-side bundle
    if (!isServer) {
      // Make Node.js server-only modules empty objects
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        'mongodb-client-encryption': false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        util: require.resolve('util'),
        assert: require.resolve('assert'),
      };
      
      // Explicitly ignore MongoDB on the client-side
      config.module.rules.push({
        test: /mongodb|mongodb-client-encryption/,
        use: 'null-loader',
      });
      
      // Add polyfills
      config.plugins.push(
        new config.webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }
    
    return config;
  },
};

module.exports = nextConfig;
