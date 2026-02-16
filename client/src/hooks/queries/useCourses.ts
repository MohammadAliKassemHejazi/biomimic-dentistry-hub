import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  featured_image?: string;
  coming_soon: boolean;
  launch_date?: string;
  access_level: string;
  stripe_price_id?: string;
  created_at: string;
}

export function useCourses() {
  return useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: () => api.get<Course[]>('/courses'),
  });
}
