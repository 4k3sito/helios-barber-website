/** @type {import('next').NextConfig} */
const nextConfig = {
  // www y sin-www servían el mismo HTML con 200: contenido duplicado. El canonical ya apunta a
  // sin-www, pero un 301 es más limpio para Google y evita enlaces repartidos entre dos hosts.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.heliosbarber.com" }],
        destination: "https://heliosbarber.com/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    // ponytail: allow remote hero/barber photos; tighten allowlist when real CDN is known
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // Hostinger's standalone output has no `sharp` binary and the shared host's
    // thread/process limit is tight — skip Next's image optimizer instead of adding it.
    unoptimized: true,
  },
};

export default nextConfig;
