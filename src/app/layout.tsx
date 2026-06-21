import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SectorHistory — Ontdek de geschiedenis om je heen",
  description:
    "Een interactieve kaart met historische gebeurtenissen uit de afgelopen 100+ jaar. Ontdek wat er in jouw buurt gebeurde tijdens oorlogen, crises en bijzondere momenten.",
  keywords: [
    "geschiedenis",
    "kaart",
    "WO2",
    "WO1",
    "oorlog",
    "educatie",
    "interactieve kaart",
    "historische gebeurtenissen",
  ],
  openGraph: {
    title: "SectorHistory",
    description: "Ontdek de geschiedenis om je heen",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full bg-background text-text-primary font-sans">
        {children}
      </body>
    </html>
  );
}
