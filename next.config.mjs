/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ponytail: allow remote hero/barber photos; tighten allowlist when real CDN is known
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
