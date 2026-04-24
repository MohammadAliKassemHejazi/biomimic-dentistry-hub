"use client";

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, describeError } from '@/lib/api';
import { SERVER_ORIGIN } from '@/lib/env';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash, Edit, Mail, Handshake, Eye } from 'lucide-react';

// Types
interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    createdAt: string;
}

interface PartnerApplication {
    id: string;
    name: string;
    email: string;
    companyName?: string;
    message: string;
    tier?: string;
    applicationFile?: string;
    status: string;
    createdAt: string;
}

interface PartnerTemplates {
    silver: string | null;
    gold: string | null;
    vip: string | null;
}

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface Application {
    id: string;
    user: { firstName: string, lastName: string, email: string };
    status: string;
    experience: string;
    bio: string;
    socialMediaLinks: string;
    cv: string;
    country: string;
    createdAt: string;
}

interface BlogPost {
    id: string;
    title: string;
    status: string;
    author: { firstName: string, lastName: string };
    createdAt: string;
}

interface Resource {
    id: string;
    title: string;
    status: string;
    createdAt: string;
}

interface TrustedPartner {
    id: string;
    name: string;
    role: string;
    description: string;
    logo: string;
    tier: string;
    website?: string;
}

interface LeadershipMember {
    id: string;
    name: string;
    role: string;
    bio: string;
    image: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    expertise?: string;
    achievements?: string;
    status?: string;
}

interface NewsletterSubscriber {
    id: string;
    email: string;
    createdAt: string;
}

interface SubscriptionPlan {
    id: string;
    key: string;
    name: string;
    price: number;
    interval: string;
    features: string[];
    popular: boolean;
    stripePriceId: string;
    icon?: string;
}

