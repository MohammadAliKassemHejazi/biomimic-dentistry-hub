import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about the Biomimetic Dentistry Club — our mission to make biomimetic dental care more human, accessible, and education-first for professionals worldwide.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Biomimetic Dentistry Club',
    description:
      'Our mission: make biomimetic dental care human, accessible, and education-first for professionals worldwide.',
    url: '/about',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
