"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Users, Globe, Award, Heart, BookOpen } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Humanity in Dentistry",
      description: "We believe dental care should be compassionate, understanding, and focused on the whole person."
    },
    {
      icon: <Stethoscope className="h-8 w-8" />,
      title: "Scientific Excellence",
      description: "Grounded in biomimetic principles and evidence-based practices for optimal patient outcomes."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Accessibility",
      description: "Making quality dental education and care accessible to communities worldwide."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Driven",
      description: "Building a network of passionate professionals united in transforming dental care."
    }
  ];

  const timeline = [
    {
      year: "2020",
      title: "Foundation",
      description: "Started as a small group of dental students passionate about biomimetic principles"
    },
    {
      year: "2021",
      title: "First Course Launch",
      description: "Launched our inaugural biomimetic dentistry course with 50 students"
    },
    {
      year: "2022",
      title: "Global Expansion",
      description: "Reached 500+ students across 15 countries"
    },
    {
      year: "2023",
      title: "Ambassador Program",
      description: "Launched our global ambassador program with representatives in 27 countries"
    },
    {
      year: "2024",
      title: "Innovation Hub",
      description: "Established research partnerships and advanced course offerings"
    }
  ];

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
              Transforming Dental Care Through
              <span className="text-secondary block mt-2">Biomimetic Science</span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              We're building a global community of dental professionals committed to
              making dentistry more human, accessible, and scientifically advanced.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                To revolutionize dental education and practice by making biomimetic dentistry
                principles accessible to every dental professional, regardless of their location
                or economic background.
              </p>
              <p className="text-lg text-muted-foreground">
                We believe that by combining scientific excellence with human compassion,
                we can create a future where dental care is not just about fixing teeth,
                but about preserving and enhancing natural oral health.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-2xl shadow-soft"
            >
              <Award className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Our Vision</h3>
              <p className="text-card-foreground/80">
                A world where every dental professional has access to cutting-edge
                biomimetic education, creating a global standard of care that prioritizes
                natural tooth preservation and patient-centered treatment approaches.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do, from course development to community building.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-scale">
                  <CardHeader className="text-center">
                    <div className="text-secondary mb-4 flex justify-center">{value.icon}</div>
                    <CardTitle>{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">{value.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Journey</h2>
            <p className="text-lg text-muted-foreground">
              From a small group of passionate students to a global movement.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <div
                key={item.year}
                className={`flex items-center mb-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="flex-1 md:px-8">
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="hover-scale">
                      <CardHeader>
                        <div className="text-secondary font-bold text-lg">{item.year}</div>
                        <CardTitle>{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{item.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
                <div className="hidden md:block w-4 h-4 bg-secondary rounded-full mx-4 flex-shrink-0"></div>
                <div className="flex-1 md:px-8"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Join Our Mission
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Be part of the global movement transforming dental care through
              biomimetic science and human-centered approaches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                <Users className="mr-2 h-5 w-5" />
                Become an Ambassador
              </Button>
              <Button variant="outline" size="lg" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Courses
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