/** Tiny helper: extract value from allSettled result, fall back to default on rejection and surface a toast. */
function take<T>(
    result: PromiseSettledResult<T>,
    label: string,
    fallback: T,
    onError: (label: string, message: string) => void
): T {
    if (result.status === 'fulfilled') return result.value;
    const msg = describeError(result.reason);
    onError(label, msg);
    console.error(`[admin] ${label} failed:`, result.reason);
    return fallback;
}

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [pendingContent, setPendingContent] = useState<{ posts: BlogPost[], resources: Resource[] }>({ posts: [], resources: [] });
    const [partners, setPartners] = useState<TrustedPartner[]>([]);
    const [members, setMembers] = useState<LeadershipMember[]>([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [partnershipKitUrl, setPartnershipKitUrl] = useState<string | null>(null);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [partnerApplications, setPartnerApplications] = useState<PartnerApplication[]>([]);
    const [partnerTemplates, setPartnerTemplates] = useState<PartnerTemplates>({ silver: null, gold: null, vip: null });
    const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('applications');
    const API_BASE = SERVER_ORIGIN;

    // Dialog States
    const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
    const [memberDialogOpen, setMemberDialogOpen] = useState(false);
    const [planDialogOpen, setPlanDialogOpen] = useState(false);
    const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null); // Generic holder for item being edited

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);

        // U-H1 / FE-05: Promise.allSettled so one 5xx panel does not freeze
        // the whole dashboard. Each failure is reported independently.
        const failures: string[] = [];
        const onPanelError = (label: string, _msg: string) => { failures.push(label); };

        const [
            usersRes, appsRes, contentRes, partnersRes, membersRes, plansRes,
            kitRes, messagesRes, partnerAppsRes, templatesRes, subscribersRes,
        ] = await Promise.allSettled([
            api.get<{ users: User[] }>('/admin/users',                     { skipErrorHandling: true }),
            api.get<Application[]>('/admin/applications',                  { skipErrorHandling: true }),
            api.get<{ posts: BlogPost[], resources: Resource[] }>('/admin/content/pending', { skipErrorHandling: true }),
            api.get<TrustedPartner[]>('/partners',                         { skipErrorHandling: true, requiresAuth: false }),
            api.get<LeadershipMember[]>('/leadership',                     { skipErrorHandling: true, requiresAuth: false }),
            api.get<SubscriptionPlan[]>('/plans',                          { skipErrorHandling: true, requiresAuth: false }),
            api.get<{url: string | null}>('/admin/settings/partnership-kit', { skipErrorHandling: true }),
            api.get<ContactMessage[]>('/contact',                          { skipErrorHandling: true }),
            api.get<PartnerApplication[]>('/admin/partner-applications',   { skipErrorHandling: true }),
            api.get<PartnerTemplates>('/admin/settings/partner-templates', { skipErrorHandling: true }),
            api.get<NewsletterSubscriber[]>('/newsletter',                 { skipErrorHandling: true }),
        ]);

        setUsers(take(usersRes, 'Users', { users: [] }, onPanelError).users ?? []);
        setApplications(take(appsRes, 'Ambassador applications', [], onPanelError));
        setPendingContent(take(contentRes, 'Pending content', { posts: [], resources: [] }, onPanelError));
        setPartners(take(partnersRes, 'Partners', [], onPanelError));
        setMembers(take(membersRes, 'Leadership', [], onPanelError));
        setPlans(take(plansRes, 'Subscription plans', [], onPanelError));
        setPartnershipKitUrl(take(kitRes, 'Partnership kit', { url: null }, onPanelError).url);
        setMessages(take(messagesRes, 'Messages', [], onPanelError));
        setPartnerApplications(take(partnerAppsRes, 'Partner applications', [], onPanelError));
        setPartnerTemplates(take(templatesRes, 'Partner templates', { silver: null, gold: null, vip: null }, onPanelError));
        setNewsletterSubscribers(take(subscribersRes, 'Newsletter subscribers', [], onPanelError));

        if (failures.length > 0) {
            toast({
                title: `Some panels failed to load`,
                description: `${failures.length} of 11 panels could not be loaded: ${failures.slice(0, 3).join(', ')}${failures.length > 3 ? '…' : ''}. Other panels are still available.`,
                variant: 'destructive',
            });
        }

        setLoading(false);
    }, [toast]);

    useEffect(() => {
        if (!authLoading) {
            if (user?.role === 'admin') {
                fetchData();
            } else {
                setLoading(false); // Not admin, stop loading
            }
        }
    }, [user, authLoading, fetchData]);

    const handleApproveApp = async (id: string) => {
        try {
            await api.patch(`/admin/applications/${id}/status`, { status: 'approved' });
            toast({ title: "Approved", description: "Application approved" });
            fetchData(true);
        } catch (error) {
            toast({ title: "Could not approve", description: describeError(error), variant: "destructive" });
        }
    };

    const handleRejectApp = async (id: string) => {
        try {
            await api.patch(`/admin/applications/${id}/status`, { status: 'rejected' });
            toast({ title: "Rejected", description: "Application rejected" });
            fetchData(true);
        } catch (error) {
            toast({ title: "Could not reject", description: describeError(error), variant: "destructive" });
        }
    };

    const handleApproveContent = async (type: 'post' | 'resource', id: string) => {
        try {
            const endpoint = type === 'post' ? `/blog/posts/${id}/status` : `/resources/${id}`;
            const data = { status: 'approved' };

            if (type === 'post') {
                 await api.patch(endpoint, data);
            } else {
                 await api.put(endpoint, data);
            }

            toast({ title: "Approved", description: "Content approved" });
            fetchData(true);
        } catch (error) {
            toast({ title: "Could not approve", description: describeError(error), variant: "destructive" });
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            toast({ title: "Role updated", description: `User role changed to ${newRole}` });
            fetchData(true);
        } catch (error) {
            toast({ title: "Could not update role", description: describeError(error), variant: "destructive" });
        }
    }

    const handleDeleteSubscriber = async (id: string) => {
        try {
            await api.delete(`/newsletter/${id}`);
            toast({ title: 'Subscriber removed', description: 'Newsletter subscriber deleted' });
            setNewsletterSubscribers(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            toast({ title: 'Could not remove', description: describeError(error), variant: 'destructive' });
        }
    };

    const handleResourceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        try {
            await api.post('/resources', formData);
            toast({ title: "Resource created", description: "New resource added" });
            setResourceDialogOpen(false);
            fetchData(true);
        } catch (error) {
            toast({ title: "Could not create resource", description: describeError(error), variant: "destructive" });
        }
    };

    const handlePartnerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        try {
            if (editingItem) {
                await api.put(`/partners/${editingItem.id}`, formData);
                toast({ title: "Partner updated", description: `${editingItem.name} saved` });
            } else {
                await api.post('/partners', formData);
                toast({ title: "Partner added", description: "New partner created" });
            }
            setPartnerDialogOpen(false);
            setEditingItem(null);
            fetchData(true);
        } catch (error) {
            toast({ title: "Could not save partner", description: describeError(error), variant: "destructive" });
        }
    };

    const handleDeletePartner = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/partners/${id}`);
            toast({ title: "Partner deleted", description: "Partner removed from the site" });
            fetchData(true);
        } catch (error) {
            toast({ title: "Could not delete partner", description: describeError(error), variant: "destructive" });
        }
    };

    const handleMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        try {
            if (editingItem) {
                await api.put(`/leadership/${editingItem.id}`, formData);
                toast({ title: "Member updated", description: `${editingItem.name} saved` });
            } else {
                await api.post('/leadership', formData);
                toast({ title: "Member added", description: "New leadership profile created" });
            }
            setMemberDialogOpen(false);
            setEditingItem(null);
            fetchData(true);
        } catch (error) {
            toast({ title: "Could not save member", description: describeError(error), variant: "destructive" });
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/leadership/${id}`);
            toast({ title: "Member deleted", description: "Leadership profile removed" });
            fetchData(true);
        } catch (error) {
            toast({ title: "Could not delete member", description: describeError(error), variant: "destructive" });
        }
    };

    const handleMessageStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/contact/${id}/status`, { status });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, status: status as ContactMessage['status'] } : m));
        } catch (error) {
            toast({ title: 'Could not update message', description: describeError(error), variant: 'destructive' });
        }
    };

    const handlePartnerAppStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/admin/partner-applications/${id}/status`, { status });
            toast({
                title: status === 'approved' ? 'Approved' : 'Rejected',
                description: `Application ${status}`,
            });
            fetchData(true);
        } catch (error) {
            toast({ title: 'Could not update application', description: describeError(error), variant: 'destructive' });
        }
    };

    const handleTemplateUpload = async (tier: string) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.odt,application/pdf';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                try {
                    await api.post(`/admin/settings/partner-templates/${tier}`, formData);
                    toast({ title: 'Template uploaded', description: `${tier} template saved` });
                    fetchData(true);
                } catch (error) {
                    toast({ title: 'Upload failed', description: describeError(error), variant: 'destructive' });
                }
            }
        };
        input.click();
    };

    const handlePlanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries()) as any;

        // Handle features as array (split by newline)
        data.features = data.features.split('\n').filter((f: string) => f.trim() !== '');
        data.price = parseFloat(data.price);
        data.popular = formData.get('popular') === 'on';

        try {
            await api.put(`/plans/${editingItem.id}`, data);
            toast({ title: "Plan updated", description: `${data.name} saved` });
            setPlanDialogOpen(false);
            setEditingItem(null);
            fetchData(true);
        } catch (error) {
            toast({ title: "Could not save plan", description: describeError(error), variant: "destructive" });
        }
    };

    if (authLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-primary" aria-label="Loading" /></div>;
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    if (loading) {
        // Skeleton layout that mirrors the final dashboard shell.
        return (
            <div className="container mx-auto py-8 px-4 pt-24">
                <div className="flex items-center gap-2 mb-6">
                    <Shield className="h-8 w-8 text-primary" aria-hidden="true" />
                    <Skeleton className="h-9 w-64" />
                </div>
                <Skeleton className="h-10 w-full mb-6" />
                <div className="grid md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 pt-24">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" aria-hidden="true" />
                Admin Dashboard
            </h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="flex-wrap h-auto gap-1">
                    <TabsTrigger value="applications" className="relative">
                        Ambassador Applications
                        {applications.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white" aria-label={`${applications.length} pending`}>
                                {applications.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="partner-applications" className="relative">
                        Partner Applications
                        {partnerApplications.filter(a => a.status === 'pending').length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                                {partnerApplications.filter(a => a.status === 'pending').length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="relative">
                        Messages
                        {messages.filter(m => m.status === 'new').length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                                {messages.filter(m => m.status === 'new').length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="content" className="relative">
                        Pending Content
                        {(pendingContent.posts.length + pendingContent.resources.length) > 0 && (
                             <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                                {pendingContent.posts.length + pendingContent.resources.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="partners">Partners</TabsTrigger>
                    <TabsTrigger value="leadership">Leadership</TabsTrigger>
                    <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                    <TabsTrigger value="newsletter">
                        Newsletter
                        {newsletterSubscribers.length > 0 && (
                            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground px-1">
                                {newsletterSubscribers.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="messages">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" aria-hidden="true" /> Contact Messages</CardTitle>
                                <CardDescription>Messages submitted via the contact form.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {messages.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">No messages yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {messages.map(msg => (
                                            <button
                                                type="button"
                                                key={msg.id}
                                                className={`w-full text-left border rounded-lg p-3 cursor-pointer transition-colors ${selectedMessage?.id === msg.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                                                onClick={() => {
                                                    setSelectedMessage(msg);
                                                    if (msg.status === 'new') handleMessageStatus(msg.id, 'read');
                                                }}
                                                aria-pressed={selectedMessage?.id === msg.id}
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm truncate">{msg.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{msg.subject}</p>
                                                    </div>
                                                    <Badge variant={msg.status === 'new' ? 'destructive' : msg.status === 'replied' ? 'default' : 'secondary'} className="shrink-0 text-[10px]">
                                                        {msg.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">{new Date(msg.createdAt).toLocaleDateString()}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Message Detail</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedMessage ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">From</p>
                                            <p className="font-semibold">{selectedMessage.name}</p>
                                            <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Subject</p>
                                            <p className="font-medium">{selectedMessage.subject}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Message</p>
                                            <p className="text-sm whitespace-pre-wrap bg-muted/30 rounded-md p-3 mt-1">{selectedMessage.message}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-2">Date: {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <Button size="sm" variant="outline" onClick={() => handleMessageStatus(selectedMessage.id, 'read')}>
                                                <Eye className="mr-1 h-3 w-3" aria-hidden="true" /> Mark Read
                                            </Button>
                                            <Button size="sm" onClick={() => handleMessageStatus(selectedMessage.id, 'replied')}>
                                                Mark Replied
                                            </Button>
                                            <Button size="sm" variant="outline" asChild>
                                                <a href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}>
                                                    Reply via Email
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8 text-sm">Select a message to view details.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="partner-applications">
                    <div className="space-y-6">
                        {/* Partner Templates */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Handshake className="h-5 w-5" aria-hidden="true" /> Partnership Templates</CardTitle>
                                <CardDescription>Upload downloadable application templates for each partnership tier.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {(['silver', 'gold', 'vip'] as const).map(tier => (
                                        <div key={tier} className="border rounded-lg p-4 space-y-3">
                                            <p className="font-semibold capitalize">{tier} Template</p>
                                            {partnerTemplates[tier] ? (
                                                <div className="space-y-2">
                                                    <p className="text-xs text-green-600 font-medium">Template uploaded</p>
                                                    <Button variant="outline" size="sm" asChild className="w-full">
                                                        <a href={`${API_BASE}${partnerTemplates[tier]}`} target="_blank" rel="noopener noreferrer">View</a>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">No template uploaded</p>
                                            )}
                                            <Button size="sm" className="w-full" onClick={() => handleTemplateUpload(tier)}>
                                                {partnerTemplates[tier] ? 'Replace Template' : 'Upload Template'}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Partner Applications */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Partnership Applications</CardTitle>
                                <CardDescription>Review and process partnership applications.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {partnerApplications.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">No applications yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {partnerApplications.map(app => (
                                            <Card key={app.id} className="bg-muted/50">
                                                <CardContent className="p-4">
                                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                                        <div className="space-y-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h3 className="font-semibold">{app.name}</h3>
                                                                {app.tier && <Badge variant="outline" className="capitalize">{app.tier}</Badge>}
                                                                <Badge variant={app.status === 'pending' ? 'secondary' : app.status === 'approved' ? 'default' : 'destructive'}>
                                                                    {app.status}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{app.email}{app.companyName ? ` • ${app.companyName}` : ''}</p>
                                                            <p className="text-sm mt-2">{app.message}</p>
                                                            {app.applicationFile && (
                                                                <Button variant="link" size="sm" asChild className="p-0 h-auto">
                                                                    <a href={`${API_BASE}${app.applicationFile}`} target="_blank" rel="noopener noreferrer">
                                                                        View submitted template
                                                                    </a>
                                                                </Button>
                                                            )}
                                                            <p className="text-xs text-muted-foreground">{new Date(app.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        {app.status === 'pending' && (
                                                            <div className="flex items-start gap-2 shrink-0">
                                                                <Button onClick={() => handlePartnerAppStatus(app.id, 'approved')} size="sm" className="bg-green-600 hover:bg-green-700">
                                                                    <Check className="mr-1 h-4 w-4" aria-hidden="true" /> Approve
                                                                </Button>
                                                                <Button onClick={() => handlePartnerAppStatus(app.id, 'rejected')} variant="destructive" size="sm">
                                                                    <X className="mr-1 h-4 w-4" aria-hidden="true" /> Reject
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="partners">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Trusted Partners</CardTitle>
                                <CardDescription>Manage trusted partners and sponsors.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'application/pdf';
                                    input.onchange = async (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (file) {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                await api.post('/admin/settings/partnership-kit', formData);
                                                toast({ title: 'Partnership kit updated', description: 'File saved' });
                                                fetchData(true);
                                            } catch (error) {
                                                toast({ title: 'Upload failed', description: describeError(error), variant: 'destructive' });
                                            }
                                        }
                                    };
                                    input.click();
                                }}>
                                    Upload Partnership Kit
                                </Button>
                                {partnershipKitUrl && (
                                    <Button variant="outline" asChild>
                                        <a href={partnershipKitUrl} target="_blank" rel="noopener noreferrer">View Kit</a>
                                    </Button>
                                )}
                                <Dialog open={partnerDialogOpen} onOpenChange={(open) => {
                                    setPartnerDialogOpen(open);
                                    if (!open) setEditingItem(null);
                                }}>
                                    <DialogTrigger asChild>
                                        <Button onClick={() => setEditingItem(null)}><Plus className="mr-2 h-4 w-4" aria-hidden="true"/> Add Partner</Button>
                                    </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{editingItem ? 'Edit Partner' : 'Add Partner'}</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handlePartnerSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input name="name" defaultValue={editingItem?.name} placeholder="e.g. Acme Dental" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Role</Label>
                                            <Input name="role" defaultValue={editingItem?.role} placeholder="e.g. Equipment Supplier" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea name="description" defaultValue={editingItem?.description} placeholder="Brief description of the partner..." required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Logo (URL/Emoji)</Label>
                                            <Input name="logo" defaultValue={editingItem?.logo} placeholder="https://... or 🦷" />
                                            <p className="text-[0.8rem] text-muted-foreground">Provide a URL or an emoji.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Or Upload Logo</Label>
                                            <Input name="logo" type="file" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tier</Label>
                                            <Select name="tier" defaultValue={editingItem?.tier || "Bronze"}>
                                                <SelectTrigger><SelectValue placeholder="Select Tier" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Platinum">Platinum</SelectItem>
                                                    <SelectItem value="Gold">Gold</SelectItem>
                                                    <SelectItem value="Silver">Silver</SelectItem>
                                                    <SelectItem value="Bronze">Bronze</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2"><Label>Website</Label><Input name="website" defaultValue={editingItem?.website} /></div>
                                        <Button type="submit" className="w-full">Save</Button>
                                    </form>
                                </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Tier</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {partners.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>{p.role}</TableCell>
                                            <TableCell>{p.tier}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={() => { setEditingItem(p); setPartnerDialogOpen(true); }} aria-label={`Edit ${p.name}`}><Edit className="h-4 w-4" aria-hidden="true"/></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeletePartner(p.id)} className="text-destructive" aria-label={`Delete ${p.name}`}><Trash className="h-4 w-4" aria-hidden="true"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="leadership">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Leadership Team</CardTitle>
                                <CardDescription>Manage leadership team members.</CardDescription>
                            </div>
                            <Dialog open={memberDialogOpen} onOpenChange={(open) => {
                                setMemberDialogOpen(open);
                                if (!open) setEditingItem(null);
                            }}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => setEditingItem(null)}><Plus className="mr-2 h-4 w-4" aria-hidden="true"/> Add Member</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{editingItem ? 'Edit Member' : 'Add Member'}</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleMemberSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input name="name" defaultValue={editingItem?.name} placeholder="e.g. Dr. Jane Doe" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Role / Title</Label>
                                            <Input name="role" defaultValue={editingItem?.role} placeholder="e.g. Clinical Director" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Bio</Label>
                                            <Textarea name="bio" defaultValue={editingItem?.bio} placeholder="Short professional biography..." required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Image (Emoji or URL)</Label>
                                            <Input name="image" defaultValue={editingItem?.image} placeholder="https://... or 👨‍⚕️" />
                                            <p className="text-[0.8rem] text-muted-foreground">Leave blank to auto-generate based on title.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Or Upload Image</Label>
                                            <Input name="image" type="file" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Expertise</Label>
                                            <Input name="expertise" defaultValue={editingItem?.expertise} placeholder="e.g. Endodontics, Bonding" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Achievements</Label>
                                            <Input name="achievements" defaultValue={editingItem?.achievements} placeholder="e.g. Published 50+ papers" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Input name="status" defaultValue={editingItem?.status} placeholder="e.g. Founder, Board Member" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>LinkedIn</Label>
                                                <Input name="linkedin" defaultValue={editingItem?.linkedin} placeholder="Profile URL" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Twitter</Label>
                                                <Input name="twitter" defaultValue={editingItem?.twitter} placeholder="@handle" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Instagram</Label>
                                                <Input name="instagram" defaultValue={editingItem?.instagram} placeholder="Profile URL" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Facebook</Label>
                                                <Input name="facebook" defaultValue={editingItem?.facebook} placeholder="Profile URL" />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full">Save</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {members.map(m => (
                                        <TableRow key={m.id}>
                                            <TableCell>{m.name}</TableCell>
                                            <TableCell>{m.role}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={() => { setEditingItem(m); setMemberDialogOpen(true); }} aria-label={`Edit ${m.name}`}><Edit className="h-4 w-4" aria-hidden="true"/></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteMember(m.id)} className="text-destructive" aria-label={`Delete ${m.name}`}><Trash className="h-4 w-4" aria-hidden="true"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="subscriptions">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Subscription Plans</CardTitle>
                                <CardDescription>Edit details of subscription plans.</CardDescription>
                            </div>
                            {plans.length === 0 && (
                                <Button onClick={async () => {
                                    try {
                                        await api.post('/plans/seed', {});
                                        toast({ title: 'Plans seeded', description: 'Default subscription plans created.' });
                                        fetchData(true);
                                    } catch (error) {
                                        toast({ title: 'Could not seed plans', description: describeError(error), variant: 'destructive' });
                                    }
                                }} variant="outline" size="sm">
                                    Seed Default Plans
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Price</TableHead><TableHead>Key</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {plans.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>${p.price}</TableCell>
                                            <TableCell>{p.key}</TableCell>
                                            <TableCell>
                                                <Dialog open={planDialogOpen && editingItem?.id === p.id} onOpenChange={(open) => {
                                                    setPlanDialogOpen(open);
                                                    if (!open) setEditingItem(null);
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" onClick={() => { setEditingItem(p); setPlanDialogOpen(true); }} aria-label={`Edit ${p.name}`}><Edit className="h-4 w-4" aria-hidden="true"/></Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Plan: {p.name}</DialogTitle>
                                                        </DialogHeader>
                                                        <form onSubmit={handlePlanSubmit} className="space-y-4">
                                                            <div className="space-y-2"><Label>Name</Label><Input name="name" defaultValue={p.name} required /></div>
                                                            <div className="space-y-2"><Label>Price</Label><Input name="price" type="number" step="0.01" defaultValue={p.price} required /></div>
                                                            <div className="space-y-2"><Label>Key</Label><Input name="key" defaultValue={p.key} required /></div>
                                                            <div className="space-y-2"><Label>Stripe Price ID</Label><Input name="stripePriceId" defaultValue={p.stripePriceId} required /></div>
                                                            <div className="space-y-2"><Label>Interval</Label><Input name="interval" defaultValue={p.interval} required /></div>
                                                            <div className="space-y-2">
                                                                <Label>Icon Name (e.g. Trophy, Star, Crown, Zap)</Label>
                                                                <Input name="icon" defaultValue={p.icon || 'Star'} required />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Features (one per line)</Label>
                                                                <Textarea name="features" defaultValue={p.features?.join('\n')} rows={5} placeholder="- Access to all courses&#10;- Weekly webinars" required />
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <input type="checkbox" name="popular" id="popular" defaultChecked={p.popular} />
                                                                <Label htmlFor="popular">Popular</Label>
                                                            </div>
                                                            <Button type="submit" className="w-full">Save</Button>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="applications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ambassador Applications</CardTitle>
                            <CardDescription>Review and approve requests to become an ambassador.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {applications.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No pending applications.</p>
                            ) : (
                                <div className="space-y-4">
                                    {applications.map(app => (
                                        <Card key={app.id} className="bg-muted/50">
                                            <CardContent className="p-4">
                                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <h3 className="font-semibold text-lg">{app.user.firstName} {app.user.lastName}</h3>
                                                        <p className="text-sm text-muted-foreground">{app.user.email} • {app.country}</p>
                                                        <div className="mt-2">
                                                            <p className="text-sm font-medium">Experience:</p>
                                                            <p className="text-sm">{app.experience}</p>
                                                        </div>
                                                        <div className="mt-2">
                                                            <p className="text-sm font-medium">Bio:</p>
                                                            <p className="text-sm">{app.bio}</p>
                                                        </div>
                                                        {app.socialMediaLinks && (
                                                            <div className="mt-2">
                                                                <p className="text-sm font-medium">Social Media Links:</p>
                                                                <p className="text-sm break-all">{app.socialMediaLinks}</p>
                                                            </div>
                                                        )}
                                                        {app.cv && (
                                                            <div className="mt-2">
                                                                <p className="text-sm font-medium">CV Link:</p>
                                                                <a href={app.cv.startsWith('/') ? `${API_BASE}${app.cv}` : app.cv} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline break-all">{app.cv}</a>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <Button onClick={() => handleApproveApp(app.id)} size="sm" className="bg-green-600 hover:bg-green-700">
                                                            <Check className="mr-2 h-4 w-4" aria-hidden="true"/> Approve
                                                        </Button>
                                                        <Button onClick={() => handleRejectApp(app.id)} variant="destructive" size="sm">
                                                            <X className="mr-2 h-4 w-4" aria-hidden="true"/> Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="content">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Blog Posts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {pendingContent.posts.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">No pending posts.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingContent.posts.map(post => (
                                            <div key={post.id} className="border rounded-lg p-4 flex justify-between items-center bg-card">
                                                <div>
                                                    <h4 className="font-medium">{post.title}</h4>
                                                    <p className="text-sm text-muted-foreground">By {post.author.firstName} {post.author.lastName}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <Button onClick={() => handleApproveContent('post', post.id)} size="sm">Approve</Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Pending Resources</CardTitle>
                                <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm"><Plus className="mr-2 h-4 w-4" aria-hidden="true"/> Add Resource</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Add New Resource</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleResourceSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Title</Label>
                                                <Input name="title" placeholder="e.g. Clinical Protocol 2024" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea name="description" rows={3} placeholder="Brief description..." />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Category</Label>
                                                    <Input name="category" placeholder="e.g. Protocols" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>File Type</Label>
                                                    <Select name="file_type" defaultValue="PDF">
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
                                                <Label>Tags</Label>
                                                <Input name="tags" placeholder="guide, protocol, adhesive" />
                                                <p className="text-[0.8rem] text-muted-foreground">Comma separated.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Upload File</Label>
                                                <Input name="file" type="file" />
                                                <p className="text-[0.8rem] text-muted-foreground">Uploading a file will override the URL below.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>File URL (if not uploading)</Label>
                                                <Input name="file_url" placeholder="https://..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>File Name (display)</Label>
                                                <Input name="file_name" placeholder="MyResource.pdf" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Access Level</Label>
                                                <Select name="access_level" defaultValue="public">
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="public">Public</SelectItem>
                                                        <SelectItem value="vip">VIP Only</SelectItem>
                                                        <SelectItem value="ambassador">Ambassador Only</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button type="submit" className="w-full">Create Resource</Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                {pendingContent.resources.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">No pending resources.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingContent.resources.map(res => (
                                            <div key={res.id} className="border rounded-lg p-4 flex justify-between items-center bg-card">
                                                <div>
                                                    <h4 className="font-medium">{res.title}</h4>
                                                    <p className="text-xs text-muted-foreground">{new Date(res.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <Button onClick={() => handleApproveContent('resource', res.id)} size="sm">Approve</Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="newsletter">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" aria-hidden="true" /> Newsletter Subscribers</CardTitle>
                            <CardDescription>Emails collected from the footer subscription form.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {newsletterSubscribers.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No subscribers yet.</p>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Subscribed On</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {newsletterSubscribers.map(s => (
                                                <TableRow key={s.id}>
                                                    <TableCell className="font-medium">{s.email}</TableCell>
                                                    <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSubscriber(s.id)} className="text-destructive" aria-label={`Delete ${s.email}`}>
                                                            <Trash className="h-4 w-4" aria-hidden="true" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                 <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                            <CardDescription>Manage user roles and permissions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell className="font-medium">{u.first_name} {u.last_name}</TableCell>
                                                <TableCell>{u.email}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        defaultValue={u.role}
                                                        onValueChange={(val) => handleRoleChange(u.id, val)}
                                                    >
                                                        <SelectTrigger className="w-[130px]" aria-label={`Role for ${u.email}`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">User</SelectItem>
                                                            <SelectItem value="vip">VIP</SelectItem>
                                                            <SelectItem value="ambassador">Ambassador</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
