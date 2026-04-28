import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navigation from "@/components/Navigation";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import ScrollProgress from "@/components/ScrollProgress";
import MotionLayout from "@/components/MotionLayout";
import { SITE_URL } from "@/lib/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,               // allow up to 5× pinch-zoom (accessibility)
  userScalable: true,            // never disable pinch-zoom — accessibility requirement
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#88C9A1" },
    { media: "(prefers-color-scheme: dark)",  color: "#101518" },
  ],
  colorScheme: "light dark",
  viewportFit: "cover",          // allow content to extend behind notch (iOS safe area)
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
    "dental professional education",
    "online dental courses",
  ],
  applicationName: "Biomimetic Dentistry Club",
  authors:   [{ name: "Biomimetic Dentistry Club" }],
  creator:   "Biomimetic Dentistry Club",
  publisher: "Biomimetic Dentistry Club",
  alternates: { canonical: "/" },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         SITE_URL,
    siteName:    "Biomimetic Dentistry Club",
    title:       "Biomimetic Dentistry Club — Making Dentistry More Human and Accessible",
    description: "Join the global movement redefining dental care through biomimetic science. Affordable, accessible education for dental professionals worldwide.",
    images: [
      {
        url:    "/logo.png",
        width:  1200,
        height: 630,
        alt:    "Biomimetic Dentistry Club",
      },
    ],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Biomimetic Dentistry Club",
    description: "Global movement redefining dental care through biomimetic science. Affordable, accessible education for dental professionals worldwide.",
    images:      ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico",  sizes: "48x48",   type: "image/x-icon" },
      { url: "/logo.png",     sizes: "192x192", type: "image/png" },
      { url: "/logo.png",     sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
      { url: "/logo.png", sizes: "152x152", type: "image/png" },
      { url: "/logo.png", sizes: "120x120", type: "image/png" },
    ],
    shortcut: [{ url: "/logo.png" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-image-preview": "large",
      "max-snippet":       -1,
      "max-video-preview": -1,
    },
  },
  category: "education",
  other: {
    "apple-mobile-web-app-capable":           "yes",
    "apple-mobile-web-app-status-bar-style":  "default",
    "apple-mobile-web-app-title":             "BioDentistry",
    "mobile-web-app-capable":                 "yes",
    "format-detection":                       "telephone=no",
    "x-dns-prefetch-control":                 "on",
  },
};

// ── Structured data: Organization schema ──────────────────────────────────────
const organizationJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name:          "Biomimetic Dentistry Club",
  alternateName: "Biomimetic Dentistry",
  url:           SITE_URL,
  logo:          `${SITE_URL}/logo.png`,
  description:   "Global non-profit movement redefining dental care through biomimetic science and accessible education.",
  sameAs: [
    "https://www.linkedin.com/company/biomimetic-dentistry-club",
    "https://www.instagram.com/biomimeticdentistryclub",
    "https://www.youtube.com/@biomimeticdentistryclub",
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-medium"
        >
          Skip to main content
        </a>

        {/*
          ScrollProgress — fixed gradient bar tracking page scroll.
          Lives outside Providers so it renders on every page.
          z-[200] places it above Navigation (z-50).
          aria-hidden: purely decorative.
        */}
        <ScrollProgress />

        <Providers>
          <Navigation />

          {/*
            MotionLayout — AnimatePresence wrapper keyed by pathname.
            Provides smooth fade+slide transition between page navigations.
            Falls back to plain render when prefers-reduced-motion is active.
          */}
          <main id="main-content">
            <MotionLayout>
              {children}
            </MotionLayout>
          </main>

          {/* FE-08 (Iter 4): PWA install prompt — must be inside Providers for toast context */}
          <PWAInstallBanner />
        </Providers>

        {/* FE-SEO-02 (Iter 10): inline JSON-LD — rendered in initial HTML for crawlers */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
        />
      </body>
    </html>
  );
}
