
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        buffer: false,
        events: false,
      };
    }

    // Exclude SSH2 and cpu-features from client bundle
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'ssh2': 'commonjs2 ssh2',
        'cpu-features': 'commonjs2 cpu-features',
        'ssh2-streams': 'commonjs2 ssh2-streams',
        'ssh2-sftp-client': 'commonjs2 ssh2-sftp-client'
      });
    }

    return config;
  },
  // Di chuyển từ experimental.serverComponentsExternalPackages sang serverExternalPackages
  serverExternalPackages: ['ssh2', 'cpu-features']
};

module.exports = nextConfig;