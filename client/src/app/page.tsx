import React from 'react';
import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import SponsorsSection from '@/components/SponsorsSection';
import VIPSection from '@/components/VIPSection';
import { SITE_URL } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Biomimetic Dentistry Club — Making Dentistry More Human and Accessible',
  description:
    'Join the global movement redefining dental care through biomimetic science. Affordable, accessible education for dental professionals worldwide.',
  alternates: { canonical: '/' },
  openGraph: {
    title:       'Biomimetic Dentistry Club — Making Dentistry More Human and Accessible',
    description: 'Join the global movement redefining dental care through biomimetic science. Affordable, accessible education for dental professionals worldwide.',
    url:         SITE_URL,
    type:        'website',
  },
};

// FE-SEO-02 (Iter 10): WebSite schema rendered inline (not via Script afterInteractive)
// so Google and other crawlers see it in the initial HTML payload.
const websiteJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type':    'WebSite',
  name:       'Biomimetic Dentistry Club',
  url:        SITE_URL,
  potentialAction: {
    '@type':      'SearchAction',
    target: {
      '@type':      'EntryPoint',
      urlTemplate:  `${SITE_URL}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <SponsorsSection />
      <VIPSection />
      <Footer />
      {/* FE-SEO-02: inline JSON-LD — in initial HTML payload for crawlers */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: websiteJsonLd }}
      />
    </div>
  );
}
