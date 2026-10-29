import React from 'react';
import { LoadingMessage } from './LoadingMessage';

interface SkeletonCardProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-[140px] sm:w-[160px] aspect-[2/3]',
    md: 'w-[160px] sm:w-[190px] aspect-[2/3]',
    lg: 'w-[190px] sm:w-[220px] aspect-[2/3]',
  }[size];

  return (
    <div className={`flex-shrink-0 flex flex-col animate-pulse ${className}`}>
      {/* Poster Skeleton */}
      <div
        className={`${sizeClasses} rounded-xl bg-charcoal-plum border border-deep-cherry/60 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-deep-cherry/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>

      {/* Title & Subtitle Skeleton */}
      <div className="mt-2.5 space-y-1.5 w-full">
        <div className="h-3.5 bg-charcoal-plum/80 rounded w-3/4 border border-deep-cherry/40" />
        <div className="h-2.5 bg-charcoal-plum/60 rounded w-1/3 border border-deep-cherry/30" />
      </div>
    </div>
  );
};

export const SkeletonRow: React.FC<{ count?: number; className?: string; showMessage?: boolean }> = ({
  count = 6,
  className = '',
  showMessage = true,
}) => {
  return (
    <div className="space-y-3">
      {showMessage && (
        <div className="px-4 sm:px-6 lg:px-8 py-1">
          <LoadingMessage size="xs" inline showSpinner />
        </div>
      )}
      <div className={`flex gap-4 sm:gap-6 overflow-hidden py-2 px-4 sm:px-6 lg:px-8 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} size="md" />
        ))}
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number; className?: string; showMessage?: boolean }> = ({
  count = 12,
  className = '',
  showMessage = true,
}) => {
  return (
    <div className="space-y-4">
      {showMessage && (
        <div className="py-2 flex justify-center">
          <LoadingMessage size="sm" showSpinner />
        </div>
      )}
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 ${className}`}
      >
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} size="md" className="w-full" />
        ))}
      </div>
    </div>
  );
};
