"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, User, Calendar, Tag, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFavoritePosts } from '@/hooks/queries/useBlog';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SERVER_URL}${path}`;
}

const FavoritesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: posts = [], isLoading } = useFavoritePosts();

  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="h-10 w-10 text-secondary fill-current" />
              <h1 className="text-4xl md:text-6xl font-bold text-white">My Favorites</h1>
            </div>
            <p className="text-xl text-white/90">
              Blog posts you've saved for later.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="bg-card p-12 rounded-2xl shadow-soft max-w-2xl mx-auto">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-card-foreground mb-4">No favorites yet</h3>
                <p className="text-card-foreground/80 mb-6">
                  Start favoriting blog posts to see them here.
                </p>
                <Link href="/blog" className="text-primary underline underline-offset-4">
                  Browse the blog
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/blog/${post.slug}`} className="block h-full">
                    <Card className="h-full hover-scale group">
                      {resolveImageUrl(post.featured_image) ? (
                        <div className="aspect-video overflow-hidden rounded-t-lg relative">
                          <Image
                            src={resolveImageUrl(post.featured_image)!}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-muted flex items-center justify-center rounded-t-lg">
                          <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{post.category}</Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {post.read_time} min read
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <CardDescription className="mb-4 line-clamp-3">{post.excerpt}</CardDescription>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            {post.profiles?.first_name} {post.profiles?.last_name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(post.created_at)}
                          </div>
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {post.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="mr-1 h-2 w-2" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FavoritesPage;
