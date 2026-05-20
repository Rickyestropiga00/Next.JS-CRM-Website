import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export const AccountSummarySkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
};

export const PersonalInformationSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />

          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
};
