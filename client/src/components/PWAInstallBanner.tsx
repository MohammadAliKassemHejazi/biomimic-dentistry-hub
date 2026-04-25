"use client";

/**
 * FE-08 (Iter 4): PWA "Add to Home Screen" install prompt.
 *
 * Captures the `beforeinstallprompt` event (Chrome/Edge on Android),
 * stores the deferred prompt, and shows a sticky bottom banner.
 *
 * On iOS Safari the event doesn't fire — we detect iOS and show a
 * manual-instructions banner with Share → "Add to Home Screen" guidance.
 *
 * Dismissal is persisted to localStorage so the banner doesn't
 * reappear for 7 days after the user explicitly closes it.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa_banner_dismissed_until';
const DISMISS_DAYS = 7;

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function isDismissed(): boolean {
  if (typeof localStorage === 'undefined') return false;
  const until = localStorage.getItem(DISMISS_KEY);
  if (!until) return false;
  return Date.now() < Number(until);
}

function setDismissed() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
  }
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // Already installed or user dismissed recently — do nothing
    if (isInStandaloneMode() || isDismissed()) return;

    if (isIOS()) {
      // iOS: show manual instructions
      setShowIOS(true);
      return;
    }

    // Android / Desktop Chrome: capture the native prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDismissed();
    setShowAndroid(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed();
    setShowAndroid(false);
    setShowIOS(false);
  };

  return (
    <>
      {/* Android / Chrome banner */}
      <AnimatePresence>
        {showAndroid && (
          <motion.div
            key="android-banner"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-bottom"
          >
            <div className="max-w-lg mx-auto bg-card border rounded-2xl shadow-2xl p-4 flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl shrink-0">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight">Add to Home Screen</p>
                <p className="text-xs text-muted-foreground">
                  Install the Biomimetic Dentistry app for a faster, full-screen experience.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" onClick={handleInstall}>Install</Button>
                <button
                  aria-label="Dismiss"
                  onClick={handleDismiss}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Safari banner */}
      <AnimatePresence>
        {showIOS && (
          <motion.div
            key="ios-banner"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-bottom"
          >
            <div className="max-w-lg mx-auto bg-card border rounded-2xl shadow-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <p className="font-semibold text-sm">Add to Home Screen</p>
                </div>
                <button
                  aria-label="Dismiss"
                  onClick={handleDismiss}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                Tap
                <span className="inline-flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-foreground font-medium">
                  <Share className="h-3 w-3" /> Share
                </span>
                then
                <span className="bg-muted px-1.5 py-0.5 rounded text-foreground font-medium">
                  Add to Home Screen
                </span>
                to install this app.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
