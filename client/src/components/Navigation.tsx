"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

// Organized navigation items into logical groups
const learnItems = [
  { name: 'Courses', href: '/courses' },
  { name: 'Resources', href: '/resources' },
  { name: 'Blog', href: '/blog' },
];

const communityItems = [
  { name: 'About', href: '/about' },
  { name: 'Ambassadors', href: '/ambassadors' },
  { name: 'Contact', href: '/contact' },
];

const accountItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Subscription', href: '/subscription' },
];

const adminItems = [
  { name: 'Admin Dashboard', href: '/admin' },
];

interface NavItem {
  name: string;
  href: string;
}

const DropdownNav = ({ title, items, className = "" }: { title: string, items: NavItem[], className?: string }) => {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <DropdownMenu modal={false}>
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
              href={item.href}
              className={`cursor-pointer ${isActive(item.href) ? 'bg-accent text-accent-foreground' : ''}`}
            >
              {item.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  // Safe access to role, default to 'user' if not present
  const userRole = user?.role || 'user';
  const userName = user?.first_name || user?.email?.split('@')[0] || 'User';
  const isAmbassador = user?.is_ambassador || userRole === 'ambassador';

  const isActive = (href: string) => pathname === href;

  const linkClass = (href: string) => `text-white/90 hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10 ${
    isActive(href) ? 'text-secondary bg-white/5' : ''
  }`;

  const mobileLinkClass = (href: string) => `block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors ${
    isActive(href) ? 'text-secondary bg-white/5' : ''
  }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
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
            <div className="hidden md:flex items-center space-x-4">
              {/* Home link */}
              <Link href="/" className={linkClass('/')}>
                Home
              </Link>

              {/* Learn Dropdown */}
              <DropdownNav title="Learn" items={learnItems} />

              {/* Community Dropdown */}
              <DropdownNav title="Community" items={communityItems} />

              {/* Role Specific Links */}
              {userRole === 'bronze' && (
                <Link href="/bronze" className={linkClass('/bronze')}>Bronze VIP</Link>
              )}
              {userRole === 'silver' && (
                <Link href="/silver" className={linkClass('/silver')}>Silver VIP</Link>
              )}
              {userRole === 'gold' && (
                <Link href="/gold" className={linkClass('/gold')}>Gold VIP</Link>
              )}
              {isAmbassador && (
                <Link href="/ambassador" className={linkClass('/ambassador')}>Ambassador</Link>
              )}

              {/* User Account Dropdown - only show if logged in */}
              {user && (
                <DropdownNav title="Account" items={accountItems} />
              )}

              {/* Admin Dropdown - only show for admins */}
              {userRole === 'admin' && (
                <DropdownNav title="Admin" items={adminItems} />
              )}
            </div>

            {/* User Menu & Settings */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              <LanguageToggle />
              {user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10">
                      <User className="mr-2 h-4 w-4" />
                      {userName}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background border-border" align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/subscription" className="cursor-pointer">
                        Subscription
                      </Link>
                    </DropdownMenuItem>

                    {isAmbassador && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/ambassador" className="cursor-pointer">
                            Ambassador Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {userRole === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10">
                      <User className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-primary">
                      Sign Up
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
        <AnimatePresence>
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
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={mobileLinkClass('/')}
              >
                Home
              </Link>

              {/* Learn Section */}
              <div className="px-4 py-2">
                <div className="text-white/70 text-sm font-medium mb-2">Learn</div>
                {learnItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={mobileLinkClass(item.href)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Community Section */}
              <div className="px-4 py-2">
                <div className="text-white/70 text-sm font-medium mb-2">Community</div>
                {communityItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={mobileLinkClass(item.href)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Role Specific Sections */}
              {(userRole === 'bronze' || userRole === 'silver' || userRole === 'gold' || isAmbassador) && (
                <div className="px-4 py-2">
                  <div className="text-white/70 text-sm font-medium mb-2">Member Areas</div>
                  {userRole === 'bronze' && (
                    <Link href="/bronze" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/bronze')}>
                      Bronze VIP Area
                    </Link>
                  )}
                  {userRole === 'silver' && (
                    <Link href="/silver" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/silver')}>
                      Silver VIP Area
                    </Link>
                  )}
                  {userRole === 'gold' && (
                    <Link href="/gold" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/gold')}>
                      Gold VIP Area
                    </Link>
                  )}
                  {isAmbassador && (
                    <Link href="/ambassador" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/ambassador')}>
                      Ambassador Dashboard
                    </Link>
                  )}
                </div>
              )}

              {/* Account Section - only show if logged in */}
              {user && (
                <div className="px-4 py-2">
                  <div className="text-white/70 text-sm font-medium mb-2">Account</div>
                  {accountItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={mobileLinkClass(item.href)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Admin Section - only show for admins */}
              {userRole === 'admin' && (
                <div className="px-4 py-2">
                  <div className="text-white/70 text-sm font-medium mb-2">Admin</div>
                  {adminItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={mobileLinkClass(item.href)}
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
                    Logout
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10">
                        <User className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
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
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
