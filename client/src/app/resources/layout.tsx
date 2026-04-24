import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resource Library',
  description:
    'Free and VIP clinical resources for biomimetic dentistry: protocols, case studies, research PDFs, and teaching materials curated by our leadership team.',
  keywords: [
    'dental resources',
    'biomimetic protocols',
    'clinical case studies',
    'dental PDFs',
    'adhesive dentistry guides',
  ],
  alternates: { canonical: '/resources' },
  openGraph: {
    title: 'Biomimetic Dentistry Resource Library',
    description:
      'Free and VIP clinical resources for biomimetic dentistry — protocols, cases, research PDFs, teaching materials.',
    url: '/resources',
    type: 'website',
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
