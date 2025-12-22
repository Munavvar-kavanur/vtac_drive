/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Note: This limit works for self-hosting but Vercel Serverless Functions have a hard 4.5MB limit.
      // Large file uploads (>4.5MB) will fail on Vercel unless using client-side uploads.
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
