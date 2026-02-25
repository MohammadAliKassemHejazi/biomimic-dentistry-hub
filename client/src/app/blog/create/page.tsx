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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Image as ImageIcon, Tag, Clock, PenTool } from 'lucide-react';

export default function CreateBlogPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
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
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });
            if (file) {
                data.append('featured_image', file);
            }
            await api.post('/blog/posts', data);
            toast({ title: "Success", description: "Blog post submitted for review." });
            router.push('/blog');
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to create post", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="text-center py-20 pt-32 text-destructive font-bold text-2xl">Please log in to create a post.</div>;
    }

    return (
        <div className="container mx-auto py-8 pt-24 max-w-3xl px-4">
            <Card className="border-t-4 border-t-primary shadow-md">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <PenTool className="h-6 w-6 text-primary" />
                        <CardTitle className="text-2xl">Create New Blog Post</CardTitle>
                    </div>
                    <CardDescription>
                        Share your knowledge with the community. All posts are reviewed before publishing.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-base">Post Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder="e.g. The Future of Biomimetic Dentistry: A Case Study"
                                required
                                className="text-lg"
                            />
                            <p className="text-[0.8rem] text-muted-foreground">Catchy and descriptive title for your article.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                    placeholder="e.g. Clinical Cases"
                                    required
                                />
                                <p className="text-[0.8rem] text-muted-foreground">Main topic of your post.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="read_time">Read Time (minutes)</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="read_time"
                                        type="number"
                                        value={formData.read_time}
                                        onChange={e => setFormData({...formData, read_time: e.target.value})}
                                        className="pl-9"
                                        placeholder="e.g. 5"
                                    />
                                </div>
                                <p className="text-[0.8rem] text-muted-foreground">Estimated time to read.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="tags"
                                    value={formData.tags}
                                    onChange={e => setFormData({...formData, tags: e.target.value})}
                                    placeholder="e.g. biomimetic, adhesive, bonding, protocol"
                                    className="pl-9"
                                />
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">Comma separated keywords to help find your post.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                            <div className="space-y-2">
                                <Label htmlFor="featured_image">Upload Image</Label>
                                <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="bg-background" />
                                <p className="text-[0.8rem] text-muted-foreground">Recommended size: 1200x630px.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="featured_image_url">Or Image URL</Label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="featured_image_url"
                                        value={formData.featured_image}
                                        onChange={e => setFormData({...formData, featured_image: e.target.value})}
                                        placeholder="https://example.com/image.jpg"
                                        className="pl-9 bg-background"
                                    />
                                </div>
                                <p className="text-[0.8rem] text-muted-foreground">Direct link to an image.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Excerpt / Summary</Label>
                            <Textarea
                                id="excerpt"
                                value={formData.excerpt}
                                onChange={e => setFormData({...formData, excerpt: e.target.value})}
                                rows={3}
                                placeholder="A brief summary of what this post is about..."
                                required
                            />
                            <p className="text-[0.8rem] text-muted-foreground">This will appear in blog listings and search results.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content (Markdown supported)</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={e => setFormData({...formData, content: e.target.value})}
                                rows={15}
                                placeholder="# Introduction&#10;Write your article content here..."
                                required
                                className="font-mono text-sm"
                            />
                            <p className="text-[0.8rem] text-muted-foreground">Main body of your article. You can use Markdown for formatting.</p>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={loading}>
                                {loading ? (
                                    <>Processing...</>
                                ) : (
                                    <>Submit for Review</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
