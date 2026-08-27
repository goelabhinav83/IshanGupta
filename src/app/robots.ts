import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing crawlable lives under the API route, and it costs money to hit.
      disallow: "/api/",
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
