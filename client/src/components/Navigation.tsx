"use client";

import React, { useState, useCallback, memo, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronDown, Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

// Organized navigation items into logical groups
const learnItems = [
  { name: 'Courses',   href: '/courses'   },
  { name: 'Resources', href: '/resources' },
];

const communityItems = [
  { name: 'Blog',    href: '/blog'    },
  { name: 'About',   href: '/about'   },
  { name: 'Contact', href: '/contact' },
];

const accountItems = [
  { name: 'Dashboard',   href: '/dashboard'      },
  { name: 'Subscription', href: '/subscription'  },
  { name: 'My Favorites', href: '/blog/favorites' },
];

const adminItems = [
  { name: 'Admin Dashboard', href: '/admin' },
];

interface NavItem {
  name: string;
  href: string;
}

// FE-CONTRAST: All text-white/90 → text-white (WCAG 4.5:1 compliance on bg-primary)
const DropdownNav = memo(({ title, items, className = "" }: { title: string, items: NavItem[], className?: string }) => {
  const pathname = usePathname();
  const isActive = useCallback((href: string) => pathname === href, [pathname]);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`text-white hover:text-white hover:bg-white/10 ${className}`}>
          {title}
          <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background border-border">
        {items.map((item) => (
          <DropdownMenuItem key={item.name} asChild>
            <Link
              href={item.href}
              className={`cursor-pointer ${isActive(item.href) ? 'bg-accent text-accent-foreground' : ''}`}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
DropdownNav.displayName = 'DropdownNav';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const userRole    = user?.role || 'user';
  const userName    = user?.first_name || user?.email?.split('@')[0] || 'User';
  const isAmbassador = user?.is_ambassador || userRole === 'ambassador';

  // ── Scroll-aware nav ───────────────────────────────────────────────────
  // Use framer-motion's useScroll reactive value so we don't add a raw
  // window scroll listener (which would need manual cleanup).
  const { scrollY } = useScroll();

  useEffect(() => {
    // Subscribe to the reactive scroll value — auto-unsubscribed on return
    return scrollY.on('change', (y) => setIsScrolled(y > 10));
  }, [scrollY]);

  const isActive = useCallback((href: string) => pathname === href, [pathname]);

  const linkClass = useCallback((href: string) =>
    `text-white hover:text-white transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10 ${
      isActive(href) ? 'text-secondary bg-white/5' : ''
    }`, [isActive]);

  const mobileLinkClass = useCallback((href: string) =>
    `block px-4 py-3 text-white hover:text-white hover:bg-white/10 rounded-lg transition-colors ${
      isActive(href) ? 'text-secondary bg-white/5' : ''
    }`, [isActive]);

  return (
    <nav
      aria-label="Primary"
      className={[
        'fixed top-0 left-0 right-0 z-50 bg-primary transition-all duration-300',
        isScrolled
          ? 'shadow-medium border-b border-white/20 bg-primary/98 backdrop-blur-md'
          : 'shadow-soft',
      ].join(' ')}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" aria-label="Biomimetic Dentistry Club home">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Image
                src="/logo.png"
                alt="Biomimetic Dentistry Club"
                width={0}
                height={0}
                sizes="120px"
                className="h-10 w-auto object-contain"
                priority
              />
            </motion.div>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/" className={linkClass('/')} aria-current={isActive('/') ? 'page' : undefined}>
                Home
              </Link>
              <DropdownNav title="Learn"     items={learnItems}     />
              <DropdownNav title="Community" items={communityItems} />

              {userRole === 'bronze' && (
                <Link href="/bronze" className={linkClass('/bronze')}>Bronze VIP</Link>
              )}
              {userRole === 'silver' && (
                <Link href="/silver" className={linkClass('/silver')}>Silver VIP</Link>
              )}
              {(userRole === 'vip' || userRole === 'gold') && (
                <Link href="/vip" className={linkClass('/vip')}>VIP Area</Link>
              )}
              {isAmbassador && (
                <Link href="/ambassador" className={linkClass('/ambassador')}>Ambassador</Link>
              )}
              {user && <DropdownNav title="Account" items={accountItems} />}
              {userRole === 'admin' && <DropdownNav title="Admin" items={adminItems} />}
            </div>

            {/* User Menu & Settings */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              <LanguageToggle />
              {user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10" aria-label="Account menu">
                      <User className="mr-2 h-4 w-4" aria-hidden="true" />
                      {userName}
                      <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background border-border" align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/subscription" className="cursor-pointer">Subscription</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/blog/favorites" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" aria-hidden="true" />
                        My Favorites
                      </Link>
                    </DropdownMenuItem>
                    {isAmbassador && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/ambassador" className="cursor-pointer">Ambassador Dashboard</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {userRole === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">Admin Dashboard</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                      <User className="mr-2 h-4 w-4" aria-hidden="true" />
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
              className="md:hidden p-2 text-white hover:text-white transition-colors"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              {isMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-t border-white/20 bg-primary/95 backdrop-blur-md"
            >
              <div className="py-4 space-y-2">
                {/* Mobile Logo */}
                <div className="px-4 pb-2 border-b border-white/20 mb-2">
                  <Link href="/" onClick={() => setIsMenuOpen(false)} aria-label="Home">
                    <Image
                      src="/logo.png"
                      alt="Biomimetic Dentistry Club"
                      width={0}
                      height={0}
                      sizes="100px"
                      className="h-9 w-auto object-contain"
                    />
                  </Link>
                </div>

                <Link href="/" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/')}>
                  Home
                </Link>

                <div className="px-4 py-2">
                  <div className="text-white/70 text-sm font-medium mb-2">Learn</div>
                  {learnItems.map((item) => (
                    <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)} className={mobileLinkClass(item.href)}>
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="px-4 py-2">
                  <div className="text-white/70 text-sm font-medium mb-2">Community</div>
                  {communityItems.map((item) => (
                    <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)} className={mobileLinkClass(item.href)}>
                      {item.name}
                    </Link>
                  ))}
                </div>

                {(userRole === 'bronze' || userRole === 'silver' || userRole === 'vip' || userRole === 'gold' || isAmbassador) && (
                  <div className="px-4 py-2">
                    <div className="text-white/70 text-sm font-medium mb-2">Member Areas</div>
                    {userRole === 'bronze' && (
                      <Link href="/bronze" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/bronze')}>Bronze VIP Area</Link>
                    )}
                    {userRole === 'silver' && (
                      <Link href="/silver" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/silver')}>Silver VIP Area</Link>
                    )}
                    {(userRole === 'vip' || userRole === 'gold') && (
                      <Link href="/vip" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/vip')}>VIP Area</Link>
                    )}
                    {isAmbassador && (
                      <Link href="/ambassador" onClick={() => setIsMenuOpen(false)} className={mobileLinkClass('/ambassador')}>Ambassador Dashboard</Link>
                    )}
                  </div>
                )}

                {user && (
                  <div className="px-4 py-2">
                    <div className="text-white/70 text-sm font-medium mb-2">Account</div>
                    {accountItems.map((item) => (
                      <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)} className={mobileLinkClass(item.href)}>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}

                {userRole === 'admin' && (
                  <div className="px-4 py-2">
                    <div className="text-white/70 text-sm font-medium mb-2">Admin</div>
                    {adminItems.map((item) => (
                      <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)} className={mobileLinkClass(item.href)}>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between px-4 py-2 border-t border-white/20 mt-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>
                  {user ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { signOut(); setIsMenuOpen(false); }}
                      className="text-white hover:text-white hover:bg-white/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                      Logout
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                          <User className="mr-2 h-4 w-4" aria-hidden="true" />
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

export default memo(Navigation);
