import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, DollarSign, Settings } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';
import ResourceManagement from '@/components/admin/ResourceManagement';
import CourseManagement from '@/components/admin/CourseManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Admin Dashboard - Biomimetic Dentistry Club"
        description="Administrative panel for managing users, content, and resources."
        keywords="admin, dashboard, management, biomimetic dentistry"
      />
      <Navigation />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your platform content and users</p>
          </motion.div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Course Management
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resource Library
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Analytics & Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="courses">
              <CourseManagement />
            </TabsContent>

            <TabsContent value="resources">
              <ResourceManagement />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;