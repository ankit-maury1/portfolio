/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
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
      };
      
      // Explicitly ignore MongoDB on the client-side
      config.module.rules.push({
        test: /mongodb|mongodb-client-encryption/,
        use: 'null-loader',
      });
    }
    
    return config;
  },
};

export default nextConfig;
