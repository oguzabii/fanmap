/** @type {import('next').NextConfig} */

// Basic, low-risk security headers. Intentionally NO Content-Security-Policy so
// inline styles, SVG flags, canvas/blob poster downloads and Web Share keep
// working. Permissions-Policy disables features the app never uses (camera,
// mic, geolocation, topics) but leaves sharing/clipboard alone.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  }
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
