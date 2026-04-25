"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

export default function NewCoursePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [accessLevel, setAccessLevel] = useState('public');
  const [comingSoon, setComingSoon] = useState('false');

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (authLoading) {
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
          Admin privileges are required to create courses.
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
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    // Inject controlled Select values that aren't native form fields
    formData.set('access_level', accessLevel);
    formData.set('coming_soon', comingSoon);

    try {
      await api.post('/courses', formData, { requiredRole: 'admin' });
      toast({
        title: 'Course created',
        description: 'Your new course is now live in the catalogue.',
      });
      router.push('/admin');
    } catch (error) {
      toast({
        title: 'Could not create course',
        description: describeError(error),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
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
          <h1 className="text-2xl font-bold">Add New Course</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Fill in the information below. Fields marked with{' '}
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
                placeholder="e.g. biomimetic-adhesive-techniques"
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers and hyphens only"
                required
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only. Used in the course
                URL (e.g. /courses/biomimetic-adhesive-techniques).
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
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
                  defaultValue="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access_level">Access Level</Label>
                <Select
                  value={accessLevel}
                  onValueChange={setAccessLevel}
                >
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
                <Select
                  value={comingSoon}
                  onValueChange={setComingSoon}
                >
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
                <Input id="launch_date" name="launch_date" type="date" />
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label htmlFor="featured_image">Featured Image</Label>
              <Input
                id="featured_image"
                name="featured_image"
                type="file"
                accept="image/*"
              />
              <p className="text-xs text-muted-foreground">
                Accepted: JPG, PNG, WebP, GIF. Max 10 MB.
              </p>
            </div>

            {/* Stripe Price ID */}
            <div className="space-y-2">
              <Label htmlFor="stripe_price_id">Stripe Price ID (optional)</Label>
              <Input
                id="stripe_price_id"
                name="stripe_price_id"
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
                {submitting ? 'Creating…' : 'Create Course'}
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
