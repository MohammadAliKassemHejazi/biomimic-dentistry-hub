import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Users, Award, ChevronRight, MapPin, Star, Mail } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Ambassadors = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const benefits = [
    {
      icon: <Award className="h-8 w-8" />,
      title: "Professional Recognition",
      description: "Gain recognition as a biomimetic dentistry leader in your region and build your professional network."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Exclusive Mentorship",
      description: "Access to one-on-one mentorship sessions with industry experts and thought leaders."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Community",
      description: "Connect with like-minded professionals from around the world and share best practices."
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Early Access",
      description: "Be the first to access new courses, research, and educational materials before public release."
    }
  ];

  const responsibilities = [
    "Promote biomimetic dentistry principles in your local community",
    "Organize educational events and workshops",
    "Mentor local dental students and practitioners",
    "Contribute to our global knowledge base through case studies",
    "Provide feedback on new courses and educational materials",
    "Build partnerships with local dental institutions"
  ];

  const ambassadors = [
    {
      name: "Dr. Sarah Chen",
      country: "Singapore",
      region: "Southeast Asia",
      specialization: "Pediatric Biomimetic Dentistry",
      experience: "8 years",
      students: "150+",
      flag: "🇸🇬"
    },
    {
      name: "Dr. Carlos Mendoza",
      country: "Mexico",
      region: "Latin America",
      specialization: "Restorative Biomimetics",
      experience: "12 years",
      students: "200+",
      flag: "🇲🇽"
    },
    {
      name: "Dr. Amina Hassan",
      country: "Egypt",
      region: "Middle East & Africa",
      specialization: "Preventive Biomimetics",
      experience: "10 years",
      students: "180+",
      flag: "🇪🇬"
    },
    {
      name: "Dr. James Thompson",
      country: "United Kingdom",
      region: "Europe",
      specialization: "Advanced Restorations",
      experience: "15 years",
      students: "300+",
      flag: "🇬🇧"
    },
    {
      name: "Dr. Yuki Tanaka",
      country: "Japan",
      region: "East Asia",
      specialization: "Biomimetic Research",
      experience: "11 years",
      students: "220+",
      flag: "🇯🇵"
    },
    {
      name: "Dr. Priya Sharma",
      country: "India",
      region: "South Asia",
      specialization: "Community Dentistry",
      experience: "9 years",
      students: "250+",
      flag: "🇮🇳"
    }
  ];

  const testimonials = [
    {
      quote: "Being an ambassador has transformed my practice and allowed me to impact dental care across Southeast Asia.",
      author: "Dr. Sarah Chen",
      country: "Singapore",
      flag: "🇸🇬"
    },
    {
      quote: "The mentorship and community support have been invaluable in advancing biomimetic principles in Mexico.",
      author: "Dr. Carlos Mendoza", 
      country: "Mexico",
      flag: "🇲🇽"
    },
    {
      quote: "Through this program, I've been able to train hundreds of dentists in evidence-based biomimetic techniques.",
      author: "Dr. James Thompson",
      country: "United Kingdom", 
      flag: "🇬🇧"
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
              Ambassador Program
              <span className="text-secondary block mt-2">Lead the Movement</span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Join our global network of dental professionals leading the biomimetic dentistry 
              revolution in their communities. Grow with us and make a lasting impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="btn-hero">
                Apply Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Program Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">What is an Ambassador?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our ambassadors are passionate dental professionals who serve as regional leaders, 
              educators, and advocates for biomimetic dentistry principles in their local communities.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-foreground mb-6">Your Role & Impact</h3>
              <div className="space-y-4">
                {responsibilities.map((responsibility, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start"
                  >
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-muted-foreground">{responsibility}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-2xl shadow-soft"
            >
              <div className="text-center">
                <div className="bg-secondary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-10 w-10 text-secondary" />
                </div>
                <h4 className="text-xl font-bold text-card-foreground mb-2">Global Reach</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">27</div>
                    <div className="text-sm text-muted-foreground">Countries</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">500+</div>
                    <div className="text-sm text-muted-foreground">Students</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">50+</div>
                    <div className="text-sm text-muted-foreground">Events</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">95%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Ambassador Benefits</h2>
            <p className="text-lg text-muted-foreground">
              Grow professionally while making a global impact on dental care.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-scale text-center">
                  <CardHeader>
                    <div className="text-secondary mb-4 flex justify-center">{benefit.icon}</div>
                    <CardTitle>{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Ambassadors */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Ambassadors</h2>
            <p className="text-lg text-muted-foreground">
              Passionate professionals leading biomimetic dentistry worldwide.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ambassadors.map((ambassador, index) => (
              <motion.div
                key={ambassador.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover-scale">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{ambassador.region}</Badge>
                      <span className="text-2xl">{ambassador.flag}</span>
                    </div>
                    <CardTitle>{ambassador.name}</CardTitle>
                    <CardDescription>
                      <MapPin className="inline w-4 h-4 mr-1" />
                      {ambassador.country}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div><strong>Specialization:</strong> {ambassador.specialization}</div>
                      <div><strong>Experience:</strong> {ambassador.experience}</div>
                      <div><strong>Students Mentored:</strong> {ambassador.students}</div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      <Mail className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Ambassador Stories</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <blockquote className="text-card-foreground mb-4">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{testimonial.flag}</span>
                      <div>
                        <div className="font-semibold text-card-foreground">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.country}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
              Ready to Lead the Change?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join our global community of dental professionals committed to advancing 
              biomimetic dentistry and improving patient care worldwide.
            </p>
            <Button variant="secondary" size="lg" className="btn-hero">
              Apply to Become an Ambassador
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Ambassadors;