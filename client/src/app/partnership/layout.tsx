import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partnership Opportunities',
  description:
    'Partner with the Biomimetic Dentistry Club. Reach a global community of dental students, clinicians, and educators through our sponsorship tiers.',
  alternates: { canonical: '/partnership' },
  openGraph: {
    title: 'Partner with the Biomimetic Dentistry Club',
    description:
      'Reach a global community of dental students, clinicians, and educators through our sponsorship tiers.',
    url: '/partnership',
    type: 'website',
  },
};

export default function PartnershipLayout({ children }: { children: React.ReactNode }) {
  return children;
}
