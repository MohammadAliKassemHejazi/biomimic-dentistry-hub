"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Star, Loader2, Trophy, CreditCard, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/queries/useSubscription';
import { api, describeError } from '@/lib/api';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  icon: any;
  popular?: boolean;
  stripe_price_id: string;
  paypal_plan_id: string | null;
  color: string;
}

interface PaymentModalProps {
  tier: SubscriptionTier;
  onClose: () => void;
  onStripe: () => void;
  onPayPal: () => void;
  loadingMethod: 'stripe' | 'paypal' | null;
}

const PaymentModal = ({ tier, onClose, onStripe, onPayPal, loadingMethod }: PaymentModalProps) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="payment-dialog-title"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close payment dialog"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>

      <div className="text-center mb-6">
        <h2 id="payment-dialog-title" className="text-2xl font-bold text-foreground mb-1">Choose Payment Method</h2>
        <p className="text-muted-foreground">
          {tier.name} — <span className="font-semibold text-primary">${tier.price}/{tier.interval}</span>
        </p>
      </div>

      <div className="space-y-3">
        {/* Stripe */}
        <button
          onClick={onStripe}
          disabled={loadingMethod !== null}
          className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#635bff]/10 rounded-lg flex items-center justify-center" aria-hidden="true">
              <CreditCard className="w-5 h-5 text-[#635bff]" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Pay with Stripe</p>
              <p className="text-sm text-muted-foreground">Credit / Debit card</p>
            </div>
          </div>
          {loadingMethod === 'stripe' ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" aria-label="Loading" />
          ) : (
            <span className="text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true">→</span>
          )}
        </button>

        {/* PayPal */}
        <button
          onClick={onPayPal}
          disabled={loadingMethod !== null || !tier.paypal_plan_id}
          className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-border hover:border-[#0070ba] hover:bg-[#0070ba]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0070ba]/10 rounded-lg flex items-center justify-center" aria-hidden="true">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.291-.077.44-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.103zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.082 3.996-.873 6.311-5.422 6.311H13.04c-.524 0-.968.382-1.05.9l-1.12 7.103H7.076L9.944.9H14.6c1.742 0 3.16.377 4.169 1.117.99.73 1.52 1.81 1.453 3.2z" fill="#009cde"/>
                <path d="M19.222 6.917c-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.103-.322 2.037a.641.641 0 0 0 .634.74h4.46c.457 0 .848-.334.92-.784l.038-.196.73-4.63.047-.255c.072-.45.462-.784.92-.784h.578c3.752 0 6.689-1.525 7.546-5.93.358-1.844.173-3.384-.775-4.467a3.71 3.71 0 0 0-.769-.531z" fill="#003087"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Pay with PayPal</p>
              <p className="text-sm text-muted-foreground">
                {tier.paypal_plan_id ? 'PayPal account or card' : 'Not available for this plan yet'}
              </p>
            </div>
          </div>
          {loadingMethod === 'paypal' ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" aria-label="Loading" />
          ) : (
            <span className="text-muted-foreground group-hover:text-[#0070ba] transition-colors" aria-hidden="true">→</span>
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-5">
        Secured payment · 30-day money-back guarantee
      </p>
    </motion.div>
  </div>
);

// ─── Skeleton fallback — matches the tier-card grid visual weight ─────────────
function SubscriptionSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-12 text-center">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto" aria-busy="true" aria-live="polite">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-8 shadow-medium">
                <Skeleton className="h-16 w-16 rounded-2xl mx-auto mb-4" />
                <Skeleton className="h-6 w-24 mx-auto mb-2" />
                <Skeleton className="h-8 w-32 mx-auto mb-6" />
                <div className="space-y-3 mb-8">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Content component — uses useSearchParams() at runtime ───────────────────
// Must be rendered inside a <Suspense> boundary (see default export below).
const SubscriptionContent = () => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [paymentLoadingMethod, setPaymentLoadingMethod] = useState<'stripe' | 'paypal' | null>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const { data: currentSubscription, refetch: refetchSubscription } = useSubscription(isAuthenticated);

  // F-W1 (Iter 3): Handle redirect params after payment.
  // Stripe redirects to ?success=true, PayPal to ?paypal_success=true&subscription_id=I-xxx,
  // and both redirect to ?canceled=true on cancel.
  useEffect(() => {
    const success = searchParams.get('success');
    const paypalSuccess = searchParams.get('paypal_success');
    const subscriptionId = searchParams.get('subscription_id');
    const canceled = searchParams.get('canceled');

    if (canceled === 'true') {
      toast({
        title: 'Payment cancelled',
        description: 'No changes were made to your plan.',
      });
      router.replace('/subscription');
      return;
    }

    if (success === 'true') {
      toast({
        title: 'Payment successful!',
        description: 'Your subscription is being activated — this may take a few seconds.',
      });
      // Refetch subscription status after a short delay to allow the webhook to process
      setTimeout(() => refetchSubscription(), 3000);
      router.replace('/subscription');
      return;
    }

    if (paypalSuccess === 'true' && subscriptionId) {
      // Confirm the PayPal subscription on the server side
      api
        .post('/subscriptions/paypal/confirm', { subscription_id: subscriptionId })
        .then(() => {
          toast({
            title: 'PayPal subscription activated!',
            description: 'Your subscription is now active.',
          });
          refetchSubscription();
        })
        .catch((err) => {
          toast({
            title: 'PayPal activation failed',
            description: describeError(err) || 'Please contact support if your subscription is not activated.',
            variant: 'destructive',
          });
        });
      router.replace('/subscription');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIconForKey = (key: string) => {
    switch (key) {
      case 'bronze': return Trophy;
      case 'silver': return Star;
      case 'gold': return Crown;
      default: return Star;
    }
  };

  const getColorForKey = (key: string) => {
    switch (key) {
      case 'bronze': return 'from-accent-light to-accent';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'gold': return 'from-secondary to-secondary-light';
      default: return 'from-primary to-primary-light';
    }
  };

  React.useEffect(() => {
    api
      .get<any[]>('/plans', { requiresAuth: false, skipErrorHandling: true })
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((p) => ({
            id: p.key,
            name: p.name,
            price: parseFloat(p.price),
            interval: p.interval,
            stripe_price_id: p.stripePriceId,
            paypal_plan_id: p.paypalPlanId || null,
            features: p.features,
            popular: p.popular,
            icon: getIconForKey(p.key),
            color: getColorForKey(p.key),
          }));
          mapped.sort((a, b) => a.price - b.price);
          setSubscriptionTiers(mapped);
        }
      })
      .catch((err) => console.error('Plans fetch failed', err))
      .finally(() => setLoadingTiers(false));
  }, []);

  const openPaymentModal = (tier: SubscriptionTier) => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to subscribe to a plan.',
      });
      return;
    }
    setSelectedTier(tier);
  };

  const handleStripeCheckout = async () => {
    if (!selectedTier) return;
    setPaymentLoadingMethod('stripe');
    try {
      const { url } = await api.post<{ url: string }>('/subscriptions/checkout', {
        price_id: selectedTier.stripe_price_id,
      });
      if (url) {
        // FE-07: same-tab redirect to avoid popup-blocker surprises.
        window.location.href = url;
      }
      setSelectedTier(null);
    } catch (error) {
      toast({
        title: 'Checkout failed',
        description: describeError(error) || 'Could not start Stripe checkout.',
        variant: 'destructive',
      });
    } finally {
      setPaymentLoadingMethod(null);
    }
  };

  const handlePayPalCheckout = async () => {
    if (!selectedTier) return;
    setPaymentLoadingMethod('paypal');
    try {
      const { url } = await api.post<{ url: string }>('/subscriptions/paypal/checkout', {
        plan_key: selectedTier.id,
      });
      if (url) window.location.href = url;
      setSelectedTier(null);
    } catch (error) {
      toast({
        title: 'Checkout failed',
        description: describeError(error) || 'Could not start PayPal checkout.',
        variant: 'destructive',
      });
    } finally {
      setPaymentLoadingMethod(null);
    }
  };

  const manageBilling = async () => {
    setLoadingAction('manage');
    try {
      const { url } = await api.post<{ url: string }>('/subscriptions/portal', {});
      if (url) window.location.href = url;
    } catch (error) {
      toast({
        title: 'Portal unavailable',
        description: describeError(error),
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {selectedTier && (
        <PaymentModal
          tier={selectedTier}
          onClose={() => setSelectedTier(null)}
          onStripe={handleStripeCheckout}
          onPayPal={handlePayPalCheckout}
          loadingMethod={paymentLoadingMethod}
        />
      )}

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
                        Your subscription is active
                        {currentSubscription.subscription_end &&
                          ` until ${new Date(currentSubscription.subscription_end).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Button
                      onClick={manageBilling}
                      disabled={loadingAction === 'manage'}
                      variant="outline"
                    >
                      {loadingAction === 'manage' && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />}
                      Manage Billing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!isAuthenticated && (
            <div className="mb-8 max-w-4xl mx-auto rounded-xl border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
              {' '}or{' '}
              <Link href="/signup" className="text-primary hover:underline font-medium">create an account</Link>
              {' '}to subscribe.
            </div>
          )}

          {loadingTiers ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto" aria-busy="true" aria-live="polite">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl p-8 shadow-medium">
                  <Skeleton className="h-16 w-16 rounded-2xl mx-auto mb-4" />
                  <Skeleton className="h-6 w-24 mx-auto mb-2" />
                  <Skeleton className="h-8 w-32 mx-auto mb-6" />
                  <div className="space-y-3 mb-8">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
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
                        <IconComponent className="w-8 h-8 text-white" aria-hidden="true" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">{tier.name}</h3>
                      <p className="text-3xl font-bold text-primary">${tier.price}/{tier.interval}</p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                            <div className="w-2 h-2 bg-secondary rounded-full"></div>
                          </div>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => openPaymentModal(tier)}
                      disabled={user?.role === tier.id}
                      className={`w-full font-semibold py-3 rounded-lg transition-smooth ${
                        tier.popular
                          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                      aria-label={user?.role === tier.id ? `${tier.name} — current plan` : `Choose ${tier.name} plan`}
                    >
                      {user?.role === tier.id ? 'Current Plan' : `Get ${tier.name}`}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}

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
              Need help choosing?{' '}
              <Link href="/contact" className="text-primary hover:underline">
                Contact our team
              </Link>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// ─── Page shell — statically renderable ──────────────────────────────────────
// Wraps the content component in <Suspense> so Next.js can pre-render this
// page without resolving search params at build time.
// The SubscriptionSkeleton fallback matches the page's visual weight so there
// is no layout shift when the client hydrates.
export default function SubscriptionPage() {
  return (
    <Suspense fallback={<SubscriptionSkeleton />}>
      <SubscriptionContent />
    </Suspense>
  );
}
