"use client";

import React, { useState, useEffect } from 'react';
import { Building2, Award, HandHeart } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface TrustedPartner {
    id: string;
    name: string;
    role: string;
    description: string;
    logo: string;
    tier: string;
    website?: string;
}

const SponsorsSection = () => {
  const [sponsors, setSponsors] = useState<TrustedPartner[]>([]);
  const [partnershipKitUrl, setPartnershipKitUrl] = useState<string | null>(null);

  useEffect(() => {
    api.get<TrustedPartner[]>('/partners', { skipErrorHandling: true }).then(setSponsors).catch(console.error);
    api.get<{url: string | null}>('/admin/settings/partnership-kit', { skipErrorHandling: true }).then(res => setPartnershipKitUrl(res.url)).catch(console.error);
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'from-slate-400 to-slate-600';
      case 'Gold': return 'from-secondary to-secondary-light';
      case 'Silver': return 'from-gray-300 to-gray-500';
      case 'Bronze': return 'from-accent-light to-accent';
      default: return 'from-muted to-muted-foreground';
    }
  };

  const getEmojiForPartner = (partner: TrustedPartner) => {
    if (partner.logo) return partner.logo;

    // Auto-assign emoji based on role/tier
    const role = (partner.role || '').toLowerCase();

    if (role.includes('tech') || role.includes('equipment')) return '⚙️';
    if (role.includes('research')) return '🔬';
    if (role.includes('education')) return '🎓';
    if (role.includes('material')) return '🧪';
    if (role.includes('community')) return '🤝';

    return '🏢';
  };

  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HandHeart className="w-8 h-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Trusted Partners</h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Working together with leading organizations to advance biomimetic dentistry
            and make quality education accessible to students worldwide.
          </p>
        </div>

        {/* Sponsors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sponsors.map((sponsor, index) => (
            <div
              key={sponsor.id}
              className={`card-hover glass-card rounded-2xl p-6 fade-in-up stagger-${index % 4 + 1}`}
            >
              {/* Tier Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(sponsor.tier)} text-white text-xs font-semibold`}>
                  {sponsor.tier} Partner
                </div>
                <Award className="w-5 h-5 text-secondary" />
              </div>

              {/* Logo and Name */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">{getEmojiForPartner(sponsor)}</div>
                <h3 className="text-xl font-bold text-foreground mb-1">{sponsor.name}</h3>
                <p className="text-primary font-semibold">{sponsor.role}</p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-center leading-relaxed">
                {sponsor.description}
              </p>

              {/* Partnership Icon */}
              <div className="flex justify-center mt-4">
                <Building2 className="w-6 h-6 text-accent" />
              </div>
            </div>
          ))}
        </div>

        {/* Partnership CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-card rounded-2xl p-8 shadow-medium">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Become a Partner
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join our mission to revolutionize dental education. Partner with us to reach
              students globally and advance biomimetic dentistry practices.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/partnership" passHref>
                <button className="btn-primary">
                  Partnership Opportunities
                </button>
              </Link>
              {partnershipKitUrl && (
                <a href={partnershipKitUrl} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex items-center justify-center">
                  Download Partnership Kit
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;