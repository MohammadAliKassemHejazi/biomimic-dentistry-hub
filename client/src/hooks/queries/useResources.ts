import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  file_type: string;
  access_level: string;
  category: string;
  tags: string[];
  download_count: number;
  created_at: string;
}

export function useResources() {
  return useQuery<Resource[]>({
    queryKey: ['resources'],
    queryFn: () => api.get<Resource[]>('/resources'),
  });
}
