import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { contact, doctor } from "@/content/doctor";
import { SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN } from "@/lib/constants";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatWidget from "@/components/chat/ChatWidget";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  // Always set, so Open Graph images resolve to absolute URLs rather than
  // silently falling back to localhost when NEXT_PUBLIC_SITE_URL is absent.
  metadataBase: new URL(SITE_ORIGIN),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  verification: { google: "yzBBCLcdogJBdfNPm704lACpTxGfJu1zyLLWWkIMH7Y" },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    // Purpose-built 1200x630 card — social platforms centre-crop anything
    // squarer than this, which would cut off the face.
    images: [{ url: doctor.ogImage, width: 1200, height: 630, alt: doctor.name }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [doctor.ogImage],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": ["Physician", "MedicalClinic"],
  name: doctor.name,
  medicalSpecialty: "Pulmonology",
  // Structured data requires absolute URLs, unlike the rest of the page.
  image: `${SITE_ORIGIN}${doctor.photo}`,
  description: SITE_DESCRIPTION,
  url: SITE_ORIGIN,
  address: {
    "@type": "PostalAddress",
    name: contact.clinicName,
    streetAddress: contact.addressLines.join(", "),
    addressLocality: "Faridabad",
    addressRegion: "Haryana",
    addressCountry: "IN",
  },
  email: contact.email,
  telephone: `+${contact.whatsappNumber}`,
  openingHours: contact.officeHoursSchema,
  availableLanguage: [...doctor.languages],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink font-body">
        {children}
        <WhatsAppButton />
        <ChatWidget />
        <Analytics />
      </body>
    </html>
  );
}
