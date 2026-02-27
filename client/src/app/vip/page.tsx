"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';

const VipPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Card className="w-full max-w-4xl mx-auto border-yellow-500/50 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-yellow-600 dark:text-yellow-500">
            <Crown className="h-8 w-8" />
            VIP Area
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <h2 className="text-3xl font-bold mb-4">Future Feature</h2>
            <p className="text-muted-foreground max-w-lg">
              This area is exclusively for VIP members. Weekly 1:1 mentorship and more coming soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VipPage;
