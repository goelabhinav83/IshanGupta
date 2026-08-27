import type { NextConfig } from "next";

// Security headers. A Content-Security-Policy is deliberately NOT set here:
// the page embeds a Google Maps iframe and loads Google Fonts, so a CSP needs
// frame-src/font-src/style-src allowances that are easy to get subtly wrong and
// would break the map silently. Worth adding, but as its own change with a
// browser check. X-Frame-Options below governs this site being framed by
// others; it does not affect the Maps iframe embedded in the page.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
