import React, { useEffect, useState } from 'react';
import { Crown, Star, Zap, MessageCircle, BookOpen, Calendar, Trophy } from 'lucide-react';
import { api } from '@/lib/api';

interface LeadershipMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
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

  const getEmojiForMember = (member: LeadershipMember) => {
    if (member.image) return member.image;

    // Auto-assign emoji based on title/role
    const title = (member.role || '').toLowerCase();
    const name = (member.name || '').toLowerCase();

    if (title.includes('founder')) return '👩‍⚕️';
    if (title.includes('education') || title.includes('professor') || name.includes('prof')) return '👨‍🏫';
    if (title.includes('ambassador')) return '👩‍💼';
    if (title.includes('research')) return '👨‍🔬';
    if (name.includes('dr')) return '👨‍⚕️';

    return '👤';
  };

  const getIconForKey = (key: string) => {
    switch(key) {
        case 'basic': return Trophy; // Bronze equivalent
        case 'vip': return Star; // Silver equivalent
        case 'ambassador': return Crown; // Gold equivalent
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
               icon: getIconForKey(p.key),
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
                  <div className="text-6xl mb-3">{getEmojiForMember(member)}</div>
                  <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                  <p className="text-primary font-semibold text-sm mb-2">{member.role}</p>
                </div>

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
              to accelerate your journey in biomimetic dentistry.
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
