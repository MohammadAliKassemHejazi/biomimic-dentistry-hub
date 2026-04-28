"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Zap, MessageCircle, BookOpen, Calendar, Trophy, Instagram, Facebook } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { resolveUploadUrl } from '@/lib/env';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollReveal, staggerContainer, staggerItem } from '@/components/ScrollReveal';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface LeadershipMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  expertise?: string;
  achievements?: string;
  status?: string;
}

interface SubscriptionTier {
  name: string;
  price: number;
  interval: string;
  features: string[];
  icon: any;
  popular?: boolean;
  color?: string;
  key: string;
}

/* ── Animation variants ───────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

const memberCard = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const pricingCard = {
  hidden:  { opacity: 0, y: 50, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.7, ease: EASE } },
};

const benefitCard = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const VIPSection = () => {
  const [members, setMembers] = useState<LeadershipMember[]>([]);
  const [plans, setPlans] = useState<SubscriptionTier[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const prefersReduced = useReducedMotion();

  const getProfileContent = (member: LeadershipMember) => {
    if (member.image) {
      if (member.image.startsWith('http') || member.image.startsWith('/')) {
        const imageUrl = resolveUploadUrl(member.image);
        if (imageUrl) {
          return (
            <Image
              src={imageUrl}
              alt={`Portrait of ${member.name}`}
              width={96}
              height={96}
              loading="lazy"
              className="w-24 h-24 mx-auto rounded-full object-cover shadow-sm border-2 border-primary/10"
            />
          );
        }
      }
      return <div className="text-6xl" aria-hidden="true">{member.image}</div>;
    }
    const title = (member.role || '').toLowerCase();
    const name  = (member.name || '').toLowerCase();
    let emoji = '👤';
    if (title.includes('founder'))                              emoji = '👩‍⚕️';
    else if (title.includes('education') || title.includes('professor') || name.includes('prof')) emoji = '👨‍🏫';
    else if (title.includes('ambassador'))                      emoji = '👩‍💼';
    else if (title.includes('research'))                        emoji = '👨‍🔬';
    else if (name.includes('dr'))                               emoji = '👨‍⚕️';
    return <div className="text-6xl" aria-hidden="true">{emoji}</div>;
  };

  const getIconForKey = (key: string) => {
    switch (key) {
      case 'bronze': return Trophy;
      case 'silver': return Star;
      case 'gold':   return Crown;
      default:       return Star;
    }
  };

  const getColorForKey = (key: string) => {
    switch (key) {
      case 'bronze': return 'from-accent-light to-accent';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'gold':   return 'from-secondary to-secondary-light';
      default:       return 'from-primary to-primary-light';
    }
  };

  useEffect(() => {
    api
      .get<LeadershipMember[]>('/leadership', { skipErrorHandling: true, requiresAuth: false })
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Leadership fetch failed', err))
      .finally(() => setLoadingMembers(false));

    api
      .get<any[]>('/plans', { skipErrorHandling: true, requiresAuth: false })
      .then((data) => {
        if (data && data.length > 0) {
          const mappedPlans = data.map((p) => ({
            name:     p.name,
            price:    parseFloat(p.price),
            interval: p.interval,
            features: p.features,
            popular:  p.popular,
            key:      p.key,
            icon:     getIconForKey(p.key),
            color:    getColorForKey(p.key),
          }));
          mappedPlans.sort((a, b) => a.price - b.price);
          setPlans(mappedPlans);
        }
      })
      .catch((err) => console.error('Plans fetch failed', err))
      .finally(() => setLoadingPlans(false));
  }, []);

  const getStatusColor = (status: string) => {
    if (!status) return 'from-muted to-muted-foreground';
    switch (status) {
      case 'Founder':     return 'from-secondary to-secondary-light';
      case 'Advisor':     return 'from-primary to-primary-light';
      case 'Director':    return 'from-accent to-accent-light';
      case 'Coordinator': return 'from-blue-400 to-blue-600';
      default:            return 'from-muted to-muted-foreground';
    }
  };

  return (
    <section id="vip" className="section-padding bg-muted/30" aria-labelledby="leadership-heading">
      <div className="section-container">

        {/* ══════════════════════════════════════════════════════════════════
            VIP PEOPLE SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <div className="mb-20">

          {/* Section header */}
          <ScrollReveal direction="up" duration={0.7} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-secondary" aria-hidden="true" />
              <h2 id="leadership-heading" className="text-3xl md:text-4xl font-bold text-foreground">
                Leadership Team
              </h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet the visionaries and experts driving our mission to revolutionize dental education
              and make biomimetic techniques accessible worldwide.
            </p>
          </ScrollReveal>

          {/* Leadership cards */}
          {loadingMembers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" aria-busy="true" aria-live="polite">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl p-6 shadow-soft">
                  <Skeleton className="h-4 w-20 mb-4" />
                  <Skeleton className="h-24 w-24 mx-auto rounded-full mb-4" />
                  <Skeleton className="h-5 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto mb-4" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={prefersReduced ? {} : staggerContainer(0.1)}
              initial={prefersReduced ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {members.map((member) => (
                <motion.div
                  key={member.id}
                  variants={prefersReduced ? {} : memberCard}
                  whileHover={prefersReduced ? {} : {
                    y: -8,
                    boxShadow: '0 20px 40px rgba(136,201,161,0.15)',
                    transition: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                  className="bg-card rounded-2xl p-6 shadow-soft cursor-default"
                >
                  {/* Status Badge */}
                  {member.status && (
                    <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(member.status)} text-white text-xs font-semibold mb-4`}>
                      {member.status}
                    </div>
                  )}

                  {/* Profile Image */}
                  <div className="text-center mb-4">
                    <div className="mb-4 flex items-center justify-center">
                      {getProfileContent(member)}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-semibold text-sm mb-2">{member.role}</p>
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center gap-3 mb-4">
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`} className="text-muted-foreground hover:text-primary transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Twitter`} className="text-muted-foreground hover:text-primary transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                      </a>
                    )}
                    {member.instagram && (
                      <a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Instagram`} className="text-muted-foreground hover:text-primary transition-colors">
                        <Instagram className="w-5 h-5" aria-hidden="true" />
                      </a>
                    )}
                    {member.facebook && (
                      <a href={member.facebook} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Facebook`} className="text-muted-foreground hover:text-primary transition-colors">
                        <Facebook className="w-5 h-5" aria-hidden="true" />
                      </a>
                    )}
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-muted-foreground text-sm text-center leading-relaxed mb-4">
                      {member.bio}
                    </p>
                  )}

                  {/* Expertise + Achievements */}
                  <div className="space-y-3">
                    {member.expertise && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">Expertise</h4>
                        <p className="text-muted-foreground text-sm">{member.expertise}</p>
                      </div>
                    )}
                    {member.achievements && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">Achievements</h4>
                        <p className="text-muted-foreground text-sm">{member.achievements}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            VIP PROGRAM SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <div>

          {/* Section header */}
          <ScrollReveal direction="up" duration={0.7} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-accent" aria-hidden="true" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">VIP Membership Program</h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get direct access to our experts, exclusive courses, and personalized mentorship
              to accelerate your journey in biomimetic techniques.
            </p>
          </ScrollReveal>

          {/* Pricing cards */}
          {loadingPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" aria-busy="true" aria-live="polite">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl p-8 shadow-medium">
                  <Skeleton className="h-16 w-16 rounded-2xl mx-auto mb-4" />
                  <Skeleton className="h-6 w-24 mx-auto mb-2" />
                  <Skeleton className="h-8 w-32 mx-auto mb-6" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={prefersReduced ? {} : staggerContainer(0.15)}
              initial={prefersReduced ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {plans.map((tier) => {
                const IconComponent = tier.icon;
                return (
                  <motion.div
                    key={tier.name}
                    variants={prefersReduced ? {} : pricingCard}
                    whileHover={prefersReduced ? {} : {
                      y: tier.popular ? -10 : -6,
                      scale: tier.popular ? 1.03 : 1.02,
                      boxShadow: tier.popular
                        ? '0 30px 60px rgba(136,201,161,0.25)'
                        : '0 20px 40px rgba(136,201,161,0.15)',
                      transition: { type: 'spring', stiffness: 280, damping: 22 },
                    }}
                    className={`relative bg-card rounded-2xl p-8 shadow-medium ${
                      tier.popular ? 'ring-2 ring-secondary scale-105' : ''
                    }`}
                  >
                    {/* Popular Badge */}
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <motion.div
                          initial={prefersReduced ? false : { scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.4 }}
                          className="bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground px-4 py-1 rounded-full text-sm font-semibold"
                        >
                          Most Popular
                        </motion.div>
                      </div>
                    )}

                    {/* Tier Header */}
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${tier.color} rounded-2xl flex items-center justify-center`}>
                        <IconComponent className="w-8 h-8 text-white" aria-hidden="true" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">{tier.name}</h3>
                      <p className="text-3xl font-bold text-primary">${tier.price}/{tier.interval}</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                            <div className="w-2 h-2 bg-secondary rounded-full" />
                          </div>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <motion.a
                      href="/subscription"
                      whileHover={prefersReduced ? {} : { scale: 1.03 }}
                      whileTap={prefersReduced ? {} : { scale: 0.97 }}
                      className={`block w-full text-center font-semibold py-3 rounded-lg transition-smooth ${
                        tier.popular
                          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                      aria-label={`Choose ${tier.name} plan`}
                    >
                      Choose {tier.name}
                    </motion.a>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Additional Benefits */}
          <motion.div
            variants={prefersReduced ? {} : staggerContainer(0.12)}
            initial={prefersReduced ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: MessageCircle,
                color: 'text-primary',
                title: 'Direct Expert Access',
                desc: 'Connect directly with leading biomimetic dentistry experts and researchers.',
              },
              {
                icon: BookOpen,
                color: 'text-secondary',
                title: 'Exclusive Content',
                desc: 'Access premium courses, case studies, and research materials not available elsewhere.',
              },
              {
                icon: Calendar,
                color: 'text-accent',
                title: 'Flexible Scheduling',
                desc: 'Schedule mentorship sessions and Q&As at times that work for your busy schedule.',
              },
            ].map((benefit) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  variants={prefersReduced ? {} : benefitCard}
                  whileHover={prefersReduced ? {} : {
                    y: -6,
                    boxShadow: '0 16px 32px rgba(136,201,161,0.12)',
                    transition: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                  className="text-center p-6 bg-gradient-card rounded-2xl shadow-soft cursor-default"
                >
                  <Icon className={`w-12 h-12 ${benefit.color} mx-auto mb-4`} aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VIPSection;
