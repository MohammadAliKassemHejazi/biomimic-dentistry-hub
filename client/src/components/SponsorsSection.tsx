"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Award, HandHeart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { resolveUploadUrl } from '@/lib/env';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollReveal, staggerContainer, staggerItem } from '@/components/ScrollReveal';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TrustedPartner {
    id: string;
    name: string;
    role: string;
    description: string;
    logo: string;
    tier: string;
    website?: string;
}

/** Returns true only for file extensions that browsers can display as images. */
const isImageExtension = (url: string): boolean => {
  const ext = url.split('.').pop()?.toLowerCase() ?? '';
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'ico'].includes(ext);
};

/* ── Animation variants ───────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

const cardVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

const SponsorsSection = () => {
  const [sponsors, setSponsors] = useState<TrustedPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnershipKitUrl, setPartnershipKitUrl] = useState<string | null>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    api
      .get<TrustedPartner[]>('/partners', { skipErrorHandling: true, requiresAuth: false })
      .then((data) => setSponsors(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load partners', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get<{ url: string | null }>('/settings/partnership-kit', {
        skipErrorHandling: true,
        requiresAuth: false,
      })
      .then((res) => setPartnershipKitUrl(res?.url ?? null))
      .catch(() => {/* silently skip if kit isn't set yet */});
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'from-slate-400 to-slate-600';
      case 'Gold':     return 'from-secondary to-secondary-light';
      case 'Silver':   return 'from-gray-300 to-gray-500';
      case 'Bronze':   return 'from-accent-light to-accent';
      default:         return 'from-muted to-muted-foreground';
    }
  };

  const getLogoContent = (partner: TrustedPartner) => {
    if (partner.logo) {
      if (partner.logo.startsWith('http') || partner.logo.startsWith('/')) {
        const logoUrl = resolveUploadUrl(partner.logo);
        if (logoUrl && isImageExtension(logoUrl)) {
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
      if (!partner.logo.startsWith('/') && !partner.logo.startsWith('http')) {
        return <div className="text-4xl" aria-hidden="true">{partner.logo}</div>;
      }
    }
    const role = (partner.role || '').toLowerCase();
    let emoji = '🏢';
    if (role.includes('tech') || role.includes('equipment')) emoji = '⚙️';
    else if (role.includes('research'))  emoji = '🔬';
    else if (role.includes('education')) emoji = '🎓';
    else if (role.includes('material'))  emoji = '🧪';
    else if (role.includes('community')) emoji = '🤝';
    return <div className="text-4xl" aria-hidden="true">{emoji}</div>;
  };

  return (
    <section className="section-padding bg-background" aria-labelledby="partners-heading">
      <div className="section-container">

        {/* ── Section Header — scroll reveal ─────────────────────────────── */}
        <ScrollReveal direction="up" duration={0.7} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HandHeart className="w-8 h-8 text-primary" aria-hidden="true" />
            <h2 id="partners-heading" className="text-3xl md:text-4xl font-bold text-foreground">
              Our Trusted Partners
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Working together with leading organizations to advance biomimetic dentistry
            and make quality education accessible to students worldwide.
          </p>
        </ScrollReveal>

        {/* ── Sponsors Grid — staggered card reveals ─────────────────────── */}
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
          /* Stagger parent — viewport={{ once: true }} prevents re-trigger on scroll-up */
          <motion.div
            variants={prefersReduced ? {} : staggerContainer(0.1)}
            initial={prefersReduced ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {sponsors.map((sponsor) => (
              <motion.div
                key={sponsor.id}
                variants={prefersReduced ? {} : cardVariants}
                whileHover={prefersReduced ? {} : {
                  y: -8,
                  boxShadow: '0 20px 40px rgba(136,201,161,0.18)',
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                className="glass-card rounded-2xl p-6 cursor-default"
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
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Partnership CTA — scroll reveal ────────────────────────────── */}
        <ScrollReveal direction="up" delay={0.2} duration={0.7} className="mt-16 text-center">
          <motion.div
            whileHover={prefersReduced ? {} : {
              scale: 1.01,
              transition: { type: 'spring', stiffness: 200, damping: 20 },
            }}
            className="bg-gradient-card rounded-2xl p-8 shadow-medium"
          >
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Become a Partner
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join our mission to revolutionize dental education. Partner with us to reach
              students globally and advance biomimetic dentistry practices.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/partnership" passHref>
                <motion.button
                  whileHover={prefersReduced ? {} : { scale: 1.04, y: -2 }}
                  whileTap={prefersReduced ? {} : { scale: 0.97 }}
                  className="btn-primary"
                >
                  Partnership Opportunities
                </motion.button>
              </Link>
              {partnershipKitUrl && (
                <motion.a
                  href={partnershipKitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={prefersReduced ? {} : { scale: 1.04, y: -2 }}
                  whileTap={prefersReduced ? {} : { scale: 0.97 }}
                  className="btn-outline inline-flex items-center justify-center"
                >
                  Download Partnership Kit
                </motion.a>
              )}
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default SponsorsSection;
