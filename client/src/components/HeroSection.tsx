"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Users, Globe, Leaf, Sparkles } from 'lucide-react';
import Link from 'next/link';
import heroBg from '../assets/hero-bg.jpg';
import BiomimeticTooth3D from './BiomimeticTooth3D';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-bio-mint/5 to-enamel-sky/10 pt-20">
      {/* Background Image with Nature's Overlay */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.08 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${heroBg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* 3D Tooth Animation */}
      <BiomimeticTooth3D />

      {/* Organic Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Bio Mint floating orbs */}
        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotate: [-2, 2, -2]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 right-20 w-24 h-24 bg-secondary/15 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [-15, 15, -15],
            x: [-5, 5, -5],
            rotate: [-3, 3, -3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-20 left-1/4 w-40 h-40 bg-accent/8 rounded-full blur-2xl"
        />

        {/* Floating leaf elements */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-32 right-1/3"
        >
          <Leaf className="w-8 h-8 text-primary/20" />
        </motion.div>

        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-40 right-10"
        >
          <Sparkles className="w-6 h-6 text-secondary/30" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          staggerChildren: 0.2,
          delayChildren: 0.3
        }}
        className="relative z-20 container mx-auto px-6 md:px-8 lg:px-12"
      >
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Content Container with Glass Effect */}
          <div className="glass-card p-8 md:p-12 mb-8">
            {/* Main Headline with organic animation */}
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                type: "spring",
                damping: 20
              }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6"
            >
              Making Dentistry More{' '}
              <motion.span
                className="text-gradient-primary inline-block"
                whileHover={{
                  scale: 1.05,
                  filter: "drop-shadow(0 0 20px rgba(136, 201, 161, 0.5))"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Human
              </motion.span>{' '}
              and{' '}
              <motion.span
                className="text-gradient-secondary inline-block"
                whileHover={{
                  scale: 1.05,
                  filter: "drop-shadow(0 0 20px rgba(181, 226, 250, 0.5))"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Accessible
              </motion.span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Join the movement redefining dental care through{' '}
              <span className="text-primary-light font-semibold">biomimetic science</span>,
              connecting students worldwide with affordable, accessible education.
            </motion.p>

            {/* Animated Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-3 text-foreground/70 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-bio-glow border border-white/20"
              >
                <Users className="w-6 h-6 text-secondary" />
                <span className="text-lg font-semibold">500+ Students</span>
              </motion.div>

              <div className="hidden md:block w-px h-6 bg-foreground/20"></div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-3 text-foreground/70 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-bio-glow border border-white/20"
              >
                <Globe className="w-6 h-6 text-secondary" />
                <span className="text-lg font-semibold">27 Countries</span>
              </motion.div>

              <div className="hidden md:block w-px h-6 bg-foreground/20"></div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-3 text-foreground/70 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-bio-glow border border-white/20"
              >
                <Heart className="w-6 h-6 text-secondary" />
                <span className="text-lg font-semibold">12 Courses Launched</span>
              </motion.div>
            </motion.div>

            {/* CTA Buttons with organic hover effects */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col md:flex-row gap-6 justify-center items-center"
            >
              <Link href="/donate" passHref>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    y: -3
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-hero group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Support Our Mission
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </motion.button>
              </Link>

              <Link href="/dashboard" passHref>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    y: -2
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-accent"
                >
                  Join as Ambassador
                </motion.button>
              </Link>

              <Link href="/signup" passHref>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    y: -2
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-accent bg-blue-500 hover:bg-blue-600 border-none text-white shadow-bio-glow"
                >
                  Blog Registration
                </motion.button>
              </Link>

              <Link href="/about" passHref>
                <motion.button
                  whileHover={{
                    scale: 1.02
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-outline border-foreground/30 text-foreground hover:bg-foreground hover:text-background"
                >
                  Learn More
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Mission Statement with glass morphism */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 25px 50px rgba(136, 201, 161, 0.2)"
            }}
            className="mt-16 p-8 glass-card max-w-3xl mx-auto"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-foreground/80 text-lg leading-relaxed"
            >
              "Biomimetic dentistry isn't just about technique—it's about{' '}
              <motion.span
                whileHover={{
                  color: "hsl(var(--primary-light))",
                  textShadow: "0 0 10px rgba(136, 201, 161, 0.3)"
                }}
                className="text-primary-light font-semibold cursor-pointer"
              >
                preserving natural tooth structure
              </motion.span>, {' '}
              <motion.span
                whileHover={{
                  color: "hsl(var(--secondary))",
                  textShadow: "0 0 10px rgba(181, 226, 250, 0.3)"
                }}
                className="text-secondary font-semibold cursor-pointer"
              >
                respecting biology
              </motion.span>, and{' '}
              <motion.span
                whileHover={{
                  color: "hsl(var(--accent))",
                  textShadow: "0 0 10px rgba(232, 180, 184, 0.3)"
                }}
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