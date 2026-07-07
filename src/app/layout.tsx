import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

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
  title: "CalebZ Mastering",
  description:
    "Independent mastering for electronic music. Loud and clean, from club systems to phone speakers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${monoLabel.variable}`}>
        {children}
      </body>
    </html>
  );
}
