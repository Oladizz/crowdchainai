import React from 'react';

const ProposalCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-100 dark:bg-brand-surface/60 backdrop-blur-lg rounded-xl p-3 sm:p-4 shadow-lg dark:border dark:border-white/10 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <div className="h-5 w-24 bg-brand-surface rounded-full" />
          <div className="mt-3 h-5 w-3/4 bg-brand-surface rounded" />
          <div className="mt-2 h-4 w-full bg-brand-surface rounded" />
          <div className="mt-1 h-4 w-1/2 bg-brand-surface rounded" />
        </div>
        <div className="text-right flex-shrink-0 ml-4 space-y-2">
             <div className="h-4 w-20 bg-brand-surface rounded" />
             <div className="h-5 w-12 bg-brand-surface rounded ml-auto" />
        </div>
      </div>
      
      <div className="mt-4">
        <div className="h-4 w-28 bg-brand-surface rounded mb-2" />
        <div className="h-3 sm:h-4 bg-brand-surface rounded-full" />
        <div className="flex justify-between mt-2">
            <div className="h-3 w-1/3 bg-brand-surface rounded" />
            <div className="h-3 w-1/3 bg-brand-surface rounded" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="h-9 bg-brand-surface rounded-full" />
        <div className="h-9 bg-brand-surface rounded-full" />
        <div className="h-9 bg-brand-surface rounded-full" />
      </div>
    </div>
  );
};

export default ProposalCardSkeleton;
