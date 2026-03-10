"use client"

import React, { useEffect, useState } from 'react';
import { Crown, Star, Zap, MessageCircle, BookOpen, Calendar, Trophy, Instagram, Facebook } from 'lucide-react';
import { api } from '@/lib/api';

interface LeadershipMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  expertise?: string;
  achievements?: string;
  status?: string;
}

interface SubscriptionTier {
  name: string;
  price: number;
  interval: string;
  features: string[];
  icon: any;
  popular?: boolean;
  color?: string;
  key: string;
}

const VIPSection = () => {
  const [members, setMembers] = useState<LeadershipMember[]>([]);
  const [plans, setPlans] = useState<SubscriptionTier[]>([]);

  const getProfileContent = (member: LeadershipMember) => {
    if (member.image) {
      if (member.image.startsWith('http') || member.image.startsWith('/')) {
        const imageUrl = member.image.startsWith('/')
            ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${member.image}`
            : member.image;
        return <img src={imageUrl} alt={member.name} className="w-24 h-24 mx-auto rounded-full object-cover shadow-sm border-2 border-primary/10" />;
      }
      return <div className="text-6xl">{member.image}</div>;
    }

    // Auto-assign emoji based on title/role
    const title = (member.role || '').toLowerCase();
    const name = (member.name || '').toLowerCase();

    let emoji = '👤';
    if (title.includes('founder')) emoji = '👩‍⚕️';
    else if (title.includes('education') || title.includes('professor') || name.includes('prof')) emoji = '👨‍🏫';
    else if (title.includes('ambassador')) emoji = '👩‍💼';
    else if (title.includes('research')) emoji = '👨‍🔬';
    else if (name.includes('dr')) emoji = '👨‍⚕️';

    return <div className="text-6xl">{emoji}</div>;
  };

  const getIconForName = (iconName: string) => {
    switch(iconName?.toLowerCase()) {
        case 'trophy': return Trophy;
        case 'star': return Star;
        case 'crown': return Crown;
        case 'zap': return Zap;
        default: return Star;
    }
  };

  const getColorForKey = (key: string) => {
      switch(key) {
          case 'basic': return 'from-accent-light to-accent';
          case 'vip': return 'from-gray-300 to-gray-500';
          case 'ambassador': return 'from-secondary to-secondary-light';
          default: return 'from-primary to-primary-light';
      }
  };

  useEffect(() => {
    // Fetch Leadership Members
    api.get<LeadershipMember[]>('/leadership')
      .then(setMembers)
      .catch(console.error);

    // Fetch Subscription Plans
    api.get<any[]>('/plans')
      .then(data => {
        if (data && data.length > 0) {
           const mappedPlans = data.map(p => ({
               name: p.name,
               price: parseFloat(p.price), // backend returns string for decimal
               interval: p.interval,
               features: p.features,
               popular: p.popular,
               key: p.key,
               icon: getIconForName(p.icon),
               color: getColorForKey(p.key)
           }));
           // Sort plans by price to ensure correct order (Basic -> VIP -> Ambassador)
           mappedPlans.sort((a, b) => a.price - b.price);
           setPlans(mappedPlans);
        }
      })
      .catch(console.error);
  }, []);

  const getStatusColor = (status: string) => {
    if (!status) return 'from-muted to-muted-foreground';

    switch (status) {
      case 'Founder': return 'from-secondary to-secondary-light';
      case 'Advisor': return 'from-primary to-primary-light';
      case 'Director': return 'from-accent to-accent-light';
      case 'Coordinator': return 'from-blue-400 to-blue-600';
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
            {members.map((member, index) => (
              <div
                key={member.id}
                className={`card-hover bg-card rounded-2xl p-6 shadow-soft fade-in-up stagger-${index % 4 + 1}`}
              >
                {/* Status Badge */}
                {member.status && (
                    <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(member.status)} text-white text-xs font-semibold mb-4`}>
                    {member.status}
                    </div>
                )}

                {/* Profile Image */}
                <div className="text-center mb-4">
                  <div className="mb-4 flex items-center justify-center">
                    {getProfileContent(member)}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                  <p className="text-primary font-semibold text-sm mb-2">{member.role}</p>
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-3 mb-4">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                    </a>
                  )}
                  {member.twitter && (
                    <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                    </a>
                  )}
                  {member.instagram && (
                    <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {member.facebook && (
                    <a href={member.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>

                {/* Bio */}
                {member.bio && (
                  <p className="text-muted-foreground text-sm text-center leading-relaxed mb-4">
                    {member.bio}
                  </p>
                )}

                {/* Expertise */}
                <div className="space-y-3">
                  {member.expertise && (
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">Expertise</h4>
                        <p className="text-muted-foreground text-sm">{member.expertise}</p>
                    </div>
                  )}
                  {member.achievements && (
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">Achievements</h4>
                        <p className="text-muted-foreground text-sm">{member.achievements}</p>
                    </div>
                  )}
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
              to accelerate your journey in biomimetic techniques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((tier, index) => {
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
                    <p className="text-3xl font-bold text-primary">${tier.price}/{tier.interval}</p>
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
