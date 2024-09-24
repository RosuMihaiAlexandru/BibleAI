import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
      },
    ],
  },
  poweredByHeader: false,
  webpack(config, { isServer }) {
    if (!isServer) {
      // Ensure that all imports of 'yjs' resolve to the same instance
      config.resolve.alias["yjs"] = path.resolve(
        process.cwd(),
        "node_modules/yjs"
      );

      config.node = {
        __dirname: false,
        __filename: false,
      };
    }
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            dimensions: false,
          },
        },
      ],
    });

    return config;
  },
  async redirects() {
    return [
      {
        source: "/bCccDwkKkN",
        destination: "/", // Matched parameters can be used in the destination
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
