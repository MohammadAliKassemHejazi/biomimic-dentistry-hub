"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  BookOpen,
  Download,
  Calendar,
  Star,
  Crown,
  Zap,
  FileText,
  Clock,
  TrendingUp,
  Settings,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/queries/useSubscription';
import { api } from '@/lib/api';

interface UserStats {
  totalDownloads: number;
  coursesCompleted: number;
  memberSince: string;
}

interface RecentActivity {
  id: string;
  type: 'download' | 'course' | 'resource';
  title: string;
  date: string;
  description: string;
}

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<UserStats>({
    totalDownloads: 0,
    coursesCompleted: 0,
    memberSince: new Date().toISOString(),
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  const { data: subscriptionStatus } = useSubscription();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
        router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
        const statsData = await api.get<UserStats>('/users/stats');
        setStats(statsData);

        // Fetch analytics dashboard data for recent activity or use a dedicated endpoint if available
        // For now, using a mock or if there is an endpoint for user activity
        // Since API_REQUIREMENTS.md doesn't specify a user activity endpoint, we'll keep the mock logic for now
        // or try to infer from analytics if possible.
        // Assuming we might need to add an endpoint for this later.
        // Reverting to mock for activity as placeholder until backend supports it fully
         const mockActivity: RecentActivity[] = [
            {
              id: '1',
              type: 'download',
              title: 'Biomimetic Restoration Guide',
              date: new Date(Date.now() - 86400000).toISOString(),
              description: 'Downloaded resource'
            },
            {
              id: '2',
              type: 'course',
              title: 'Advanced Adhesive Techniques',
              date: new Date(Date.now() - 172800000).toISOString(),
              description: 'Enrolled in course'
            }
          ];
          setRecentActivity(mockActivity);

    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };


  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-5 w-5 text-red-500" />;
      case 'ambassador':
        return <Star className="h-5 w-5 text-purple-500" />;
      case 'vip':
        return <Star className="h-5 w-5 text-yellow-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'destructive',
      ambassador: 'secondary',
      vip: 'outline',
      user: 'default'
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'default'}>
        {role.toUpperCase()}
      </Badge>
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'download':
        return <Download className="h-4 w-4 text-blue-500" />;
      case 'course':
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'resource':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Welcome back, {user?.first_name || user?.email}!
                </h1>
                <p className="text-muted-foreground">
                  Continue your dental education journey
                </p>
              </div>
              <div className="flex items-center gap-3">
                {getRoleIcon(user?.role || 'user')}
                {getRoleBadge(user?.role || 'user')}
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDownloads}</div>
                  <p className="text-xs text-muted-foreground">
                    Resources downloaded
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.coursesCompleted}</div>
                  <p className="text-xs text-muted-foreground">
                    Courses purchased
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date(stats.memberSince).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor((Date.now() - new Date(stats.memberSince).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subscriptionStatus?.subscribed ? 'Active' : 'Free'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {subscriptionStatus?.subscribed ? 'Premium member' : 'Upgrade available'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1">
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No recent activity</p>
                      <p className="text-sm text-muted-foreground">
                        Start exploring our courses and resources!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href="/courses">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Courses
                    </a>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href="/resources">
                      <FileText className="mr-2 h-4 w-4" />
                      Resource Library
                    </a>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href="/subscription">
                      <Trophy className="mr-2 h-4 w-4" />
                      Upgrade Plan
                    </a>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <a href="/contact">
                      <Settings className="mr-2 h-4 w-4" />
                      Get Support
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Subscription Status */}
              {!subscriptionStatus?.subscribed && (
                <Card className="mt-6 border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Upgrade Your Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Unlock premium content, advanced courses, and exclusive resources.
                    </p>
                    <Button className="w-full" asChild>
                      <a href="/subscription">
                        <Crown className="mr-2 h-4 w-4" />
                        View Plans
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
