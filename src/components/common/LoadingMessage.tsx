import React from 'react';
import { TinySkull, GothStar } from './KuromiDecorations';

interface LoadingMessageProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showSpinner?: boolean;
  subtitle?: string;
  inline?: boolean;
  className?: string;
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({
  size = 'md',
  showSpinner = true,
  subtitle,
  inline = false,
  className = '',
}) => {
  const textSizeClass = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  }[size];

  const spinnerSizeClass = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-2',
  }[size];

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-1.5 select-none ${className}`}>
        {showSpinner && (
          <span className="w-3.5 h-3.5 rounded-full border-2 border-dusty-rose border-t-transparent animate-spin inline-block flex-shrink-0" />
        )}
        <span className={`font-pixel ${textSizeClass} text-soft-blush tracking-wider uppercase pixel-crisp`}>
          dhorjo dhoro baba
        </span>
      </span>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-2.5 select-none text-center ${className}`}>
      {showSpinner && (
        <div className="relative">
          <div
            className={`${spinnerSizeClass} rounded-full border-dusty-rose border-t-transparent animate-spin shadow-cherry-glow`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <TinySkull className="w-3 h-3 text-dusty-rose opacity-60" />
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <GothStar className="w-3 h-3 text-dusty-rose animate-pulse flex-shrink-0" />
        <span className={`font-pixel ${textSizeClass} text-soft-blush tracking-wider uppercase pixel-crisp`}>
          dhorjo dhoro baba
        </span>
        <GothStar className="w-3 h-3 text-dusty-rose animate-pulse flex-shrink-0" />
      </div>

      {subtitle && (
        <p className="font-sans text-[11px] text-muted-mauve/80 tracking-wide max-w-xs">
          {subtitle}
        </p>
      )}
    </div>
  );
};

