"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateBlogPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        featured_image: '',
        category: '',
        tags: '',
        read_time: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/blog/posts', formData);
            toast({ title: "Success", description: "Blog post submitted for review." });
            router.push('/ambassador');
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to create post", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (!user || (user.role !== 'ambassador' && user.role !== 'admin')) {
        return <div className="text-center py-20 text-destructive font-bold text-2xl">Access Denied</div>;
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Blog Post</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input id="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <Input id="tags" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="biomimetic, adhesive, case study" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="read_time">Read Time (minutes)</Label>
                            <Input id="read_time" type="number" value={formData.read_time} onChange={e => setFormData({...formData, read_time: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="featured_image">Featured Image URL</Label>
                            <Input id="featured_image" value={formData.featured_image} onChange={e => setFormData({...formData, featured_image: e.target.value})} placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Excerpt</Label>
                            <Textarea id="excerpt" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} rows={3} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea id="content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={10} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Post"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
