import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, DollarSign, Download, TrendingUp, Crown, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalUsers: number;
  totalResources: number;
  totalCourses: number;
  totalDownloads: number;
  usersByRole: Record<string, number>;
  recentActivity: Array<{
    type: 'user_joined' | 'resource_downloaded' | 'course_purchased';
    description: string;
    timestamp: string;
  }>;
}

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalResources: 0,
    totalCourses: 0,
    totalDownloads: 0,
    usersByRole: {},
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch user statistics
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('role, created_at');

      if (profilesError) throw profilesError;

      // Fetch resource statistics
      const { data: resources, error: resourcesError } = await supabase
        .from('resources')
        .select('download_count, created_at, title');

      if (resourcesError) throw resourcesError;

      // Fetch course statistics
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('created_at, title');

      if (coursesError) throw coursesError;

      // Calculate analytics
      const usersByRole = profiles?.reduce((acc, profile) => {
        acc[profile.role] = (acc[profile.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const totalDownloads = resources?.reduce((sum, resource) => sum + (resource.download_count || 0), 0) || 0;

      // Generate recent activity (mock data for now)
      const recentActivity = [
        ...profiles?.slice(0, 5).map(profile => ({
          type: 'user_joined' as const,
          description: `New user joined as ${profile.role}`,
          timestamp: profile.created_at
        })) || [],
        ...resources?.slice(0, 3).map(resource => ({
          type: 'resource_downloaded' as const,
          description: `Resource "${resource.title}" downloaded`,
          timestamp: resource.created_at
        })) || []
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

      setAnalytics({
        totalUsers: profiles?.length || 0,
        totalResources: resources?.length || 0,
        totalCourses: courses?.length || 0,
        totalDownloads,
        usersByRole,
        recentActivity
      });

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-red-500" />;
      case 'ambassador':
        return <Star className="h-4 w-4 text-purple-500" />;
      case 'vip':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_joined':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'resource_downloaded':
        return <Download className="h-4 w-4 text-blue-500" />;
      case 'course_purchased':
        return <DollarSign className="h-4 w-4 text-yellow-500" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalResources}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalDownloads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.usersByRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(role)}
                    <span className="capitalize">{role}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;