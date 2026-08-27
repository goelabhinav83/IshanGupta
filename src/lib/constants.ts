export const SITE_NAME = "Dr. Ishan Gupta — Pulmonology & Respiratory Medicine";
export const SITE_DESCRIPTION =
  "Dr. Ishan Gupta is a Pulmonology & Respiratory Medicine specialist at Apollo Hospitals, New Delhi, with 10+ years of experience treating asthma, COPD, tuberculosis, sleep apnea, and other respiratory conditions.";

// Set in Vercel (Production + Preview) so absolute Open Graph / canonical URLs
// can be generated. Undefined in local dev, where Next.js falls back to
// relative URLs — which still work for everything except social previews.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

// robots.txt and sitemap.xml require absolute URLs, so they need an origin even
// when NEXT_PUBLIC_SITE_URL is unset. The project ships on the default Vercel
// domain (no custom domain), so that URL is the canonical fallback.
export const SITE_ORIGIN = SITE_URL || "https://ishan-gupta-eight.vercel.app";
