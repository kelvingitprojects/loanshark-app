
import React from 'react';

const LoanItemSkeleton = () => (
  <div className="p-4 border rounded-lg">
    <div className="flex justify-between items-center animate-pulse">
      <div className="flex-grow space-y-3">
        <div className="h-5 bg-muted rounded w-1/3"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
        <div className="mt-4 space-y-2 pt-2">
          <div className="flex justify-between">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5"></div>
        </div>
      </div>
      <div className="ml-4 h-6 w-6 bg-muted rounded-md"></div>
    </div>
  </div>
);

export const LoanListSkeleton = () => {
  return (
    <div className="space-y-4">
      <LoanItemSkeleton />
      <LoanItemSkeleton />
      <LoanItemSkeleton />
    </div>
  );
};
