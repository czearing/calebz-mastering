import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const siteUrl = "https://calebz-mastering.vercel.app";
const description =
  "Mastering for electronic music, hip-hop, and pop. Hear full-length before-and-after work by CalebZ.";

// Neo-grotesque display and UI face. Variable axis, see plan/04.
const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

// Mono for technical labels, tags, numbers.
const monoLabel = Space_Mono({
  variable: "--font-mono-label",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CalebZ Mastering | Mastering Engineer",
    template: "%s | CalebZ Mastering",
  },
  description,
  alternates: { canonical: "/" },
  authors: [{ name: "CalebZ" }],
  creator: "CalebZ",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "CalebZ Mastering",
    title: "CalebZ Mastering | Mastering Engineer",
    description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CalebZ Mastering",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CalebZ Mastering | Mastering Engineer",
    description,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isVercel = process.env.VERCEL === "1";
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "CalebZ Mastering",
    url: siteUrl,
    image: `${siteUrl}/calebz-portrait.jpg`,
    email: "calebzofficial@gmail.com",
    description,
    areaServed: "Worldwide",
    sameAs: [
      "https://soundcloud.com/caleb_z",
      "https://www.youtube.com/@CalebZaudio",
      "https://open.spotify.com/artist/564lyz9Wk0PY0XT6P6pnCk",
      "https://tidal.com/artist/22376230",
    ],
    serviceType: "Audio mastering",
  };

  return (
    <html lang="en">
      <body className={`${display.variable} ${monoLabel.variable}`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        {isVercel ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
