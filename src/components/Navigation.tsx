import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, profile } = useAuth();
  const { t } = useLanguage();

  // Organized navigation items into logical groups
  const learnItems = [
    { name: t('nav.courses'), href: '/courses' },
    { name: t('nav.resources'), href: '/resources' },
    { name: t('nav.blog'), href: '/blog' },
  ];

  const communityItems = [
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.ambassadors'), href: '/ambassadors' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  const accountItems = [
    { name: t('nav.dashboard'), href: '/dashboard' },
    { name: t('nav.subscription'), href: '/subscription' },
  ];

  const adminItems = [
    { name: t('nav.admin'), href: '/admin' },
  ];

  const isActive = (href: string) => location.pathname === href;

  const DropdownNav = ({ title, items, className = "" }: { title: string, items: any[], className?: string }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`text-white/90 hover:text-white hover:bg-white/10 ${className}`}>
          {title}
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background border-border">
        {items.map((item) => (
          <DropdownMenuItem key={item.name} asChild>
            <Link 
              to={item.href}
              className={`cursor-pointer ${isActive(item.href) ? 'bg-accent text-accent-foreground' : ''}`}
            >
              {item.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center"
            >
              <span className="text-secondary-foreground font-bold text-lg">B</span>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">Biomimetic Dentistry</h1>
              <p className="text-xs text-primary-foreground/70 -mt-1">Club</p>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {/* Home link */}
              <Link
                to="/"
                className={`text-white/90 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10 ${
                  isActive('/') ? 'text-secondary bg-white/5' : ''
                }`}
              >
                {t('nav.home')}
              </Link>

              {/* Learn Dropdown */}
              <DropdownNav title={t('nav.learn')} items={learnItems} />

              {/* Community Dropdown */}
              <DropdownNav title={t('nav.community')} items={communityItems} />

              {/* User Account Dropdown - only show if logged in */}
              {user && (
                <DropdownNav title={t('nav.account')} items={accountItems} />
              )}

              {/* Admin Dropdown - only show for admins */}
              {profile?.role === 'admin' && (
                <DropdownNav title={t('nav.admin')} items={adminItems} />
              )}
            </nav>

            {/* User Menu & Settings */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              <LanguageToggle />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10">
                      <User className="mr-2 h-4 w-4" />
                      {profile?.first_name || user.email?.split('@')[0]}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background border-border" align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        {t('nav.dashboard')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/subscription" className="cursor-pointer">
                        {t('nav.subscription')}
                      </Link>
                    </DropdownMenuItem>
                    {profile?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer">
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10">
                      <User className="mr-2 h-4 w-4" />
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-primary">
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white/90 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-white/20 bg-primary/95 backdrop-blur-md"
          >
            <div className="py-4 space-y-2">
              {/* Home */}
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors ${
                  isActive('/') ? 'text-secondary bg-white/5' : ''
                }`}
              >
                {t('nav.home')}
              </Link>

              {/* Learn Section */}
              <div className="px-4 py-2">
                <div className="text-white/70 text-sm font-medium mb-2">{t('nav.learn')}</div>
                {learnItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors ${
                      isActive(item.href) ? 'text-secondary bg-white/5' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Community Section */}
              <div className="px-4 py-2">
                <div className="text-white/70 text-sm font-medium mb-2">{t('nav.community')}</div>
                {communityItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors ${
                      isActive(item.href) ? 'text-secondary bg-white/5' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Account Section - only show if logged in */}
              {user && (
                <div className="px-4 py-2">
                  <div className="text-white/70 text-sm font-medium mb-2">{t('nav.account')}</div>
                  {accountItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors ${
                        isActive(item.href) ? 'text-secondary bg-white/5' : ''
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Admin Section - only show for admins */}
              {profile?.role === 'admin' && (
                <div className="px-4 py-2">
                  <div className="text-white/70 text-sm font-medium mb-2">{t('nav.admin')}</div>
                  {adminItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors ${
                        isActive(item.href) ? 'text-secondary bg-white/5' : ''
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Mobile Settings */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/20 mt-4 pt-4">
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  <LanguageToggle />
                </div>
                {user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-white/90 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10">
                        <User className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-primary">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;