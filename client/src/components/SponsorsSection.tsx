"use client";

import React, { useState, useEffect } from 'react';
import { Building2, Award, HandHeart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { resolveUploadUrl } from '@/lib/env';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [loading, setLoading] = useState(true);
  const [partnershipKitUrl, setPartnershipKitUrl] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    api
      .get<TrustedPartner[]>('/partners', { skipErrorHandling: true, requiresAuth: false })
      .then((data) => setSponsors(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load partners', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .get<{ url: string | null }>('/admin/settings/partnership-kit', { skipErrorHandling: true })
      .then((res) => setPartnershipKitUrl(res?.url ?? null))
      .catch((err) => console.error('Partnership kit fetch failed', err));
  }, [isAuthenticated]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'from-slate-400 to-slate-600';
      case 'Gold': return 'from-secondary to-secondary-light';
      case 'Silver': return 'from-gray-300 to-gray-500';
      case 'Bronze': return 'from-accent-light to-accent';
      default: return 'from-muted to-muted-foreground';
    }
  };

  const getLogoContent = (partner: TrustedPartner) => {
    if (partner.logo) {
      if (partner.logo.startsWith('http') || partner.logo.startsWith('/')) {
        const logoUrl = resolveUploadUrl(partner.logo);
        if (logoUrl) {
          return (
            <Image
              src={logoUrl}
              alt={`${partner.name} logo`}
              width={64}
              height={64}
              loading="lazy"
              className="w-16 h-16 mx-auto object-contain"
            />
          );
        }
      }
      return <div className="text-4xl" aria-hidden="true">{partner.logo}</div>;
    }

    // Auto-assign emoji based on role/tier
    const role = (partner.role || '').toLowerCase();

    let emoji = '🏢';
    if (role.includes('tech') || role.includes('equipment')) emoji = '⚙️';
    else if (role.includes('research')) emoji = '🔬';
    else if (role.includes('education')) emoji = '🎓';
    else if (role.includes('material')) emoji = '🧪';
    else if (role.includes('community')) emoji = '🤝';

    return <div className="text-4xl" aria-hidden="true">{emoji}</div>;
  };

  return (
    <section className="section-padding bg-background" aria-labelledby="partners-heading">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HandHeart className="w-8 h-8 text-primary" aria-hidden="true" />
            <h2 id="partners-heading" className="text-3xl md:text-4xl font-bold text-foreground">Our Trusted Partners</h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Working together with leading organizations to advance biomimetic dentistry
            and make quality education accessible to students worldwide.
          </p>
        </div>

        {/* Sponsors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-busy="true" aria-live="polite">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full" />
                <Skeleton className="h-5 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-40 mx-auto mb-4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : sponsors.length === 0 ? (
          <p className="text-center text-muted-foreground">No partners to display yet.</p>
        ) : (
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
                  <Award className="w-5 h-5 text-secondary" aria-hidden="true" />
                </div>

                {/* Logo and Name */}
                <div className="text-center mb-4">
                  <div className="mb-3 h-16 flex items-center justify-center">
                    {getLogoContent(sponsor)}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-1">{sponsor.name}</h3>
                  <p className="text-primary font-semibold">{sponsor.role}</p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-center leading-relaxed">
                  {sponsor.description}
                </p>

                {/* Partnership Icon */}
                <div className="flex justify-center mt-4">
                  <Building2 className="w-6 h-6 text-accent" aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>
        )}

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
