"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { resolveUploadUrl } from '@/lib/env';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Bell,
  ShoppingCart,
  Lock,
  BookOpen,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Footer from '@/components/Footer';

interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  featured_image?: string;
  coming_soon: boolean;
  launch_date?: string;
  access_level: string;
  stripe_price_id?: string;
  created_at: string;
}

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    if (!params?.slug) return;
    (async () => {
      try {
        const data = await api.get<Course>(`/courses/${params.slug}`, {
          requiresAuth: false,
          skipErrorHandling: true,
        });
        setCourse(data);
      } catch {
        setCourse(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.slug]);

  const handleNotify = async () => {
    if (!notifyEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail)) {
      toast({ title: 'Invalid email', variant: 'destructive' });
      return;
    }
    setNotifying(true);
    try {
      await api.post(`/courses/${course!.id}/notify`, { email: notifyEmail }, {
        requiresAuth: false,
        skipErrorHandling: true,
      });
      toast({
        title: "You're on the list!",
        description: "We'll notify you when this course launches.",
      });
      setNotifyEmail('');
    } catch {
      toast({ title: 'Failed', description: 'Could not save your email. Try again.', variant: 'destructive' });
    } finally {
      setNotifying(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  if (loading) {
    return (
      <div className="container mx-auto py-8 pt-24 max-w-4xl px-4">
        <Skeleton className="h-6 w-24 mb-6" />
        <Skeleton className="aspect-video w-full rounded-xl mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-20 pt-32 text-center px-4">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Course not found</h1>
        <p className="text-muted-foreground mb-6">This course doesn't exist or has been removed.</p>
        <Button asChild><Link href="/courses">Browse Courses</Link></Button>
      </div>
    );
  }

  const featuredSrc = resolveUploadUrl(course.featured_image ?? null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 pt-24 max-w-4xl px-4">
        {/* Back link */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>

        {/* Featured image */}
        {featuredSrc && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl overflow-hidden aspect-video relative shadow-lg"
          >
            <Image
              src={featuredSrc}
              alt={course.title}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              priority
              className="object-cover"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant={course.coming_soon ? 'secondary' : 'default'}>
              {course.coming_soon ? 'Coming Soon' : 'Available Now'}
            </Badge>
            {course.access_level !== 'public' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                {course.access_level === 'vip' ? 'VIP Only' : 'Ambassador Only'}
              </Badge>
            )}
          </div>

          {/* Title + price */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
            <div className="text-3xl font-bold text-primary shrink-0">
              {formatPrice(Number(course.price))}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Added {new Date(course.created_at).toLocaleDateString()}</span>
            </div>
            {course.launch_date && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Launches {new Date(course.launch_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {course.description && (
            <div className="prose dark:prose-invert max-w-none mb-10">
              <p className="text-base leading-relaxed text-foreground/80 whitespace-pre-line">
                {course.description}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="bg-muted/40 rounded-2xl p-6 border">
            {course.coming_soon ? (
              <div className="space-y-4">
                <p className="font-semibold text-lg">Be the first to know when this launches</p>
                <div className="flex gap-3 max-w-md">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={notifyEmail}
                    onChange={e => setNotifyEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNotify()}
                    className="flex-1"
                  />
                  <Button onClick={handleNotify} disabled={notifying}>
                    <Bell className="mr-2 h-4 w-4" />
                    {notifying ? 'Saving…' : 'Notify Me'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-lg">Ready to enroll?</p>
                  <p className="text-muted-foreground text-sm">Get instant access to all course materials.</p>
                </div>
                <Button size="lg" className="w-full sm:w-auto">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Enroll — {formatPrice(Number(course.price))}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
