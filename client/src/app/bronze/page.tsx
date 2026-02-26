"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

const BronzePage = () => {
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Card className="w-full max-w-4xl mx-auto border-amber-600 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-amber-700 dark:text-amber-500">
            <Trophy className="h-8 w-8" />
            Bronze VIP Area
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <h2 className="text-3xl font-bold mb-4">Future Feature</h2>
            <p className="text-muted-foreground max-w-lg">
              This area is exclusively for Bronze VIP members. Monthly Q&A sessions and discounts coming soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BronzePage;
