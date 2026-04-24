import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Biomimetic Dentistry Club. Questions about courses, memberships, partnerships, or the ambassador program — we reply within 48 hours.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact the Biomimetic Dentistry Club',
    description:
      'Questions about courses, memberships, partnerships, or the ambassador program — we reply within 48 hours.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
