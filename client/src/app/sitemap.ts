import type { MetadataRoute } from 'next';
import { SITE_URL, API_URL } from '@/lib/env';

// Revalidate sitemap hourly. Architect decision (Iter 2 #2).
export const revalidate = 3600;

interface BlogListItem {
  slug: string;
  created_at?: string;
  updated_at?: string;
}

interface BlogListResponse {
  data: BlogListItem[];
  meta?: { total: number };
}

async function fetchPublishedBlogSlugs(): Promise<BlogListItem[]> {
  try {
    const res = await fetch(
      `${API_URL}/blog/posts?published=true&page=1&limit=1000`,
      {
        // ISR at the fetch layer — keep CDN load light.
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const body = (await res.json()) as BlogListResponse | BlogListItem[];
    if (Array.isArray(body)) return body;
    return body?.data ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/courses`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/resources`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/partnership`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/subscription`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/ambassador`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const posts = await fetchPublishedBlogSlugs();
  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : (p.created_at ? new Date(p.created_at) : now),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
