"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Download,
  FileText,
  Lock,
  Crown,
  Star,
  Calendar,
  Tag,
} from 'lucide-react';
import Footer from '@/components/Footer';

interface Resource {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  accessLevel: string;
  category?: string;
  tags: string;
  downloadCount: number;
  createdAt: string;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

const accessLevelConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  public: { label: 'Public', icon: <FileText className="h-4 w-4" />, color: 'text-green-600' },
  vip: { label: 'VIP Only', icon: <Star className="h-4 w-4 text-yellow-500" />, color: 'text-yellow-600' },
  ambassador: { label: 'Ambassador Only', icon: <Crown className="h-4 w-4 text-purple-500" />, color: 'text-purple-600' },
  admin: { label: 'Admin Only', icon: <Lock className="h-4 w-4 text-red-500" />, color: 'text-red-600' },
};

export default function ResourceDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    (async () => {
      try {
        // Fetch all resources and find the one by id (no single-resource endpoint exists)
        const all = await api.get<Resource[]>('/resources', { skipErrorHandling: true });
        const found = all.find(r => r.id === params.id) || null;
        setResource(found);
      } catch {
        setResource(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.id]);

  const canAccess = () => {
    if (!resource) return false;
    if (resource.accessLevel === 'public') return true;
    if (!user) return false;
    const hierarchy = ['user', 'bronze', 'silver', 'vip', 'ambassador', 'admin'];
    const userLevel = hierarchy.indexOf(user.role);
    const resLevel = hierarchy.indexOf(resource.accessLevel);
    return userLevel >= resLevel;
  };

  const handleDownload = async () => {
    if (!canAccess()) {
      toast({ title: 'Access required', description: 'Upgrade your plan to download this resource.', variant: 'destructive' });
      return;
    }
    if (!resource) return;
    setDownloading(true);
    try {
      await api.post(`/resources/${resource.id}/download`, {}, { skipErrorHandling: true });
      setResource(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : prev);
      window.open(resource.fileUrl.startsWith('/') ? `${window.location.origin}${resource.fileUrl}` : resource.fileUrl, '_blank');
      toast({ title: 'Download started' });
    } catch {
      // Still open the file even if download count fails
      window.open(resource.fileUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 pt-24 max-w-3xl px-4">
        <Skeleton className="h-6 w-24 mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container mx-auto py-20 pt-32 text-center px-4">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Resource not found</h1>
        <p className="text-muted-foreground mb-6">This resource doesn't exist or you don't have access.</p>
        <Button asChild><Link href="/resources">Browse Resources</Link></Button>
      </div>
    );
  }

  const accessConfig = accessLevelConfig[resource.accessLevel] ?? accessLevelConfig.public;
  const tags = resource.tags ? resource.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 pt-24 max-w-3xl px-4">
        {/* Back */}
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Resources
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header card */}
          <div className="bg-muted/30 border rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold mb-2">{resource.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {resource.category && (
                    <Badge variant="secondary">{resource.category}</Badge>
                  )}
                  <span className={`flex items-center gap-1 ${accessConfig.color}`}>
                    {accessConfig.icon}
                    {accessConfig.label}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Download className="h-3.5 w-3.5" />
                    {resource.downloadCount} downloads
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {resource.description && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-foreground/80 whitespace-pre-line">{resource.description}</p>
            </div>
          )}

          {/* Meta */}
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {resource.fileName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">{resource.fileName}</span>
              </div>
            )}
            {resource.fileSize && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium">Size:</span>
                {formatBytes(resource.fileSize)}
              </div>
            )}
            {resource.fileType && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium">Type:</span>
                {resource.fileType.toUpperCase()}
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              {new Date(resource.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
              ))}
            </div>
          )}

          {/* Download CTA */}
          <div className="border rounded-2xl p-6">
            {canAccess() ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold">Ready to download</p>
                  <p className="text-sm text-muted-foreground">
                    Free for your plan — click to open or download.
                  </p>
                </div>
                <Button size="lg" onClick={handleDownload} disabled={downloading} className="w-full sm:w-auto">
                  <Download className="mr-2 h-5 w-5" />
                  {downloading ? 'Opening…' : 'Download'}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="font-semibold">Access restricted</p>
                <p className="text-sm text-muted-foreground">
                  This resource requires a {accessConfig.label} account.
                </p>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/subscription">Upgrade Plan</Link>
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
