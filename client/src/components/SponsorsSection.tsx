import React from 'react';
import { Building2, Award, HandHeart } from 'lucide-react';

const SponsorsSection = () => {
  const sponsors = [
    {
      id: 1,
      name: 'BioMimetic Institute',
      role: 'Research Partner',
      description: 'Leading research in biomimetic dental materials and techniques.',
      logo: '🔬',
      tier: 'Platinum'
    },
    {
      id: 2,
      name: 'Natural Dental Solutions',
      role: 'Technology Sponsor',
      description: 'Innovative dental equipment and sustainable materials.',
      logo: '🌱',
      tier: 'Gold'
    },
    {
      id: 3,
      name: 'Global Health Foundation',
      role: 'Education Sponsor',
      description: 'Supporting accessible dental education worldwide.',
      logo: '🌍',
      tier: 'Gold'
    },
    {
      id: 4,
      name: 'DentaCare International',
      role: 'Clinical Partner',
      description: 'Providing clinical expertise and mentorship programs.',
      logo: '🦷',
      tier: 'Silver'
    },
    {
      id: 5,
      name: 'EcoMaterials Corp',
      role: 'Materials Supplier',
      description: 'Sustainable and biocompatible dental materials.',
      logo: '♻️',
      tier: 'Silver'
    },
    {
      id: 6,
      name: 'Student Dental Network',
      role: 'Community Partner',
      description: 'Connecting dental students across continents.',
      logo: '👥',
      tier: 'Bronze'
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'from-slate-400 to-slate-600';
      case 'Gold': return 'from-secondary to-secondary-light';
      case 'Silver': return 'from-gray-300 to-gray-500';
      case 'Bronze': return 'from-accent-light to-accent';
      default: return 'from-muted to-muted-foreground';
    }
  };

  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HandHeart className="w-8 h-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Trusted Partners</h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Working together with leading organizations to advance biomimetic dentistry
            and make quality education accessible to students worldwide.
          </p>
        </div>

        {/* Sponsors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sponsors.map((sponsor, index) => (
            <div
              key={sponsor.id}
              className={`card-hover glass-card rounded-2xl p-6 fade-in-up stagger-${index % 4 + 1}`}
            >
              {/* Tier Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(sponsor.tier)} text-white text-xs font-semibold`}>
                  {sponsor.tier} Partner
                </div>
                <Award className="w-5 h-5 text-secondary" />
              </div>

              {/* Logo and Name */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">{sponsor.logo}</div>
                <h3 className="text-xl font-bold text-foreground mb-1">{sponsor.name}</h3>
                <p className="text-primary font-semibold">{sponsor.role}</p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-center leading-relaxed">
                {sponsor.description}
              </p>

              {/* Partnership Icon */}
              <div className="flex justify-center mt-4">
                <Building2 className="w-6 h-6 text-accent" />
              </div>
            </div>
          ))}
        </div>

        {/* Partnership CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-card rounded-2xl p-8 shadow-medium">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Become a Partner
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join our mission to revolutionize dental education. Partner with us to reach
              students globally and advance biomimetic dentistry practices.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Partnership Opportunities
              </button>
              <button className="btn-outline">
                Download Partnership Kit
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;