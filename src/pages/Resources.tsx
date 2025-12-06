import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, FileText, Lock, Crown, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  file_type: string;
  access_level: 'public' | 'vip' | 'ambassador' | 'admin';
  category: string;
  tags: string[];
  download_count: number;
  created_at: string;
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data as Resource[] || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canAccessResource = (resource: Resource) => {
    if (!profile) return resource.access_level === 'public';
    
    const roleHierarchy = ['user', 'vip', 'ambassador', 'admin'];
    const userRoleLevel = roleHierarchy.indexOf(profile.role);
    const resourceLevel = roleHierarchy.indexOf(resource.access_level === 'public' ? 'user' : resource.access_level);
    
    return userRoleLevel >= resourceLevel;
  };

  const downloadResource = async (resource: Resource) => {
    if (!canAccessResource(resource)) {
      toast({
        title: "Access Denied",
        description: "You need a higher membership level to access this resource.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Increment download count
      await supabase
        .from('resources')
        .update({ download_count: resource.download_count + 1 })
        .eq('id', resource.id);

      // Open download link
      window.open(resource.file_url, '_blank');
      
      toast({
        title: "Success",
        description: "Download started successfully!",
      });
      
      // Refresh resources to update download count
      fetchResources();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getAccessIcon = (level: string) => {
    switch (level) {
      case 'vip':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'ambassador':
        return <Crown className="h-4 w-4 text-purple-500" />;
      case 'admin':
        return <Lock className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-green-500" />;
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(resources.map(r => r.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Resource Library - Biomimetic Dentistry Club"
        description="Access exclusive dental resources, research papers, and educational materials."
        keywords="dental resources, biomimetic research, dental education, downloadable content"
      />
      <Navigation />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">Resource Library</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access exclusive dental resources, research papers, and educational materials
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className={`h-full transition-all duration-200 hover:shadow-lg ${
                  canAccessResource(resource) ? '' : 'opacity-60'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                      {getAccessIcon(resource.access_level)}
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {resource.access_level.toUpperCase()}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {resource.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.tags?.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{resource.file_type.toUpperCase()}</span>
                      <span>{resource.download_count} downloads</span>
                    </div>

                    <Button
                      onClick={() => downloadResource(resource)}
                      disabled={!canAccessResource(resource)}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {canAccessResource(resource) ? 'Download' : 'Upgrade Required'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredResources.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No resources found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Resources;