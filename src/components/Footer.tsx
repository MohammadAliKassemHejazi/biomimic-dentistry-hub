import React from 'react';
import { Heart, Mail, MapPin, Phone, Instagram, Linkedin, Youtube, Globe } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Education',
      links: [
        { label: 'Courses', href: '#courses' },
        { label: 'Workshops', href: '#workshops' },
        { label: 'Webinars', href: '#webinars' },
        { label: 'Resources', href: '#resources' }
      ]
    },
    {
      title: 'Community',
      links: [
        { label: 'Ambassadors', href: '#ambassadors' },
        { label: 'VIP Program', href: '#vip' },
        { label: 'Student Network', href: '#network' },
        { label: 'Mentorship', href: '#mentorship' }
      ]
    },
    {
      title: 'Organization',
      links: [
        { label: 'About Us', href: '#about' },
        { label: 'Mission', href: '#mission' },
        { label: 'Team', href: '#team' },
        { label: 'Partners', href: '#partners' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact', href: '#contact' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Help Center', href: '#help' },
        { label: 'Donate', href: '#donate' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Globe, href: '#', label: 'Website' }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer Content */}
      <div className="section-container section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Biomimetic Dentistry</h3>
                <p className="text-primary-foreground/80 text-sm">Club</p>
              </div>
            </div>
            
            <p className="text-primary-foreground/90 mb-6 leading-relaxed">
              Revolutionizing dental education through biomimetic science, 
              connecting students worldwide with accessible, high-quality learning opportunities.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary" />
                <span className="text-sm">info@biomimeticdentistry.org</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-secondary" />
                <span className="text-sm">Global Organization</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section, index) => (
            <div key={section.title}>
              <h4 className="text-lg font-semibold mb-4 text-secondary">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-primary-foreground/80 hover:text-secondary transition-smooth text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 p-6 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-secondary">Stay Updated</h3>
            <p className="text-primary-foreground/90 mb-6">
              Get the latest updates on courses, research, and community events delivered to your inbox.
            </p>
            <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 border border-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-smooth">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="section-container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-primary-foreground/80 text-sm">
              © {currentYear} Biomimetic Dentistry Club. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center text-primary-foreground/80 hover:text-secondary hover:bg-primary-foreground/20 transition-smooth"
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>

            {/* Legal Links */}
            <div className="flex gap-4 text-sm">
              <a href="#privacy" className="text-primary-foreground/80 hover:text-secondary transition-smooth">
                Privacy Policy
              </a>
              <span className="text-primary-foreground/40">•</span>
              <a href="#terms" className="text-primary-foreground/80 hover:text-secondary transition-smooth">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;