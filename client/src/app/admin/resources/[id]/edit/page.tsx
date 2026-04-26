"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

interface Resource {
  id: string;
  title: string;
  description?: string;
  category?: string;
  file_type?: string;
  tags?: string;
  file_url?: string;
  file_name?: string;
  access_level?: string;
}

interface ResourcePage {
  data: Resource[];
  meta: unknown;
}

export default function EditResourcePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileType, setFileType] = useState('PDF');
  const [accessLevel, setAccessLevel] = useState('public');

  // ── Load resource data ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!params.id) return;

    const loadResource = async () => {
      try {
        const page = await api.get<ResourcePage>('/resources?limit=500', {
          skipErrorHandling: true,
        });
        const found = (page.data ?? []).find(
          (r) => String(r.id) === String(params.id)
        );
        if (!found) {
          toast({
            title: 'Resource not found',
            description: `No resource with id ${params.id}.`,
            variant: 'destructive',
          });
          router.push('/admin');
          return;
        }
        setResource(found);
        setFileType(found.file_type ?? 'PDF');
        setAccessLevel(found.access_level ?? 'public');
      } catch (err) {
        toast({
          title: 'Failed to load resource',
          description: describeError(err),
          variant: 'destructive',
        });
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    };

    loadResource();
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
          Admin privileges are required to edit resources.
        </p>
        <Button asChild className="mt-6">
          <Link href="/admin">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // ── Form submit ─────────────────────────────────────────────────────────────
  // PUT /resources/:id does NOT have upload middleware — use JSON body only.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resource) return;
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      title:        fd.get('title') as string,
      description:  fd.get('description') as string,
      category:     fd.get('category') as string,
      file_type:    fileType,
      tags:         fd.get('tags') as string,
      file_url:     fd.get('file_url') as string,
      file_name:    fd.get('file_name') as string,
      access_level: accessLevel,
    };

    try {
      await api.put(`/resources/${resource.id}`, body, { requiredRole: 'admin' });
      toast({
        title: 'Resource updated',
        description: 'The resource has been saved successfully.',
      });
      router.push('/admin');
    } catch (error) {
      toast({
        title: 'Could not update resource',
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
          <h1 className="text-2xl font-bold">Edit Resource</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resource Details</CardTitle>
          <CardDescription>
            Update the metadata below. Fields marked with{' '}
            <span className="text-destructive">*</span> are required.{' '}
            <span className="text-muted-foreground">
              (File replacement is not supported on edit — to change the file,
              delete and re-create the resource.)
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={resource?.title}
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
                defaultValue={resource?.description}
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
                  defaultValue={resource?.category}
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
                defaultValue={resource?.tags}
                placeholder="guide, protocol, adhesive"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated. Helps users find the resource via search.
              </p>
            </div>

            {/* External URL */}
            <div className="space-y-2">
              <Label htmlFor="file_url">External File URL</Label>
              <Input
                id="file_url"
                name="file_url"
                type="url"
                defaultValue={resource?.file_url}
                placeholder="https://example.com/document.pdf"
              />
              <p className="text-xs text-muted-foreground">
                Update the external URL if the file has moved. Leave blank to
                keep the existing value.
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="file_name">Display File Name</Label>
              <Input
                id="file_name"
                name="file_name"
                defaultValue={resource?.file_name}
                placeholder="ClinicalProtocol2024.pdf"
              />
              <p className="text-xs text-muted-foreground">
                Shown to the user when they download the file.
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
