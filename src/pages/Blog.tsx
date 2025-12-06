import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, User, Calendar, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles!blog_posts_author_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Set sample posts for demo
      setPosts([
        {
          id: '1',
          title: 'Introduction to Biomimetic Dentistry: Nature\'s Blueprint for Dental Care',
          slug: 'intro-to-biomimetic-dentistry',
          excerpt: 'Discover how biomimetic dentistry mimics nature\'s own design principles to preserve and restore teeth in the most natural way possible.',
          content: '',
          featured_image: '/api/placeholder/600/400',
          category: 'Philosophy',
          tags: ['biomimetics', 'natural dentistry', 'tooth preservation'],
          read_time: 8,
          created_at: '2024-01-15T10:00:00Z',
          profiles: {
            first_name: 'Dr. Sarah',
            last_name: 'Chen'
          }
        },
        {
          id: '2',
          title: 'Case Study: Restoring Function and Aesthetics with Minimal Intervention',
          slug: 'case-study-minimal-intervention',
          excerpt: 'A detailed look at how biomimetic techniques can achieve remarkable results while preserving maximum natural tooth structure.',
          content: '',
          featured_image: '/api/placeholder/600/400',
          category: 'Case Study',
          tags: ['case study', 'restoration', 'minimal intervention'],
          read_time: 12,
          created_at: '2024-01-10T14:30:00Z',
          profiles: {
            first_name: 'Dr. Michael',
            last_name: 'Rodriguez'
          }
        },
        {
          id: '3',
          title: 'The Science Behind Tooth Biomechanics and Stress Distribution',
          slug: 'tooth-biomechanics-stress-distribution',
          excerpt: 'Understanding how natural teeth handle forces and how we can replicate these mechanisms in restorative dentistry.',
          content: '',
          featured_image: '/api/placeholder/600/400',
          category: 'Science',
          tags: ['biomechanics', 'research', 'tooth structure'],
          read_time: 15,
          created_at: '2024-01-05T09:15:00Z',
          profiles: {
            first_name: 'Dr. Emily',
            last_name: 'Thompson'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(posts.map(post => post.category))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Knowledge Hub &
              <span className="text-secondary block mt-2">Insights</span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Explore the latest research, case studies, and insights in biomimetic dentistry 
              from our global community of experts and practitioners.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                size="sm"
              >
                All Categories
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="bg-card p-12 rounded-2xl shadow-soft max-w-2xl mx-auto">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-card-foreground mb-4">
                  No articles found
                </h3>
                <p className="text-card-foreground/80">
                  Try adjusting your search terms or category filter to find what you're looking for.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/blog/${post.slug}`}>
                    <Card className="h-full hover-scale group">
                      {post.featured_image && (
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{post.category}</Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {post.read_time} min read
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <CardDescription className="mb-4 line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            {post.profiles?.first_name} {post.profiles?.last_name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(post.created_at)}
                          </div>
                        </div>

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {post.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="mr-1 h-2 w-2" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;