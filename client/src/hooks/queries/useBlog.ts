import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category: string;
  tags: string[];
  read_time: number;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export function useBlogPosts(published = true) {
  return useQuery<BlogPost[]>({
    queryKey: ['blog', { published }],
    queryFn: async () => {
      const res = await api.get<{ data: BlogPost[] } | BlogPost[]>(`/blog/posts?published=${published}`);
      return Array.isArray(res) ? res : (res as { data: BlogPost[] }).data ?? [];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery<BlogPost>({
    queryKey: ['blog', slug],
    queryFn: () => api.get<BlogPost>(`/blog/posts/${slug}`),
    enabled: !!slug,
  });
}
