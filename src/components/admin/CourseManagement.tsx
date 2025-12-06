import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  featured_image: string;
  coming_soon: boolean;
  launch_date: string;
  access_level: 'public' | 'vip' | 'ambassador' | 'admin';
  stripe_price_id: string;
  created_at: string;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: 0,
    featured_image: '',
    coming_soon: false,
    launch_date: '',
    access_level: 'public' as 'public' | 'vip' | 'ambassador' | 'admin',
    stripe_price_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data as Course[] || []);
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const courseData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        launch_date: formData.launch_date || null
      };

      let result;
      if (editingCourse) {
        result = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);
      } else {
        result = await supabase
          .from('courses')
          .insert([courseData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Course ${editingCourse ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      setEditingCourse(null);
      setFormData({
        title: '',
        slug: '',
        description: '',
        price: 0,
        featured_image: '',
        coming_soon: false,
        launch_date: '',
        access_level: 'public',
        stripe_price_id: ''
      });
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course deleted successfully",
      });

      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      price: course.price,
      featured_image: course.featured_image || '',
      coming_soon: course.coming_soon,
      launch_date: course.launch_date || '',
      access_level: course.access_level,
      stripe_price_id: course.stripe_price_id || ''
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Course Management
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setFormData(prev => ({
                          ...prev, 
                          title,
                          slug: prev.slug === generateSlug(prev.title) ? generateSlug(title) : prev.slug
                        }));
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Slug</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({...prev, slug: e.target.value}))}
                      placeholder="Auto-generated from title"
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
                    <label className="text-sm font-medium">Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Stripe Price ID</label>
                    <Input
                      value={formData.stripe_price_id}
                      onChange={(e) => setFormData(prev => ({...prev, stripe_price_id: e.target.value}))}
                      placeholder="price_..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Featured Image URL</label>
                  <Input
                    value={formData.featured_image}
                    onChange={(e) => setFormData(prev => ({...prev, featured_image: e.target.value}))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.coming_soon}
                    onCheckedChange={(checked) => setFormData(prev => ({...prev, coming_soon: checked}))}
                  />
                  <label className="text-sm font-medium">Coming Soon</label>
                </div>

                {formData.coming_soon && (
                  <div>
                    <label className="text-sm font-medium">Launch Date</label>
                    <Input
                      type="datetime-local"
                      value={formData.launch_date}
                      onChange={(e) => setFormData(prev => ({...prev, launch_date: e.target.value}))}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCourse ? 'Update' : 'Create'}
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
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>${course.price}</TableCell>
                  <TableCell>
                    <Badge variant={course.coming_soon ? 'secondary' : 'default'}>
                      {course.coming_soon ? 'Coming Soon' : 'Available'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {course.access_level.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(course.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openEditDialog(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteCourse(course.id)}
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

export default CourseManagement;