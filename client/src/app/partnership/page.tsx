"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, Star, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PartnershipPage() {
  const tiers = [
    {
      name: "Free Partnership",
      icon: <Star className="w-12 h-12 text-muted-foreground" />,
      color: "from-gray-300 to-gray-500",
      description: "Join us as a partner in our live courses.",
      features: [
        "Partner in live courses",
        "Logo on course materials",
        "Community engagement"
      ],
      price: "Free"
    },
    {
      name: "Silver Partnership",
      icon: <Shield className="w-12 h-12 text-slate-400" />,
      color: "from-slate-400 to-slate-600",
      description: "Gain visibility and collaborate with our growing network.",
      features: [
        "Everything in Free",
        "Quarterly dedicated posts",
        "Logo in partner directory",
        "Access to basic analytics"
      ],
      price: "Contact Us"
    },
    {
      name: "Gold Partnership",
      icon: <Award className="w-12 h-12 text-yellow-500" />,
      color: "from-yellow-400 to-yellow-600",
      description: "Deep integration and premium exposure to our VIPs.",
      features: [
        "Everything in Silver",
        "One dedicated post per month",
        "Priority placement on website",
        "Exclusive webinar co-hosting"
      ],
      price: "Contact Us",
      popular: true
    },
    {
      name: "VIP Partnership",
      icon: <Zap className="w-12 h-12 text-primary" />,
      color: "from-primary to-primary-light",
      description: "The ultimate partnership for maximum impact and reach.",
      features: [
        "Everything in Gold",
        "Weekly dedicated posts",
        "Headline sponsor at main events",
        "Strategic joint research projects",
        "Custom integration into our curriculum"
      ],
      price: "Contact Us"
    }
  ];

  return (
    <div className="min-h-screen bg-background">

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Partnership Opportunities
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground"
            >
              Collaborate with us to advance biomimetic dentistry. Choose a partnership tier that aligns with your organization's goals.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="relative h-full"
              >
                <Card className={`h-full flex flex-col ${tier.popular ? 'border-primary shadow-lg ring-1 ring-primary' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full">
                      Recommended
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      {tier.icon}
                    </div>
                    <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                    <CardDescription className="text-base">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="text-3xl font-bold text-center mb-6 py-4 border-y border-border/50">
                      {tier.price}
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={tier.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link href="/contact">
                        Become a Partner
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20 text-center bg-muted/30 p-12 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-4">Ready to collaborate?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              If you have specific requirements or want to discuss custom partnership opportunities, our team is ready to help you find the perfect fit.
            </p>
            <Button size="lg" asChild>
              <Link href="/contact" className="gap-2">
                Contact Our Team <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
