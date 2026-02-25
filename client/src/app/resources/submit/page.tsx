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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, Link as LinkIcon, Tag, Folder } from 'lucide-react';

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
        return <div className="text-center py-20 pt-32 text-destructive font-bold text-2xl">Access Denied</div>;
    }

    return (
        <div className="container mx-auto py-8 pt-24 max-w-3xl px-4">
            <Card className="border-t-4 border-t-secondary shadow-md">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <FileUp className="h-6 w-6 text-secondary" />
                        <CardTitle className="text-2xl">Submit Resource</CardTitle>
                    </div>
                    <CardDescription>
                        Contribute to our library by uploading guides, research papers, or clinical protocols.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-base">Resource Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder="e.g. Advanced Bonding Protocol 2024"
                                required
                                className="text-lg"
                            />
                            <p className="text-[0.8rem] text-muted-foreground">A clear name for the resource.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                rows={3}
                                placeholder="Briefly describe what this resource contains..."
                            />
                            <p className="text-[0.8rem] text-muted-foreground">Helps users understand the value of this resource.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <div className="relative">
                                    <Folder className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="category"
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                        placeholder="e.g. Protocols"
                                        className="pl-9"
                                    />
                                </div>
                                <p className="text-[0.8rem] text-muted-foreground">Grouping for the resource.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="file_type">File Type</Label>
                                <Select value={formData.file_type} onValueChange={val => setFormData({...formData, file_type: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PDF">PDF Document</SelectItem>
                                        <SelectItem value="Image">Image File</SelectItem>
                                        <SelectItem value="Video">Video File</SelectItem>
                                        <SelectItem value="Other">Other Format</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[0.8rem] text-muted-foreground">Format of the content.</p>
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
                                    placeholder="e.g. guide, protocol, research, adhesive"
                                    className="pl-9"
                                />
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">Keywords to improve searchability (comma separated).</p>
                        </div>

                        <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="file">Upload File</Label>
                                <Input id="file" type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="bg-background" />
                                <p className="text-[0.8rem] text-muted-foreground">Directly upload the file (max 10MB).</p>
                            </div>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-secondary/20"></div>
                                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase">Or provide a link</span>
                                <div className="flex-grow border-t border-secondary/20"></div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="file_url">File URL</Label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="file_url"
                                            value={formData.file_url}
                                            onChange={e => setFormData({...formData, file_url: e.target.value})}
                                            placeholder="https://drive.google.com/..."
                                            required={!file}
                                            className="pl-9 bg-background"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="file_name">Display Name</Label>
                                    <Input
                                        id="file_name"
                                        value={formData.file_name}
                                        onChange={e => setFormData({...formData, file_name: e.target.value})}
                                        placeholder="MyResource.pdf"
                                        required={!file}
                                        className="bg-background"
                                    />
                                </div>
                            </div>
                            {!file && <p className="text-[0.8rem] text-muted-foreground">If not uploading, please provide a direct URL and a filename.</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="access_level">Access Level</Label>
                             <Select value={formData.access_level} onValueChange={val => setFormData({...formData, access_level: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public (Everyone)</SelectItem>
                                        <SelectItem value="vip">VIP Members Only</SelectItem>
                                        <SelectItem value="ambassador">Ambassadors Only</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[0.8rem] text-muted-foreground">Who can view and download this resource?</p>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={loading}>
                                {loading ? "Uploading..." : "Submit Resource"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
