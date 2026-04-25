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
import { ArrowLeft, FileText, Loader2, Shield } from 'lucide-react';

export default function NewResourcePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [fileType, setFileType] = useState('PDF');
  const [accessLevel, setAccessLevel] = useState('public');

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
          Admin privileges are required to create resources.
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
    // Inject controlled Select values
    formData.set('file_type', fileType);
    formData.set('access_level', accessLevel);

    try {
      await api.post('/resources', formData, { requiredRole: 'admin' });
      toast({
        title: 'Resource created',
        description: 'The resource is now available to users.',
      });
      router.push('/admin');
    } catch (error) {
      toast({
        title: 'Could not create resource',
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
          <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Add New Resource</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resource Details</CardTitle>
          <CardDescription>
            Upload a file or link to an external resource. Fields marked with{' '}
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
                placeholder="e.g. Clinical Protocol 2024"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Brief description of what this resource contains…"
              />
            </div>

            {/* Category + File Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="e.g. Protocols"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file_type">File Type</Label>
                <Select value={fileType} onValueChange={setFileType}>
                  <SelectTrigger id="file_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Image">Image</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="guide, protocol, adhesive"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated. Helps users find the resource via search.
              </p>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <Input id="file" name="file" type="file" />
              <p className="text-xs text-muted-foreground">
                Uploading a file here will override the URL field below.
              </p>
            </div>

            {/* External URL */}
            <div className="space-y-2">
              <Label htmlFor="file_url">External File URL</Label>
              <Input
                id="file_url"
                name="file_url"
                type="url"
                placeholder="https://example.com/document.pdf"
              />
              <p className="text-xs text-muted-foreground">
                Use this if the file is hosted externally and you are not
                uploading it here.
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="file_name">Display File Name</Label>
              <Input
                id="file_name"
                name="file_name"
                placeholder="ClinicalProtocol2024.pdf"
              />
              <p className="text-xs text-muted-foreground">
                Optional — shown to the user when they download the file.
              </p>
            </div>

            {/* Access Level */}
            <div className="space-y-2">
              <Label htmlFor="access_level">Access Level</Label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger id="access_level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public — anyone can download</SelectItem>
                  <SelectItem value="vip">VIP Only</SelectItem>
                  <SelectItem value="ambassador">Ambassador Only</SelectItem>
                </SelectContent>
              </Select>
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
                {submitting ? 'Creating…' : 'Create Resource'}
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
