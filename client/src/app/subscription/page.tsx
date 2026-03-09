"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star, Zap, Loader2, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/queries/useSubscription';
import { api } from '@/lib/api';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  icon: any;
  popular?: boolean;
  stripe_price_id: string;
  color: string;
}

const Subscription = () => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: currentSubscription } = useSubscription();

  const getIconForKey = (key: string) => {
    switch(key) {
        case 'bronze': return Trophy;
        case 'silver': return Star;
        case 'gold': return Crown;
        default: return Star;
    }
  };

  const getColorForKey = (key: string) => {
    switch(key) {
        case 'bronze': return 'from-accent-light to-accent';
        case 'silver': return 'from-gray-300 to-gray-500';
        case 'gold': return 'from-secondary to-secondary-light';
        default: return 'from-primary to-primary-light';
    }
};

  React.useEffect(() => {
    api.get<any[]>('/plans').then((data) => {
        if (data && data.length > 0) {
            const mapped = data.map(p => ({
                id: p.key, // Using key as id for role matching
                name: p.name,
                price: parseFloat(p.price),
                interval: p.interval,
                stripe_price_id: p.stripePriceId,
                features: p.features,
                popular: p.popular,
                icon: getIconForKey(p.key),
                color: getColorForKey(p.key)
            }));
             // Sort plans by price to ensure correct order
             mapped.sort((a, b) => a.price - b.price);
            setSubscriptionTiers(mapped);
        }
    }).catch(console.error);
  }, []);

  const createCheckoutSession = async (priceId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    setLoadingAction(priceId);
    try {
      const { url } = await api.post<{ url: string }>('/subscriptions/checkout', { price_id: priceId });

      if (url) {
        window.open(url, '_blank');
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const manageBilling = async () => {
    setLoadingAction('manage');
    try {
      const { url } = await api.post<{ url: string }>('/subscriptions/portal', {});
      if (url) {
        window.open(url, '_blank');
      }
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock exclusive content and advance your dental career with our comprehensive training programs
            </p>
          </motion.div>

          {currentSubscription?.subscribed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 max-w-4xl mx-auto">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-200">
                        Active Subscription
                      </h3>
                      <p className="text-green-600 dark:text-green-300">
                        Your subscription is active{currentSubscription.subscription_end && ` until ${new Date(currentSubscription.subscription_end).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Button
                      onClick={manageBilling}
                      disabled={loadingAction === 'manage'}
                      variant="outline"
                    >
                      {loadingAction === 'manage' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Manage Billing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptionTiers.map((tier, index) => {
              const IconComponent = tier.icon;
              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`relative card-hover bg-card rounded-2xl p-8 shadow-medium fade-in-up stagger-${index + 1} ${
                    tier.popular ? 'ring-2 ring-secondary scale-105' : ''
                  } ${user?.role === tier.id ? 'ring-2 ring-primary' : ''}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${tier.color} rounded-2xl flex items-center justify-center`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{tier.name}</h3>
                    <p className="text-3xl font-bold text-primary">${tier.price}/{tier.interval}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                      onClick={() => createCheckoutSession(tier.stripe_price_id)}
                      disabled={loadingAction === tier.stripe_price_id || user?.role === tier.id}
                      className={`w-full font-semibold py-3 rounded-lg transition-smooth ${
                        tier.popular
                          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      {loadingAction === tier.stripe_price_id && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {user?.role === tier.id ? 'Current Plan' : `Get ${tier.name}`}
                    </Button>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground mb-4">
              All plans include a 30-day money-back guarantee
            </p>
            <p className="text-sm text-muted-foreground">
              Need help choosing? <Button variant="link" className="p-0 h-auto">Contact our team</Button>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Subscription;
