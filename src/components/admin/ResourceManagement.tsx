import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

const ResourceManagement = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    file_name: '',
    file_type: '',
    access_level: 'public' as 'public' | 'vip' | 'ambassador' | 'admin',
    category: '',
    tags: [] as string[]
  });
  const { user } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const resourceData = {
        ...formData,
        created_by: user?.id
      };

      let result;
      if (editingResource) {
        result = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', editingResource.id);
      } else {
        result = await supabase
          .from('resources')
          .insert([resourceData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Resource ${editingResource ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      setEditingResource(null);
      setFormData({
        title: '',
        description: '',
        file_url: '',
        file_name: '',
        file_type: '',
        access_level: 'public',
        category: '',
        tags: []
      });
      fetchResources();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });

      fetchResources();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      file_url: resource.file_url,
      file_name: resource.file_name,
      file_type: resource.file_type,
      access_level: resource.access_level,
      category: resource.category || '',
      tags: resource.tags || []
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resource Management
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingResource ? 'Edit Resource' : 'Add New Resource'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">File URL</label>
                    <Input
                      value={formData.file_url}
                      onChange={(e) => setFormData(prev => ({...prev, file_url: e.target.value}))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">File Name</label>
                    <Input
                      value={formData.file_name}
                      onChange={(e) => setFormData(prev => ({...prev, file_name: e.target.value}))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">File Type</label>
                    <Input
                      value={formData.file_type}
                      onChange={(e) => setFormData(prev => ({...prev, file_type: e.target.value}))}
                      placeholder="e.g., PDF, DOC, MP4"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Access Level</label>
                    <Select
                      value={formData.access_level}
                      onValueChange={(value: any) => setFormData(prev => ({...prev, access_level: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="ambassador">Ambassador</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingResource ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.title}</TableCell>
                  <TableCell>{resource.file_type}</TableCell>
                  <TableCell>
                    <Badge variant={
                      resource.access_level === 'admin' ? 'destructive' :
                      resource.access_level === 'ambassador' ? 'secondary' :
                      resource.access_level === 'vip' ? 'outline' : 'default'
                    }>
                      {resource.access_level.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{resource.download_count}</TableCell>
                  <TableCell>
                    {new Date(resource.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditDialog(resource)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteResource(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceManagement;