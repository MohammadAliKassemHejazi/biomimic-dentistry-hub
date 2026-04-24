import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Latest articles, clinical tips, and research updates on biomimetic dentistry — written by and for the global dental community.',
  keywords: [
    'biomimetic dentistry blog',
    'dental articles',
    'clinical tips',
    'research updates',
    'adhesive dentistry',
  ],
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Biomimetic Dentistry Club Blog',
    description:
      'Latest articles, clinical tips, and research updates on biomimetic dentistry — written by and for the global dental community.',
    url: '/blog',
    type: 'website',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
