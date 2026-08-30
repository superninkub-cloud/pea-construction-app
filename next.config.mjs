/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  images: {
    domains: ["*.supabase.co"], // Allow images from supabase storage
  },
};

export default nextConfig;
