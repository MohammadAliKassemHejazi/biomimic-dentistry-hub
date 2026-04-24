import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/Providers";
import Navigation from "@/components/Navigation";
import { SITE_URL } from "@/lib/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F9F8" },
    { media: "(prefers-color-scheme: dark)", color: "#101518" },
  ],
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Biomimetic Dentistry Club — Making Dentistry More Human and Accessible",
    template: "%s | Biomimetic Dentistry Club",
  },
  description:
    "Global movement redefining dental care through biomimetic science. Affordable, accessible education, research, and community for dental professionals worldwide.",
  keywords: [
    "biomimetic dentistry",
    "dental education",
    "natural dentistry",
    "tooth preservation",
    "dental courses",
    "biomimetics",
    "restorative dentistry",
    "adhesive dentistry",
    "minimally invasive dentistry",
  ],
  applicationName: "Biomimetic Dentistry Club",
  authors: [{ name: "Biomimetic Dentistry Club" }],
  creator: "Biomimetic Dentistry Club",
  publisher: "Biomimetic Dentistry Club",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Biomimetic Dentistry Club",
    title: "Biomimetic Dentistry Club — Making Dentistry More Human and Accessible",
    description:
      "Join the global movement redefining dental care through biomimetic science. Affordable, accessible education for dental professionals worldwide.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Biomimetic Dentistry Club",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Biomimetic Dentistry Club",
    description:
      "Global movement redefining dental care through biomimetic science. Affordable, accessible education for dental professionals worldwide.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/logo.png" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "education",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Biomimetic Dentistry Club",
  alternateName: "Biomimetic Dentistry",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Global non-profit movement redefining dental care through biomimetic science and accessible education.",
  sameAs: [
    "https://www.linkedin.com/company/biomimetic-dentistry-club",
    "https://www.instagram.com/biomimeticdentistryclub",
    "https://www.youtube.com/@biomimeticdentistryclub",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-medium"
        >
          Skip to main content
        </a>
        <Providers>
          <Navigation />
          <main id="main-content">{children}</main>
        </Providers>
        <Script
          id="org-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
