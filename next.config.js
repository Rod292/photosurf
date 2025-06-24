/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "files.stripe.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "arodestudio.com",
          },
        ],
        destination: "https://www.arodestudio.com/:path*",
        permanent: true,
        missing: [
          {
            type: "header",
            key: "x-forwarded-proto",
            value: "https",
          },
        ],
      },
    ]
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  poweredByHeader: false,
}

module.exports = nextConfig

