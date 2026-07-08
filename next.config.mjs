/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ponytail: allow remote hero/barber photos; tighten allowlist when real CDN is known
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // Hostinger's standalone output has no `sharp` binary and the shared host's
    // thread/process limit is tight — skip Next's image optimizer instead of adding it.
    unoptimized: true,
  },
};

export default nextConfig;
