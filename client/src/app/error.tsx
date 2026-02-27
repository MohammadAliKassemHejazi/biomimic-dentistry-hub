'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-destructive/10 p-6 rounded-full mb-6 animate-pulse-soft">
        <AlertTriangle className="h-16 w-16 text-destructive" />
      </div>

      <h1 className="text-4xl font-bold text-foreground mb-4">
        Oops! Something went wrong
      </h1>

      <p className="text-xl text-muted-foreground max-w-md mb-8">
        We encountered an unexpected problem. Our team has been notified and we are working to solve it.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => reset()}
          size="lg"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>

        <Button
          variant="outline"
          size="lg"
          asChild
          className="gap-2"
        >
          <Link href="/">
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </Button>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-4 bg-muted rounded-lg max-w-2xl w-full text-left overflow-auto">
          <p className="font-mono text-sm text-destructive font-bold mb-2">Error Details (Dev Only):</p>
          <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </div>
      )}
    </div>
  );
}
