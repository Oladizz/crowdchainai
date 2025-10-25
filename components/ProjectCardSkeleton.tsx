import React from 'react';

const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-brand-surface/60 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-lg h-full animate-pulse">
      <div className="h-48 bg-brand-surface" />
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="h-3 w-1/3 bg-brand-surface rounded" />
          <div className="mt-2 h-4 w-3/4 bg-brand-surface rounded" />
          <div className="mt-1 h-4 w-1/2 bg-brand-surface rounded" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full bg-brand-surface rounded" />
            <div className="h-3 w-full bg-brand-surface rounded" />
            <div className="h-3 w-2/3 bg-brand-surface rounded" />
          </div>
        </div>
        <div className="mt-3 flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-brand-surface" />
            <div className="h-3 w-1/2 bg-brand-surface rounded" />
        </div>
        <div className="mt-3 pt-2">
          <div className="h-2.5 bg-brand-surface rounded-full" />
          <div className="mt-2 flex justify-between">
            <div className="h-3 w-1/4 bg-brand-surface rounded" />
            <div className="h-3 w-1/4 bg-brand-surface rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCardSkeleton;
