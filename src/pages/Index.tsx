import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import SponsorsSection from '@/components/SponsorsSection';
import VIPSection from '@/components/VIPSection';
import SEOHead from '@/components/SEOHead';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Biomimetic Dentistry Club - Making Dentistry More Human and Accessible"
        description="Join the global movement redefining dental care through biomimetic science. Affordable, accessible education for dental professionals worldwide."
        keywords="biomimetic dentistry, dental education, natural dentistry, tooth preservation, dental courses, biomimetics, restorative dentistry"
      />
      <Navigation />
      <HeroSection />
      <SponsorsSection />
      <VIPSection />
      <Footer />
    </div>
  );
};

export default Index;