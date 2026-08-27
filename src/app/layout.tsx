import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { contact, doctor } from "@/content/doctor";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
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
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: doctor.photo }],
    type: "website",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Physician",
  name: doctor.name,
  medicalSpecialty: "Pulmonology",
  image: doctor.photo,
  description: SITE_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    name: contact.clinicName,
    streetAddress: contact.addressLines.join(", "),
    addressLocality: "Faridabad",
    addressRegion: "Haryana",
    addressCountry: "IN",
  },
  email: contact.email,
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
