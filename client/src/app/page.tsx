import React from 'react';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import SponsorsSection from '@/components/SponsorsSection';
import VIPSection from '@/components/VIPSection';

export const metadata = {
  title: "Biomimetic Dentistry Club - Making Dentistry More Human and Accessible",
  description: "Join the global movement redefining dental care through biomimetic science. Affordable, accessible education for dental professionals worldwide.",
  keywords: "biomimetic dentistry, dental education, natural dentistry, tooth preservation, dental courses, biomimetics, restorative dentistry",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <SponsorsSection />
      <VIPSection />
      <Footer />
    </div>
  );
}
