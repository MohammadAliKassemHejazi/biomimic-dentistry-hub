import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VIP Membership',
  description:
    'Choose a Bronze, Silver, or VIP plan to unlock exclusive biomimetic dentistry courses, mentorship, and clinical resources. 30-day money-back guarantee.',
  alternates: { canonical: '/subscription' },
  openGraph: {
    title: 'VIP Membership — Biomimetic Dentistry Club',
    description:
      'Bronze, Silver, and VIP plans for dental professionals. Exclusive courses, mentorship, and clinical resources.',
    url: '/subscription',
    type: 'website',
  },
};

export default function SubscriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
