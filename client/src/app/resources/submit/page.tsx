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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SubmitResourcePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file_url: '',
        file_name: '',
        file_type: 'PDF',
        category: '',
        tags: '',
        access_level: 'public'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('tags', formData.tags);
            data.append('access_level', formData.access_level);

            if (file) {
                data.append('file', file);
            } else {
                data.append('file_url', formData.file_url);
                data.append('file_name', formData.file_name);
                data.append('file_type', formData.file_type);
            }

            await api.post('/resources', data);
            toast({ title: "Success", description: "Resource submitted for review." });
            router.push('/ambassador');
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to submit resource", variant: "destructive" });
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
                    <CardTitle>Submit Resource</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="file_type">File Type</Label>
                                <Select value={formData.file_type} onValueChange={val => setFormData({...formData, file_type: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PDF">PDF</SelectItem>
                                        <SelectItem value="Image">Image</SelectItem>
                                        <SelectItem value="Video">Video</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <Input id="tags" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="guide, protocol, research" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="file">Upload File</Label>
                            <Input id="file" type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
                            <p className="text-sm text-muted-foreground">Uploading a file will override the URL below.</p>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="file_url">File URL (if not uploading)</Label>
                            <Input id="file_url" value={formData.file_url} onChange={e => setFormData({...formData, file_url: e.target.value})} placeholder="https://..." required={!file} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="file_name">File Name (for display)</Label>
                             <Input id="file_name" value={formData.file_name} onChange={e => setFormData({...formData, file_name: e.target.value})} placeholder="MyResource.pdf" required={!file} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="access_level">Access Level</Label>
                             <Select value={formData.access_level} onValueChange={val => setFormData({...formData, access_level: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="vip">VIP Only</SelectItem>
                                        <SelectItem value="ambassador">Ambassador Only</SelectItem>
                                    </SelectContent>
                                </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Resource"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
