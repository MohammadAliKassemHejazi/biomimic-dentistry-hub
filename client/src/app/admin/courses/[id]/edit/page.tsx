"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { api, describeError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, BookOpen, Loader2, Shield } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price?: number;
  access_level?: string;
  coming_soon?: boolean;
  launch_date?: string;
  featured_image?: string;
  stripe_price_id?: string;
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accessLevel, setAccessLevel] = useState('public');
  const [comingSoon, setComingSoon] = useState('false');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ── Load course data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!params.id) return;

    const loadCourse = async () => {
      try {
        const courses = await api.get<Course[]>('/courses', { skipErrorHandling: true });
        const found = courses.find((c) => String(c.id) === String(params.id));
        if (!found) {
          toast({
            title: 'Course not found',
            description: `No course with id ${params.id}.`,
            variant: 'destructive',
          });
          router.push('/admin');
          return;
        }
        setCourse(found);
        setAccessLevel(found.access_level ?? 'public');
        setComingSoon(found.coming_soon ? 'true' : 'false');
        if (found.featured_image) {
          setImagePreview(found.featured_image);
        }
      } catch (err) {
        toast({
          title: 'Failed to load course',
          description: describeError(err),
          variant: 'destructive',
        });
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-primary" aria-label="Loading" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto py-20 text-center">
        <Shield className="mx-auto h-12 w-12 text-destructive mb-4" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          Admin privileges are required to edit courses.
        </p>
        <Button asChild className="mt-6">
          <Link href="/admin">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // ── Form submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!course) return;
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    // Inject controlled Select values
    formData.set('access_level', accessLevel);
    formData.set('coming_soon', comingSoon);

    try {
      await api.put(`/courses/${course.id}`, formData, { requiredRole: 'admin' });
      toast({
        title: 'Course updated',
        description: 'The course has been saved successfully.',
      });
      router.push('/admin');
    } catch (error) {
      toast({
        title: 'Could not update course',
        description: describeError(error),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── New image preview ────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto py-8 px-4 pt-24 max-w-2xl">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Back to Admin
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Edit Course</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Update the information below. Fields marked with{' '}
            <span className="text-destructive">*</span> are required.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            encType="multipart/form-data"
          >
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={course?.title}
                placeholder="e.g. Biomimetic Adhesive Techniques"
                required
                autoFocus
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug (URL-friendly) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={course?.slug}
                placeholder="e.g. biomimetic-adhesive-techniques"
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers and hyphens only"
                required
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only. Changing the slug
                will update the course URL.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={course?.description}
                placeholder="What will students learn from this course?"
              />
            </div>

            {/* Price + Access Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (USD) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={course?.price ?? 0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access_level">Access Level</Label>
                <Select value={accessLevel} onValueChange={setAccessLevel}>
                  <SelectTrigger id="access_level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="vip">VIP Only</SelectItem>
                    <SelectItem value="ambassador">Ambassador Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Coming Soon + Launch Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coming_soon">Status</Label>
                <Select value={comingSoon} onValueChange={setComingSoon}>
                  <SelectTrigger id="coming_soon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Available Now</SelectItem>
                    <SelectItem value="true">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="launch_date">Launch Date (optional)</Label>
                <Input
                  id="launch_date"
                  name="launch_date"
                  type="date"
                  defaultValue={
                    course?.launch_date
                      ? course.launch_date.split('T')[0]
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label htmlFor="featured_image">Featured Image</Label>

              {/* Current image thumbnail */}
              {imagePreview && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    Current image (upload a new file below to replace):
                  </p>
                  <div className="relative h-32 w-48 rounded-md overflow-hidden border bg-muted">
                    <Image
                      src={imagePreview}
                      alt="Current featured image"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              <Input
                id="featured_image"
                name="featured_image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to keep the current image. Accepted: JPG, PNG,
                WebP, GIF. Max 10 MB.
              </p>
            </div>

            {/* Stripe Price ID */}
            <div className="space-y-2">
              <Label htmlFor="stripe_price_id">
                Stripe Price ID (optional)
              </Label>
              <Input
                id="stripe_price_id"
                name="stripe_price_id"
                defaultValue={course?.stripe_price_id}
                placeholder="price_xxx"
              />
              <p className="text-xs text-muted-foreground">
                Only needed if this course requires a paid Stripe checkout.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting && (
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {submitting ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
