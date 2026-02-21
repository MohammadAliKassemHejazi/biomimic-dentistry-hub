"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, Shield, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [pendingContent, setPendingContent] = useState<{ posts: BlogPost[], resources: Resource[] }>({ posts: [], resources: [] });
    const [loading, setLoading] = useState(true);

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
            const [usersData, appsData, contentData] = await Promise.all([
                api.get<{ users: User[] }>('/admin/users'),
                api.get<Application[]>('/admin/applications'),
                api.get<{ posts: BlogPost[], resources: Resource[] }>('/admin/content/pending')
            ]);
            setUsers(usersData.users);
            setApplications(appsData);
            setPendingContent(contentData);
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
        <div className="container mx-auto py-8 px-4">
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
                </TabsList>

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
                            <CardHeader>
                                <CardTitle>Pending Resources</CardTitle>
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
