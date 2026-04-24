import type { Metadata } from 'next';
import Script from 'next/script';
import { API_URL, SITE_URL, resolveUploadUrl } from '@/lib/env';
import BlogPostClient from './BlogPostClient';

interface BlogDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  category: string;
  tags: string[];
  read_time: number;
  created_at: string;
  updated_at?: string;
  view_count: number;
  is_favorited: boolean;
  profiles: { first_name: string; last_name: string };
}

// Architect decision (Iter 2 #4): server fetch uses ISR so crawlers don't
// hammer the DB. 5 min revalidation is a reasonable balance.
async function fetchPostSsr(slug: string): Promise<BlogDetail | null> {
  try {
    const res = await fetch(`${API_URL}/blog/posts/${slug}`, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as BlogDetail;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostSsr(slug);

  if (!post) {
    return {
      title: 'Post not found',
      description: 'The blog post you are looking for does not exist.',
      robots: { index: false, follow: false },
    };
  }

  const ogImage = resolveUploadUrl(post.featured_image) || `${SITE_URL}/logo.png`;
  const url = `${SITE_URL}/blog/${post.slug}`;
  const author = `${post.profiles?.first_name ?? ''} ${post.profiles?.last_name ?? ''}`.trim() || 'Biomimetic Dentistry Club';

  return {
    title: post.title,
    description: post.excerpt,
    keywords: Array.isArray(post.tags) ? post.tags : undefined,
    authors: [{ name: author }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt,
      siteName: 'Biomimetic Dentistry Club',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: [author],
      tags: post.tags,
      images: [{ url: ogImage, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await fetchPostSsr(slug);

  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: resolveUploadUrl(post.featured_image) || `${SITE_URL}/logo.png`,
        datePublished: post.created_at,
        dateModified: post.updated_at || post.created_at,
        author: {
          '@type': 'Person',
          name:
            `${post.profiles?.first_name ?? ''} ${post.profiles?.last_name ?? ''}`.trim() ||
            'Biomimetic Dentistry Club',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Biomimetic Dentistry Club',
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE_URL}/blog/${post.slug}`,
        },
        keywords: Array.isArray(post.tags) ? post.tags.join(', ') : undefined,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <Script
          id="blog-post-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogPostClient slug={slug} initialPost={post} />
    </>
  );
}
