"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { resolveUploadUrl } from '@/lib/env';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Share2,
  Eye,
  Calendar,
  User,
  Clock,
  Copy,
  MessageCircle,
  Twitter,
  Facebook,
  Mail,
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import DOMPurify from 'isomorphic-dompurify';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BlogPost {
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
  view_count: number;
  is_favorited: boolean;
  images?: string[];
  profiles: { first_name: string; last_name: string };
}

interface Props {
  slug: string;
  initialPost: BlogPost | null;
}

export default function BlogPostClient({ slug, initialPost }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [loading, setLoading] = useState<boolean>(!initialPost);
  const [favorited, setFavorited] = useState<boolean>(initialPost?.is_favorited ?? false);
  const [viewRecorded, setViewRecorded] = useState(false);

  // Re-fetch when user changes so is_favorited reflects the logged-in state.
  // If initialPost is present, we still refetch to hydrate favorite status.
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      try {
        const data = await api.get<BlogPost>(`/blog/posts/${slug}`, {
          requiresAuth: false,
          skipErrorHandling: true,
        });
        if (!cancelled) {
          setPost(data);
          setFavorited(data.is_favorited);
        }
      } catch {
        // Silent — fall back to initialPost if present
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, user]);

  // FE-06 (Iter 1): record views for ALL viewers, including guests — backend dedupes by IP.
  useEffect(() => {
    if (!post?.id || viewRecorded) return;
    api
      .post(`/blog/posts/${post.id}/view`, {}, { requiresAuth: false, skipErrorHandling: true })
      .then(() => setViewRecorded(true))
      .catch((err) => console.error('view record failed', err));
  }, [post?.id, viewRecorded]);

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to favorite posts.',
      });
      return;
    }
    if (!post) return;

    try {
      const res = await api.post<{ favorited: boolean }>(
        `/blog/posts/${post.id}/favorite`,
        {}
      );
      setFavorited(res.favorited);
      toast({
        title: res.favorited ? 'Added to favorites' : 'Removed from favorites',
      });
    } catch (err: any) {
      toast({
        title: 'Failed',
        description: err?.message || 'Could not update favorites',
        variant: 'destructive',
      });
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    toast({ title: 'Link copied', description: 'Blog post link copied to clipboard.' });
  };

  const handleShareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent((post?.title ?? '') + ' ' + currentUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post?.title ?? '')}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(post?.title ?? '')}&body=${encodeURIComponent(currentUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  if (loading && !post) {
    return (
      <div className="container mx-auto pt-24 pb-12 px-4 max-w-4xl">
        <Skeleton className="h-6 w-24 mb-4" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="aspect-video w-full mb-8 rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }
  if (!post) {
    return (
      <div className="text-center p-20">
        <h1 className="text-2xl font-semibold mb-2">Post not found</h1>
        <p className="text-muted-foreground">The blog post you are looking for does not exist.</p>
      </div>
    );
  }

  const featured = resolveUploadUrl(post.featured_image);

  return (
    <article className="container mx-auto pt-24 pb-12 px-4 max-w-4xl">
      <header className="mb-8">
        <Badge variant="secondary" className="mb-4">{post.category}</Badge>
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" aria-hidden="true" />
            <span>
              {post.profiles.first_name} {post.profiles.last_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString()}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{post.read_time} min read</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" aria-hidden="true" />
            <span>{post.view_count} views</span>
          </div>
        </div>
      </header>

      {featured && (
        <div className="mb-8 rounded-xl overflow-hidden aspect-video relative">
          <Image
            src={featured}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            priority
            className="object-cover"
          />
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none mb-8">
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(post.content ? post.content.replace(/\n/g, '<br/>') : ''),
          }}
        />
      </div>

      {/* FE-03 (Iter 4): Render content images uploaded alongside the post */}
      {post.images && post.images.length > 0 && (
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Post Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {post.images.map((imgPath, idx) => {
              const src = resolveUploadUrl(imgPath);
              if (!src) return null;
              return (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border">
                  <Image
                    src={src}
                    alt={post.title + ' image ' + (idx + 1)}
                    fill
                    sizes="(max-width: 768px) 100vw, 448px"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <footer className="flex items-center justify-between border-t pt-8 flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">#{tag.trim()}</Badge>
          ))}
        </div>
        <div className="flex gap-4">
          <Button
            variant={favorited ? 'default' : 'outline'}
            onClick={handleFavorite}
            aria-pressed={favorited}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`mr-2 h-4 w-4 ${favorited ? 'fill-current' : ''}`} aria-hidden="true" />
            {favorited ? 'Favorited' : 'Favorite'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-label="Share this post">
                <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Share this post</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareWhatsApp}>
                <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareTwitter}>
                <Twitter className="mr-2 h-4 w-4" aria-hidden="true" />
                Twitter / X
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareFacebook}>
                <Facebook className="mr-2 h-4 w-4" aria-hidden="true" />
                Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareEmail}>
                <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </footer>
    </article>
  );
}
