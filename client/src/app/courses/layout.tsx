import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Courses',
  description:
    'Online biomimetic dentistry courses, workshops, and live webinars for dental students and practicing clinicians. Self-paced and cohort-based formats available.',
  keywords: [
    'biomimetic dentistry courses',
    'dental education online',
    'adhesive dentistry training',
    'minimally invasive dentistry',
    'dental CE',
  ],
  alternates: { canonical: '/courses' },
  openGraph: {
    title: 'Biomimetic Dentistry Courses',
    description:
      'Online biomimetic dentistry courses, workshops, and live webinars for dental students and practicing clinicians.',
    url: '/courses',
    type: 'website',
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
