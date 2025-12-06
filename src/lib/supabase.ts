import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tables = {
  profiles: {
    Row: {
      id: string;
      created_at: string;
      email: string;
      first_name: string | null;
      last_name: string | null;
      role: 'user' | 'vip' | 'ambassador' | 'admin';
      avatar_url: string | null;
    };
    Insert: {
      id: string;
      email: string;
      first_name?: string | null;
      last_name?: string | null;
      role?: 'user' | 'vip' | 'ambassador' | 'admin';
      avatar_url?: string | null;
    };
    Update: {
      first_name?: string | null;
      last_name?: string | null;
      role?: 'user' | 'vip' | 'ambassador' | 'admin';
      avatar_url?: string | null;
    };
  };
  blog_posts: {
    Row: {
      id: string;
      created_at: string;
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      featured_image: string | null;
      author_id: string;
      published: boolean;
      category: string;
      tags: string[];
      read_time: number;
    };
    Insert: {
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      featured_image?: string | null;
      author_id: string;
      published?: boolean;
      category: string;
      tags?: string[];
      read_time: number;
    };
    Update: {
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      featured_image?: string | null;
      published?: boolean;
      category?: string;
      tags?: string[];
      read_time?: number;
    };
  };
  courses: {
    Row: {
      id: string;
      created_at: string;
      title: string;
      slug: string;
      description: string;
      price: number;
      featured_image: string | null;
      coming_soon: boolean;
      launch_date: string | null;
    };
    Insert: {
      title: string;
      slug: string;
      description: string;
      price: number;
      featured_image?: string | null;
      coming_soon?: boolean;
      launch_date?: string | null;
    };
    Update: {
      title?: string;
      description?: string;
      price?: number;
      featured_image?: string | null;
      coming_soon?: boolean;
      launch_date?: string | null;
    };
  };
  resources: {
    Row: {
      id: string;
      created_at: string;
      title: string;
      description: string;
      file_url: string;
      file_type: string;
      access_level: 'public' | 'vip' | 'ambassador';
    };
    Insert: {
      title: string;
      description: string;
      file_url: string;
      file_type: string;
      access_level?: 'public' | 'vip' | 'ambassador';
    };
    Update: {
      title?: string;
      description?: string;
      file_url?: string;
      file_type?: string;
      access_level?: 'public' | 'vip' | 'ambassador';
    };
  };
};