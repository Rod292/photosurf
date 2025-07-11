/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb', // Limite maximum pour photos haute résolution
    },
  },
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
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Désactiver complètement le cache et l'optimisation pour éviter les erreurs Supabase
    minimumCacheTTL: 0,
    unoptimized: true,
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
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  poweredByHeader: false,
}

module.exports = nextConfig

