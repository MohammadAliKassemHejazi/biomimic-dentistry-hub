import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ambassador Program',
  description:
    'Become a Biomimetic Dentistry Club Ambassador. Represent our global mission, earn rewards, and help bring minimally invasive dental education to your community.',
  keywords: [
    'dental ambassador program',
    'biomimetic dentistry ambassador',
    'dental education advocate',
    'student dental ambassador',
    'dental community leader',
  ],
  alternates: { canonical: '/ambassador' },
  openGraph: {
    title: 'Ambassador Program — Biomimetic Dentistry Club',
    description:
      'Represent our global mission, earn rewards, and help bring minimally invasive dental education to your community.',
    url: '/ambassador',
    type: 'website',
  },
};

export default function AmbassadorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
