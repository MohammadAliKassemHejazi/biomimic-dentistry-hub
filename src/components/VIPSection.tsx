import React from 'react';
import { Crown, Star, Users, Zap, MessageCircle, BookOpen, Calendar, Trophy } from 'lucide-react';

const VIPSection = () => {
  const vipMembers = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      title: 'Founder & Chief Scientific Officer',
      expertise: 'Biomimetic Materials Research',
      achievements: '15+ Years Experience, 50+ Publications',
      image: '👩‍⚕️',
      status: 'Founder'
    },
    {
      id: 2,
      name: 'Prof. Michael Rodriguez',
      title: 'Head of Education',
      expertise: 'Clinical Biomimetic Techniques',
      achievements: 'Harvard Dental School, 200+ Students Mentored',
      image: '👨‍🏫',
      status: 'Advisor'
    },
    {
      id: 3,
      name: 'Dr. Aisha Patel',
      title: 'Global Ambassador Coordinator',
      expertise: 'International Dental Education',
      achievements: 'WHO Consultant, 30+ Countries Visited',
      image: '👩‍💼',
      status: 'Coordinator'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      title: 'Research Director',
      expertise: 'Minimally Invasive Dentistry',
      achievements: 'Nobel Prize Nominee, 100+ Research Papers',
      image: '👨‍🔬',
      status: 'Director'
    }
  ];

  const vipTiers = [
    {
      name: 'Bronze VIP',
      price: '$29/month',
      color: 'from-accent-light to-accent',
      features: [
        'Monthly Q&A Sessions',
        'Exclusive Course Discounts (20%)',
        'Priority Email Support',
        'VIP Community Access',
        'Monthly Newsletter'
      ],
      icon: Trophy
    },
    {
      name: 'Silver VIP',
      price: '$59/month',
      color: 'from-gray-300 to-gray-500',
      features: [
        'All Bronze Benefits',
        'Bi-weekly Group Mentorship',
        'Course Discounts (40%)',
        'Direct Mentor Access',
        'Case Study Reviews',
        'Early Course Access'
      ],
      icon: Star,
      popular: true
    },
    {
      name: 'Gold VIP',
      price: '$99/month',
      color: 'from-secondary to-secondary-light',
      features: [
        'All Silver Benefits',
        'Weekly 1:1 Mentorship',
        'Free Course Access',
        'Personal Career Guidance',
        'Research Collaboration',
        'Speaking Opportunities'
      ],
      icon: Crown
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Founder': return 'from-secondary to-secondary-light';
      case 'Advisor': return 'from-primary to-primary-light';
      case 'Director': return 'from-accent to-accent-light';
      default: return 'from-muted to-muted-foreground';
    }
  };

  return (
    <section id="vip" className="section-padding bg-muted/30">
      <div className="section-container">
        {/* VIP People Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-secondary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Leadership Team</h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet the visionaries and experts driving our mission to revolutionize dental education 
              and make biomimetic techniques accessible worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {vipMembers.map((member, index) => (
              <div
                key={member.id}
                className={`card-hover bg-card rounded-2xl p-6 shadow-soft fade-in-up stagger-${index % 4 + 1}`}
              >
                {/* Status Badge */}
                <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(member.status)} text-white text-xs font-semibold mb-4`}>
                  {member.status}
                </div>

                {/* Profile Image */}
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{member.image}</div>
                  <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                  <p className="text-primary font-semibold text-sm mb-2">{member.title}</p>
                </div>

                {/* Expertise */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Expertise</h4>
                    <p className="text-muted-foreground text-sm">{member.expertise}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Achievements</h4>
                    <p className="text-muted-foreground text-sm">{member.achievements}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VIP Program Section */}
        <div>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-accent" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">VIP Membership Program</h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get direct access to our experts, exclusive courses, and personalized mentorship 
              to accelerate your journey in biomimetic dentistry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vipTiers.map((tier, index) => {
              const IconComponent = tier.icon;
              return (
                <div
                  key={tier.name}
                  className={`relative card-hover bg-card rounded-2xl p-8 shadow-medium fade-in-up stagger-${index + 1} ${
                    tier.popular ? 'ring-2 ring-secondary scale-105' : ''
                  }`}
                >
                  {/* Popular Badge */}
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Tier Header */}
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${tier.color} rounded-2xl flex items-center justify-center`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{tier.name}</h3>
                    <p className="text-3xl font-bold text-primary">{tier.price}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button className={`w-full font-semibold py-3 rounded-lg transition-smooth ${
                    tier.popular 
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}>
                    Choose {tier.name}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Additional Benefits */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-card rounded-2xl shadow-soft">
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Direct Expert Access</h3>
              <p className="text-muted-foreground">Connect directly with leading biomimetic dentistry experts and researchers.</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-card rounded-2xl shadow-soft">
              <BookOpen className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Exclusive Content</h3>
              <p className="text-muted-foreground">Access premium courses, case studies, and research materials not available elsewhere.</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-card rounded-2xl shadow-soft">
              <Calendar className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Flexible Scheduling</h3>
              <p className="text-muted-foreground">Schedule mentorship sessions and Q&As at times that work for your busy schedule.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VIPSection;