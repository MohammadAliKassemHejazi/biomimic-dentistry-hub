"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, Loader2 } from 'lucide-react';
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
  icon: React.ReactNode;
  popular?: boolean;
  stripe_price_id: string;
}

const initialTiers: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    interval: 'month',
    stripe_price_id: 'price_1S7EbEAI5O329ebg7Hqc1N1P',
    features: [
      'Access to basic courses',
      'Community forum access',
      'Monthly newsletter',
      'Basic resources library'
    ],
    icon: <Star className="h-6 w-6" />
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 99,
    interval: 'month',
    stripe_price_id: 'price_1S7EbnAI5O329ebgzZ5CxmIj',
    features: [
      'All Basic features',
      'VIP exclusive content',
      'Live Q&A sessions',
      'Advanced resources',
      'Priority support',
      'Certification courses'
    ],
    icon: <Crown className="h-6 w-6" />,
    popular: true
  },
  {
    id: 'ambassador',
    name: 'Ambassador',
    price: 199,
    interval: 'month',
    stripe_price_id: 'price_1S7Ec2AI5O329ebgXUxKBPK7',
    features: [
      'All VIP features',
      'Ambassador network access',
      'Mentorship programs',
      'Research collaborations',
      'Speaking opportunities',
      'Revenue sharing'
    ],
    icon: <Zap className="h-6 w-6" />
  }
];

const Subscription = () => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>(initialTiers);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: currentSubscription } = useSubscription();

  const getIconForKey = (key: string) => {
    switch(key) {
        case 'basic': return <Star className="h-6 w-6" />;
        case 'vip': return <Crown className="h-6 w-6" />;
        case 'ambassador': return <Zap className="h-6 w-6" />;
        default: return <Star className="h-6 w-6" />;
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
                icon: getIconForKey(p.key)
            }));
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
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
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
            {subscriptionTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative"
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card className={`h-full transition-all duration-200 hover:shadow-lg ${
                  tier.popular ? 'border-primary shadow-lg' : ''
                } ${user?.role === tier.id ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full ${
                        tier.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {tier.icon}
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <div className="text-center">
                      <span className="text-4xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground">/{tier.interval}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => createCheckoutSession(tier.stripe_price_id)}
                      disabled={loadingAction === tier.stripe_price_id || user?.role === tier.id}
                      className={`w-full ${tier.popular ? 'bg-primary' : ''}`}
                      variant={tier.popular ? 'default' : 'outline'}
                    >
                      {loadingAction === tier.stripe_price_id && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {user?.role === tier.id ? 'Current Plan' : `Get ${tier.name}`}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
