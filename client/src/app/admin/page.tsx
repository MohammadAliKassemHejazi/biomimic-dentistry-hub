"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, Edit } from 'lucide-react';

// Types
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
    expertise?: string;
    achievements?: string;
    status?: string;
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
    const [loading, setLoading] = useState(true);

    // Dialog States
    const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
    const [memberDialogOpen, setMemberDialogOpen] = useState(false);
    const [planDialogOpen, setPlanDialogOpen] = useState(false);
    const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null); // Generic holder for item being edited

    useEffect(() => {
        if (!authLoading) {
            if (user?.role === 'admin') {
                fetchData();
            } else {
                 setLoading(false); // Not admin, stop loading
            }
        }
    }, [user, authLoading]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, appsData, contentData, partnersData, membersData, plansData] = await Promise.all([
                api.get<{ users: User[] }>('/admin/users'),
                api.get<Application[]>('/admin/applications'),
                api.get<{ posts: BlogPost[], resources: Resource[] }>('/admin/content/pending'),
                api.get<TrustedPartner[]>('/partners'),
                api.get<LeadershipMember[]>('/leadership'),
                api.get<SubscriptionPlan[]>('/plans')
            ]);
            setUsers(usersData.users);
            setApplications(appsData);
            setPendingContent(contentData);
            setPartners(partnersData);
            setMembers(membersData);
            setPlans(plansData);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
            toast({ title: "Error", description: "Failed to load dashboard data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleApproveApp = async (id: string) => {
        try {
            await api.patch(`/admin/applications/${id}/status`, { status: 'approved' });
            toast({ title: "Approved", description: "Application approved" });
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
        }
    };

    const handleRejectApp = async (id: string) => {
        try {
            await api.patch(`/admin/applications/${id}/status`, { status: 'rejected' });
            toast({ title: "Rejected", description: "Application rejected" });
            fetchData();
        } catch (error) {
             toast({ title: "Error", description: "Failed to reject", variant: "destructive" });
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
            fetchData();
        } catch (error) {
             toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
             toast({ title: "Success", description: "User role updated" });
             fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
        }
    }

    const handleResourceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        try {
            await api.post('/resources', formData);
            toast({ title: "Success", description: "Resource created" });
            setResourceDialogOpen(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to create resource", variant: "destructive" });
        }
    };

    const handlePartnerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        try {
            if (editingItem) {
                await api.put(`/partners/${editingItem.id}`, formData);
                toast({ title: "Success", description: "Partner updated" });
            } else {
                await api.post('/partners', formData);
                toast({ title: "Success", description: "Partner created" });
            }
            setPartnerDialogOpen(false);
            setEditingItem(null);
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to save partner", variant: "destructive" });
        }
    };

    const handleDeletePartner = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/partners/${id}`);
            toast({ title: "Success", description: "Partner deleted" });
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete partner", variant: "destructive" });
        }
    };

    const handleMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        try {
            if (editingItem) {
                await api.put(`/leadership/${editingItem.id}`, formData);
                toast({ title: "Success", description: "Member updated" });
            } else {
                await api.post('/leadership', formData);
                toast({ title: "Success", description: "Member created" });
            }
            setMemberDialogOpen(false);
            setEditingItem(null);
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to save member", variant: "destructive" });
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/leadership/${id}`);
            toast({ title: "Success", description: "Member deleted" });
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete member", variant: "destructive" });
        }
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
            toast({ title: "Success", description: "Plan updated" });
            setPlanDialogOpen(false);
            setEditingItem(null);
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update plan", variant: "destructive" });
        }
    };

    if (authLoading || loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    if (!user || user.role !== 'admin') {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 pt-24">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                Admin Dashboard
            </h1>

            <Tabs defaultValue="applications" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="applications" className="relative">
                        Ambassador Applications
                        {applications.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                                {applications.length}
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
                </TabsList>

                <TabsContent value="partners">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Trusted Partners</CardTitle>
                                <CardDescription>Manage trusted partners and sponsors.</CardDescription>
                            </div>
                            <Dialog open={partnerDialogOpen} onOpenChange={(open) => {
                                setPartnerDialogOpen(open);
                                if (!open) setEditingItem(null);
                            }}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => setEditingItem(null)}><Plus className="mr-2 h-4 w-4"/> Add Partner</Button>
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
                                                <Button variant="ghost" size="sm" onClick={() => { setEditingItem(p); setPartnerDialogOpen(true); }}><Edit className="h-4 w-4"/></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeletePartner(p.id)} className="text-destructive"><Trash className="h-4 w-4"/></Button>
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
                                    <Button onClick={() => setEditingItem(null)}><Plus className="mr-2 h-4 w-4"/> Add Member</Button>
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
                                                <Button variant="ghost" size="sm" onClick={() => { setEditingItem(m); setMemberDialogOpen(true); }}><Edit className="h-4 w-4"/></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteMember(m.id)} className="text-destructive"><Trash className="h-4 w-4"/></Button>
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
                                    await api.post('/plans/seed', {});
                                    fetchData();
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
                                                        <Button variant="ghost" size="sm" onClick={() => { setEditingItem(p); setPlanDialogOpen(true); }}><Edit className="h-4 w-4"/></Button>
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
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <Button onClick={() => handleApproveApp(app.id)} size="sm" className="bg-green-600 hover:bg-green-700">
                                                            <Check className="mr-2 h-4 w-4"/> Approve
                                                        </Button>
                                                        <Button onClick={() => handleRejectApp(app.id)} variant="destructive" size="sm">
                                                            <X className="mr-2 h-4 w-4"/> Reject
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
                                        <Button size="sm"><Plus className="mr-2 h-4 w-4"/> Add Resource</Button>
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
                                                        <SelectTrigger className="w-[130px]">
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
