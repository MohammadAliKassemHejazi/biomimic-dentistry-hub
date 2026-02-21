"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, PenTool, FileUp, Star } from 'lucide-react';

export default function AmbassadorDashboard() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  if (!user || (user.role !== 'ambassador' && user.role !== 'admin')) {
     return <div className="text-center py-20 text-destructive font-bold text-2xl">Access Denied</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Star className="h-8 w-8 text-primary" />
            Ambassador Dashboard
        </h1>
        <p className="text-muted-foreground mb-8">
            Manage your contributions and share your knowledge with the community.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PenTool className="h-5 w-5" />
                        Write a Blog Post
                    </CardTitle>
                    <CardDescription>Share your insights, cases, and experiences.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/blog/create">Start Writing</Link>
                    </Button>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-secondary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileUp className="h-5 w-5" />
                        Submit a Resource
                    </CardTitle>
                    <CardDescription>Upload guides, templates, or research papers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="secondary" className="w-full">
                        <Link href="/resources/submit">Upload Resource</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
