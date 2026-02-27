'use client';

import { Button } from '@/components/ui/button';
import { Home, Search, Compass } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-primary/10 p-6 rounded-full mb-6 animate-float">
        <Compass className="h-16 w-16 text-primary" />
      </div>

      <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
        404
      </h1>

      <h2 className="text-2xl font-semibold text-foreground mb-4">
        Page Not Found
      </h2>

      <p className="text-xl text-muted-foreground max-w-md mb-8">
        We couldn't find the page you were looking for. It might have been moved or doesn't exist.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          asChild
          className="gap-2"
        >
          <Link href="/">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </Button>

        <Button
          variant="outline"
          size="lg"
          asChild
          className="gap-2"
        >
          <Link href="/courses">
            <Search className="h-4 w-4" />
            Browse Courses
          </Link>
        </Button>
      </div>
    </div>
  );
}
