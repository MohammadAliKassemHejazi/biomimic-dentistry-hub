import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navigation from "@/components/Navigation";
import PWAInstallBanner from "@/components/PWAInstallBanner";
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
      // Sizes that iOS Safari selects for the Home Screen icon
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
  // ── FE-MOBILE-01 (Iter 10): Apple + mobile PWA meta tags ──────────────────
  // These unlock true standalone / home-screen-app behaviour on iOS Safari
  // and are the standard mobile PWA web standards tags.
  other: {
    // iOS Safari: add to home screen acts as a standalone app
    "apple-mobile-web-app-capable":           "yes",
    // "default" keeps the iOS status bar visible with the system color
    "apple-mobile-web-app-status-bar-style":  "default",
    // Name shown below the icon on the iOS home screen
    "apple-mobile-web-app-title":             "BioDentistry",
    // Android legacy compatibility (pre-Manifest spec browsers)
    "mobile-web-app-capable":                 "yes",
    // Prevent iOS from converting phone-like numbers into tel: links
    "format-detection":                       "telephone=no",
    // Allow DNS prefetching for faster third-party resource loads
    "x-dns-prefetch-control":                 "on",
  },
};

// ── Structured data: Organization schema ──────────────────────────────────────
// FE-SEO-02 (Iter 10): Rendered inline in the HTML <body> (not via
// <Script strategy="afterInteractive">) so crawlers see it immediately
// without needing to execute deferred JavaScript.
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-medium"
        >
          Skip to main content
        </a>
        <Providers>
          <Navigation />
          <main id="main-content">{children}</main>
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
