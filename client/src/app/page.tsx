import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import SponsorsSection from '@/components/SponsorsSection';
import VIPSection from '@/components/VIPSection';
import { SITE_URL } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Biomimetic Dentistry Club — Making Dentistry More Human and Accessible',
  description:
    'Join the global movement redefining dental care through biomimetic science. Affordable, accessible education for dental professionals worldwide.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Biomimetic Dentistry Club — Making Dentistry More Human and Accessible',
    description:
      'Join the global movement redefining dental care through biomimetic science. Affordable, accessible education for dental professionals worldwide.',
    url: SITE_URL,
    type: 'website',
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Biomimetic Dentistry Club',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <SponsorsSection />
      <VIPSection />
      <Footer />
      <Script
        id="home-website-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
    </div>
  );
}
