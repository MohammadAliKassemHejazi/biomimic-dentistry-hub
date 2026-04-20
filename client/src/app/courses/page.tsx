"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Users, Star, Bell } from 'lucide-react';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCourses } from '@/hooks/queries/useCourses';
import { useRouter } from 'next/navigation';

const Courses = () => {
  const [notifyEmails, setNotifyEmails] = useState<{ [key: string]: string }>({});
  const [comingSoonEmail, setComingSoonEmail] = useState('');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const { data: courses = [], isLoading: coursesLoading } = useCourses();

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleNotifyMe = async (courseId: string) => {
    const email = notifyEmails[courseId];
    if (!email) {
      toast({
        title: "Failed",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically save the email to a notifications table
    // For now we just show a success message
    toast({
      title: "Success",
      description: "You'll be notified when this course launches!",
    });

    setNotifyEmails({ ...notifyEmails, [courseId]: '' });
  };

  const handleComingSoonNotify = async () => {
    if (!comingSoonEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(comingSoonEmail)) {
      toast({
        title: "Failed",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "You're on the list!",
      description: "We'll notify you as soon as courses launch.",
    });
    setComingSoonEmail('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (authLoading || coursesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">

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
              Biomimetic Dentistry
              <span className="text-secondary block mt-2">Courses & Resources</span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Transform your practice with cutting-edge biomimetic techniques.
              Affordable, accessible, and designed for every dental professional.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">Philosophy</h3>
              <p className="text-lg">Affordable. Accessible. For Everyone.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Available Courses</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive biomimetic dentistry education designed by experts for practitioners at every level.
            </p>
          </motion.div>

          {courses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="bg-card p-12 rounded-2xl shadow-soft max-w-2xl mx-auto">
                <Calendar className="h-16 w-16 text-secondary mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-card-foreground mb-4">
                  Exciting Courses Coming Soon!
                </h3>
                <p className="text-card-foreground/80 mb-6">
                  We're putting the final touches on our comprehensive biomimetic dentistry curriculum.
                  Be the first to know when our courses launch!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1"
                    value={comingSoonEmail}
                    onChange={(e) => setComingSoonEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComingSoonNotify()}
                  />
                  <Button variant="default" onClick={handleComingSoonNotify}>
                    <Bell className="mr-2 h-4 w-4" />
                    Notify Me
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover-scale">
                    {course.featured_image && (
                      <div className="aspect-video overflow-hidden rounded-t-lg relative">
                        <Image
                          src={course.featured_image}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={course.coming_soon ? "secondary" : "default"}>
                          {course.coming_soon ? "Coming Soon" : "Available Now"}
                        </Badge>
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(course.price)}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <CardDescription className="mb-4 line-clamp-3">
                        {course.description}
                      </CardDescription>

                      {course.coming_soon ? (
                        <div className="space-y-3">
                          {course.launch_date && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="mr-2 h-4 w-4" />
                              Expected: {new Date(course.launch_date).toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Input
                              type="email"
                              placeholder="Email for updates"
                              value={notifyEmails[course.id] || ''}
                              onChange={(e) =>
                                setNotifyEmails({
                                  ...notifyEmails,
                                  [course.id]: e.target.value,
                                })
                              }
                              className="text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleNotifyMe(course.id)}
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Users className="mr-1 h-4 w-4" />
                              150+ enrolled
                            </div>
                            <div className="flex items-center">
                              <Star className="mr-1 h-4 w-4 fill-current text-yellow-500" />
                              4.9
                            </div>
                          </div>
                          <Button className="w-full">
                            Enroll Now - {formatPrice(course.price)}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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

export default Courses;
