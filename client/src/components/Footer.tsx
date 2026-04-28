'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { Heart, Mail, MapPin, Phone, Instagram, Linkedin, Youtube, Globe } from 'lucide-react';
import { api } from '@/lib/api';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { staggerContainer, staggerItem } from '@/components/ScrollReveal';

/* ── Animation variants ───────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

// `type: 'spring' as const` required — framer-motion v12 uses a literal union,
// not a plain string, for animation generator type.
const socialIcon: Variants = {
  rest:  { scale: 1 },
  hover: {
    scale: 1.2,
    rotate: 8,
    transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
  },
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'exists'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const prefersReduced = useReducedMotion();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeStatus('loading');
    setErrorMessage(null);
    try {
      await api.post('/newsletter', { email }, { requiresAuth: false, skipErrorHandling: true });
      setSubscribeStatus('success');
      setEmail('');
    } catch (err: any) {
      if (err?.status === 409) {
        setSubscribeStatus('exists');
      } else if (err?.status === 400) {
        setSubscribeStatus('error');
        setErrorMessage('Please enter a valid email address.');
      } else {
        setSubscribeStatus('error');
        setErrorMessage(err?.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const footerSections = [
    {
      title: 'Education',
      links: [
        { label: 'Courses',   href: '/courses'   },
        { label: 'Resources', href: '/resources' },
        { label: 'Blog',      href: '/blog'      },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'Ambassadors', href: '/ambassador'   },
        { label: 'VIP Program', href: '/subscription' },
        { label: 'Partnership', href: '/partnership'  },
      ],
    },
    {
      title: 'Organization',
      links: [
        { label: 'About Us', href: '/about'   },
        { label: 'Contact',  href: '/contact' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Sign In',        href: '/login'     },
        { label: 'Create Account', href: '/signup'    },
        { label: 'Dashboard',      href: '/dashboard' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://www.instagram.com/biomimeticdentistryclub', label: 'Instagram' },
    { icon: Linkedin,  href: 'https://www.linkedin.com/company/biomimetic-dentistry-club', label: 'LinkedIn' },
    { icon: Youtube,   href: 'https://www.youtube.com/@biomimeticdentistryclub', label: 'YouTube' },
    { icon: Globe,     href: '/', label: 'Website' },
  ];

  return (
    /* Scroll-triggered entrance: footer fades in from below as it enters viewport */
    <motion.footer
      initial={prefersReduced ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, ease: EASE }}
      className="bg-primary text-primary-foreground"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">Site footer</h2>

      {/* Main Footer Content */}
      <div className="section-container section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">

          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <motion.div
                whileHover={prefersReduced ? {} : { rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
                className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center"
                aria-hidden="true"
              >
                <Heart className="w-6 h-6 text-secondary-foreground" />
              </motion.div>
              <div>
                <p className="text-2xl font-bold">Biomimetic Dentistry</p>
                <p className="text-primary-foreground/80 text-sm">Club</p>
              </div>
            </div>

            <p className="text-primary-foreground/90 mb-6 leading-relaxed">
              Revolutionizing dental education through biomimetic science,
              connecting students worldwide with accessible, high-quality learning opportunities.
            </p>

            {/* Contact Info */}
            <address className="not-italic space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary" aria-hidden="true" />
                <a href="mailto:info@biomimeticdentistry.org" className="text-sm hover:text-secondary transition-smooth">
                  info@biomimeticdentistry.org
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary" aria-hidden="true" />
                <a href="tel:+15551234567" className="text-sm hover:text-secondary transition-smooth">
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span className="text-sm">Global Organization</span>
              </div>
            </address>
          </div>

          {/* Links Sections — staggered reveal */}
          <motion.div
            variants={prefersReduced ? {} : staggerContainer(0.08)}
            initial={prefersReduced ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {footerSections.map((section) => (
              <motion.nav
                key={section.title}
                variants={prefersReduced ? {} : staggerItem}
                aria-label={section.title}
              >
                <h3 className="text-lg font-semibold mb-4 text-secondary">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-primary-foreground/80 hover:text-secondary transition-smooth text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.nav>
            ))}
          </motion.div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          className="mt-16 p-6 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm"
        >
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-secondary">Stay Updated</h3>
            <p className="text-primary-foreground/90 mb-6">
              Get the latest updates on courses, research, and community events delivered to your inbox.
            </p>
            {subscribeStatus === 'success' ? (
              <motion.p
                initial={prefersReduced ? false : { scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-secondary font-semibold"
                role="status"
              >
                You&apos;re subscribed! Thank you.
              </motion.p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSubscribeStatus('idle');
                    setErrorMessage(null);
                  }}
                  required
                  autoComplete="email"
                  aria-describedby="newsletter-status"
                  className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 border border-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <motion.button
                  type="submit"
                  disabled={subscribeStatus === 'loading'}
                  whileHover={prefersReduced ? {} : { scale: 1.04 }}
                  whileTap={prefersReduced ? {} : { scale: 0.97 }}
                  className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-smooth disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {subscribeStatus === 'loading' ? 'Subscribing…' : 'Subscribe'}
                </motion.button>
              </form>
            )}
            <div id="newsletter-status" aria-live="polite" className="min-h-5 mt-2">
              {subscribeStatus === 'exists' && (
                <p className="text-yellow-300 text-sm">This email is already subscribed.</p>
              )}
              {subscribeStatus === 'error' && (
                <p className="text-red-400 text-sm">{errorMessage || 'Something went wrong. Please try again.'}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="section-container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/80 text-sm">
              © {currentYear} Biomimetic Dentistry Club. All rights reserved.
            </p>

            {/* Social Links — spring hover */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    variants={socialIcon}
                    initial="rest"
                    whileHover={prefersReduced ? 'rest' : 'hover'}
                    className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center text-primary-foreground/80 hover:text-secondary hover:bg-primary-foreground/20 transition-smooth"
                  >
                    <IconComponent className="w-5 h-5" aria-hidden="true" />
                  </motion.a>
                );
              })}
            </div>

            {/* Legal Links */}
            <div className="flex gap-4 text-sm">
              <Link href="/about#privacy" className="text-primary-foreground/80 hover:text-secondary transition-smooth">
                Privacy Policy
              </Link>
              <span className="text-primary-foreground/40" aria-hidden="true">•</span>
              <Link href="/about#terms" className="text-primary-foreground/80 hover:text-secondary transition-smooth">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
