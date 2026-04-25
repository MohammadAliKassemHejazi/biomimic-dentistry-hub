"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, Upload } from 'lucide-react';
import { api } from '@/lib/api';

export default function AmbassadorApplyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    country: '',
    experience: '',
    bio: '',
    social_media_links: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fix: never call router.push() during render — use useEffect for side-effect navigation
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
    } else if (user.is_ambassador || user.role === 'admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  // Already an ambassador/admin — show spinner while redirect is in flight
  if (user.is_ambassador || user.role === 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append('country', formData.country);
      body.append('experience', formData.experience);
      body.append('bio', formData.bio);
      body.append('social_media_links', formData.social_media_links);
      if (cvFile) {
        body.append('cv', cvFile);
      }

      await api.post('/ambassadors/apply', body);
      toast({ title: 'Application Submitted', description: 'We will review your application shortly.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: 'Submission failed', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Star className="h-6 w-6 text-secondary" />
            Ambassador Application
          </CardTitle>
          <CardDescription>
            Tell us about yourself and why you want to be an ambassador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. United Kingdom"
                required
              />
              <p className="text-[0.8rem] text-muted-foreground">Where are you currently practicing?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 5 years"
                required
              />
              <p className="text-[0.8rem] text-muted-foreground">How long have you been in the dental field?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio / Motivation</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="I am passionate about biomimetic dentistry because..."
                rows={4}
                required
              />
              <p className="text-[0.8rem] text-muted-foreground">Share your background and why you want to join us.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_media_links">Social Media Links</Label>
              <Input
                id="social_media_links"
                value={formData.social_media_links}
                onChange={(e) => setFormData({ ...formData, social_media_links: e.target.value })}
                placeholder="e.g. Instagram/Facebook links where you share cases"
                required
              />
              <p className="text-[0.8rem] text-muted-foreground">Where you share your biomimetic cases.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv">CV (Optional)</Label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="cv"
                  className="flex items-center gap-2 cursor-pointer border border-input rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex-1"
                >
                  <Upload className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {cvFile ? cvFile.name : 'Choose file (PDF, DOC, DOCX)'}
                  </span>
                </label>
                <input
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                />
                {cvFile && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCvFile(null)}>
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-[0.8rem] text-muted-foreground">Optional: Upload your curriculum vitae.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
