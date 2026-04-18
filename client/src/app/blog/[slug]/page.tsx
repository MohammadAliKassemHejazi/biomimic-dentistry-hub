"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { Loader2, Heart, Share2, Eye, Calendar, User, Clock, Copy, MessageCircle, Twitter, Facebook, Mail } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DOMPurify from 'isomorphic-dompurify';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string;
    category: string;
    tags: string[];
    read_time: number;
    created_at: string;
    view_count: number;
    is_favorited: boolean;
    profiles: {
        first_name: string;
        last_name: string;
    };
}

const SERVER_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

function resolveImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${SERVER_URL}${path}`;
}

export default function BlogPostPage() {
    const { slug } = useParams();
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [favorited, setFavorited] = useState(false);
    const [viewRecorded, setViewRecorded] = useState(false);

    useEffect(() => {
        if (slug) {
            fetchPost();
        }
    }, [slug, user]); // Refetch if user changes (to update is_favorited)

    useEffect(() => {
        if (post?.id && !viewRecorded && isAuthenticated) {
            recordView(post.id);
        }
    }, [post, viewRecorded, isAuthenticated]);

    const fetchPost = async () => {
        try {
            const data = await api.get<BlogPost>(`/blog/posts/${slug}`, { skipErrorHandling: true });
            setPost(data);
            setFavorited(data.is_favorited);
        } catch (error) {
            console.error("Failed to fetch post", error);
        } finally {
            setLoading(false);
        }
    };

    const recordView = async (id: string) => {
        try {
            await api.post(`/blog/posts/${id}/view`, {});
            setViewRecorded(true);
        } catch (error) {
            console.error("Failed to record view", error);
        }
    };

    const handleFavorite = async () => {
        if (!user) {
            toast({ title: "Login Required", description: "Please login to favorite posts." });
            return;
        }
        if (!post) return;

        try {
            const res = await api.post<{ favorited: boolean }>(`/blog/posts/${post.id}/favorite`, {});
            setFavorited(res.favorited);
            toast({ title: res.favorited ? "Added to Favorites" : "Removed from Favorites" });
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(currentUrl);
        toast({ title: "Link Copied", description: "Blog post link copied to clipboard." });
    };

    const handleShareWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent((post?.title ?? '') + ' ' + currentUrl)}`, '_blank');
    };

    const handleShareTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post?.title ?? '')}`, '_blank');
    };

    const handleShareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
    };

    const handleShareEmail = () => {
        window.open(`mailto:?subject=${encodeURIComponent(post?.title ?? '')}&body=${encodeURIComponent(currentUrl)}`, '_blank');
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
    if (!post) return <div className="text-center p-20">Post not found</div>;

    return (
        <div className="container mx-auto pt-24 pb-12 px-4 max-w-4xl">
            <div className="mb-8">
                <Badge variant="secondary" className="mb-4">{post.category}</Badge>
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {post.profiles.first_name} {post.profiles.last_name}
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.created_at).toLocaleDateString()}
                    </div>
                     <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {post.read_time} min read
                    </div>
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        {post.view_count} views
                    </div>
                </div>
            </div>

            {post.featured_image && resolveImageUrl(post.featured_image) && (
                <div className="mb-8 rounded-xl overflow-hidden aspect-video relative">
                    <Image src={resolveImageUrl(post.featured_image)!} alt={post.title} fill sizes="100vw" className="object-cover w-full h-full" />
                </div>
            )}

            <div className="prose dark:prose-invert max-w-none mb-12">
                 <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content ? post.content.replace(/\n/g, '<br/>') : '') }} />
            </div>

            <div className="flex items-center justify-between border-t pt-8">
                <div className="flex gap-2">
                    {post.tags.map(tag => (
                        <Badge key={tag} variant="outline">#{tag.trim()}</Badge>
                    ))}
                </div>
                <div className="flex gap-4">
                    <Button variant={favorited ? "default" : "outline"} onClick={handleFavorite}>
                        <Heart className={`mr-2 h-4 w-4 ${favorited ? "fill-current" : ""}`} />
                        {favorited ? "Favorited" : "Favorite"}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Share this post</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleCopyLink}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleShareWhatsApp}>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleShareTwitter}>
                                <Twitter className="mr-2 h-4 w-4" />
                                Twitter / X
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleShareFacebook}>
                                <Facebook className="mr-2 h-4 w-4" />
                                Facebook
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleShareEmail}>
                                <Mail className="mr-2 h-4 w-4" />
                                Email
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
