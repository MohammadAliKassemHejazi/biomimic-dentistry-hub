"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Heart, Users, Globe, Leaf, Sparkles } from 'lucide-react';
import Link from 'next/link';
import heroBg from '../assets/hero-bg.jpg';
import dynamic from 'next/dynamic';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Use ToothAnimation (new filename) so Turbopack generates a fresh chunk URL,
// bypassing any browser-cached old BiomimeticTooth3D chunk that had Three.js imports.
const ToothAnimation = dynamic(() => import('./ToothAnimation'), {
  ssr: false,
});

/* ── Animation config ─────────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

// Stagger parent — orchestrates children entrance in sequence
const heroContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

// Individual content block: fade up from 40px
const heroItem = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

// Stat pill: fade + slight scale pop
const statPill = {
  hidden:  { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.5, ease: EASE } },
};

// CTA button: fade + slide up
const ctaItem = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.5, ease: EASE } },
};

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  // ── Scroll-driven parallax ────────────────────────────────────────────
  // scrollYProgress: 0 = top of section at viewport-top, 1 = bottom passed
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Tooth: rises 60px as user scrolls through the hero
  const rawToothY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);
  const toothY    = useSpring(rawToothY, { stiffness: 80, damping: 20 });

  // Background: slower parallax for depth layering
  const rawBgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgY    = useSpring(rawBgY, { stiffness: 60, damping: 20 });

  // Reduced motion: disable parallax transforms entirely
  const resolvedToothY = prefersReduced ? 0 : toothY;
  const resolvedBgY    = prefersReduced ? 0 : bgY;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-bio-mint/5 to-enamel-sky/10 pt-20"
    >
      {/*
        CSS keyframes for the ambient orbs.
        Pure compositor thread — zero Framer Motion rAF JS overhead per frame.
        translate3d only: no blur, no scale, no rotate on any orb.
      */}
      <style>{`
        @keyframes hs-float-mint {
          0%, 100% { transform: translate3d(0, -10px, 0); }
          50%       { transform: translate3d(0,  10px, 0); }
        }
        @keyframes hs-pulse-sky {
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 0.95; }
        }
        @keyframes hs-float-accent {
          0%, 100% { transform: translate3d(-5px, -15px, 0); }
          50%       { transform: translate3d( 5px,  15px, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hs-orb { animation: none !important; will-change: auto !important; }
        }
      `}</style>

      {/* Background Image with parallax */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.08 }}
        transition={{ duration: 2 }}
        style={{
          y: resolvedBgY,
          backgroundImage: `url(${heroBg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'absolute',
          inset: 0,
        }}
      />

      {/* ── ToothAnimation with entrance + scroll parallax ─────────────────
          Outer motion.div provides:
            1. Entrance: fade + scale 0.94 → 1.0 (spring, 0.6s delay)
            2. Scroll: translateY 0 → -60px (compositor — useTransform)
          Inner ToothAnimation has contain:strict so nothing overflows.
      ─────────────────────────────────────────────────────────────────── */}
      <motion.div
        style={{ position: 'absolute', inset: 0, y: resolvedToothY }}
        initial={prefersReduced ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
      >
        <ToothAnimation />
      </motion.div>

      {/* Organic Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/*
          AMBIENT ORBS — pure CSS keyframe animations, zero filter:blur, zero JS rAF.
          Radial gradients pre-baked into compositor layer texture at creation time.
          translate3d keyframes move the pre-baked texture = 0 re-rasterisation/frame.
        */}
        {/* Bio Mint — top-left */}
        <div
          className="hs-orb"
          style={{
            position: 'absolute', top: -20, left: -50,
            width: 300, height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(136,201,161,0.20) 0%, rgba(136,201,161,0.06) 42%, transparent 72%)',
            willChange: 'transform',
            animation: 'hs-float-mint 6s ease-in-out infinite',
          }}
        />
        {/* Enamel Sky — top-right */}
        <div
          className="hs-orb"
          style={{
            position: 'absolute', top: 100, right: -30,
            width: 260, height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(181,226,250,0.24) 0%, rgba(181,226,250,0.07) 42%, transparent 72%)',
            animation: 'hs-pulse-sky 4s ease-in-out infinite',
          }}
        />
        {/* Accent glow — bottom-left */}
        <div
          className="hs-orb"
          style={{
            position: 'absolute', bottom: -30, left: '18%',
            width: 360, height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,180,184,0.16) 0%, rgba(232,180,184,0.04) 42%, transparent 72%)',
            willChange: 'transform',
            animation: 'hs-float-accent 8s ease-in-out 2s infinite',
          }}
        />

        {/* Floating decorative elements */}
        <motion.div
          animate={prefersReduced ? {} : { x: [0, 100, 0], y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-32 right-1/3"
        >
          <Leaf className="w-8 h-8 text-primary/20" />
        </motion.div>

        <motion.div
          animate={prefersReduced ? {} : { x: [0, -80, 0], y: [0, 30, 0], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-40 right-10"
        >
          <Sparkles className="w-6 h-6 text-secondary/30" />
        </motion.div>
      </div>

      {/* ── Main content — staggered entrance orchestration ─────────────── */}
      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="visible"
        className="relative z-20 container mx-auto px-6 md:px-8 lg:px-12"
      >
        <div className="text-center max-w-4xl mx-auto">

          {/* Main Content Container */}
          <motion.div
            variants={heroItem}
            className="glass-card p-8 md:p-12 mb-8"
            style={{ backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
          >
            {/* Headline */}
            <motion.h1
              variants={heroItem}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6"
            >
              Making Dentistry More{' '}
              <motion.span
                className="text-gradient-primary inline-block"
                whileHover={prefersReduced ? {} : {
                  scale: 1.05,
                  filter: 'drop-shadow(0 0 20px rgba(136, 201, 161, 0.5))',
                }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                Human
              </motion.span>{' '}
              and{' '}
              <motion.span
                className="text-gradient-secondary inline-block"
                whileHover={prefersReduced ? {} : {
                  scale: 1.05,
                  filter: 'drop-shadow(0 0 20px rgba(181, 226, 250, 0.5))',
                }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                Accessible
              </motion.span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={heroItem}
              className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Join the movement redefining dental care through{' '}
              <span className="text-primary-light font-semibold">biomimetic science</span>,
              connecting students worldwide with affordable, accessible education.
            </motion.p>

            {/* Stats Bar */}
            <motion.div
              variants={heroItem}
              className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12"
            >
              {[
                { icon: Users,  text: '500+ Students',        color: 'text-secondary' },
                { icon: Globe,  text: '27 Countries',          color: 'text-secondary' },
                { icon: Heart,  text: '12 Courses Launched',   color: 'text-secondary' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <React.Fragment key={stat.text}>
                    {i > 0 && <div className="hidden md:block w-px h-6 bg-foreground/20" />}
                    <motion.div
                      variants={statPill}
                      whileHover={prefersReduced ? {} : { scale: 1.05, y: -5 }}
                      className="flex items-center gap-3 text-foreground/70 bg-white/25 px-6 py-3 rounded-full shadow-bio-glow border border-white/30 cursor-default"
                    >
                      <Icon className={`w-6 h-6 ${stat.color}`} aria-hidden="true" />
                      <span className="text-lg font-semibold">{stat.text}</span>
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={heroItem}
              className="flex flex-col md:flex-row gap-6 justify-center items-center"
            >
              <motion.div variants={ctaItem}>
                <Link href="/contact" passHref>
                  <motion.button
                    whileHover={prefersReduced ? {} : { scale: 1.05, y: -3 }}
                    whileTap={prefersReduced ? {} : { scale: 0.95 }}
                    className="btn-hero group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      Get In Touch
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </span>
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div variants={ctaItem}>
                <Link href="/ambassador/apply" passHref>
                  <motion.button
                    whileHover={prefersReduced ? {} : { scale: 1.05, y: -2 }}
                    whileTap={prefersReduced ? {} : { scale: 0.95 }}
                    className="btn-accent"
                  >
                    Join as Ambassador
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div variants={ctaItem}>
                <Link href="/blog" passHref>
                  <motion.button
                    whileHover={prefersReduced ? {} : { scale: 1.05, y: -2 }}
                    whileTap={prefersReduced ? {} : { scale: 0.95 }}
                    className="btn-accent bg-blue-500 hover:bg-blue-600 border-none text-white shadow-bio-glow"
                  >
                    Blog Registration
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div variants={ctaItem}>
                <Link href="/about" passHref>
                  <motion.button
                    whileHover={prefersReduced ? {} : { scale: 1.02 }}
                    whileTap={prefersReduced ? {} : { scale: 0.95 }}
                    className="btn-outline border-foreground/30 text-foreground hover:bg-foreground hover:text-background"
                  >
                    Learn More
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            variants={heroItem}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            whileHover={prefersReduced ? {} : {
              scale: 1.02,
              boxShadow: '0 25px 50px rgba(136, 201, 161, 0.2)',
            }}
            className="mt-16 p-8 glass-card max-w-3xl mx-auto"
            style={{ backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-foreground/80 text-lg leading-relaxed"
            >
              "Biomimetic dentistry isn't just about technique—it's about{' '}
              <motion.span
                whileHover={prefersReduced ? {} : { textShadow: '0 0 10px rgba(136, 201, 161, 0.3)' }}
                className="text-primary-light font-semibold cursor-pointer"
              >
                preserving natural tooth structure
              </motion.span>, {' '}
              <motion.span
                whileHover={prefersReduced ? {} : { textShadow: '0 0 10px rgba(181, 226, 250, 0.3)' }}
                className="text-secondary font-semibold cursor-pointer"
              >
                respecting biology
              </motion.span>, and{' '}
              <motion.span
                whileHover={prefersReduced ? {} : { textShadow: '0 0 10px rgba(232, 180, 184, 0.3)' }}
                className="text-accent font-semibold cursor-pointer"
              >
                making quality care accessible to all
              </motion.span>."
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
