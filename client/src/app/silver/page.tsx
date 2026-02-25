"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

const SilverPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Card className="w-full max-w-4xl mx-auto border-gray-400 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-gray-600 dark:text-gray-300">
            <Star className="h-8 w-8" />
            Silver VIP Area
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <h2 className="text-3xl font-bold mb-4">Future Feature</h2>
            <p className="text-muted-foreground max-w-lg">
              This area is exclusively for Silver VIP members. Bi-weekly mentorship and more coming soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SilverPage;
