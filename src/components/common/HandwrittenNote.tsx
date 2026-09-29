import React from 'react';
import { TinySkull } from './KuromiDecorations';

interface HandwrittenNoteProps {
  children: React.ReactNode;
  author?: string;
  rotation?: 'left' | 'right' | 'none';
  className?: string;
  pin?: boolean;
}

export const HandwrittenNote: React.FC<HandwrittenNoteProps> = ({
  children,
  author,
  rotation = 'none',
  className = '',
  pin = true,
}) => {
  const rotateClass = {
    left: '-rotate-1',
    right: 'rotate-1',
    none: 'rotate-0',
  }[rotation];

  return (
    <div
      className={`relative inline-block bg-charcoal-plum/90 border border-deep-cherry/80 rounded-md px-5 py-3 shadow-lg shadow-black/40 backdrop-blur-sm transition-transform duration-300 hover:rotate-0 ${rotateClass} ${className}`}
    >
      {/* Decorative tape pin */}
      {pin && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3.5 bg-dusty-rose/25 border-t border-b border-dusty-rose/40 rounded-sm transform rotate-1 shadow-sm backdrop-blur-xs flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-soft-blush/60" />
        </div>
      )}

      {/* Note body */}
      <div className="flex items-start gap-2.5">
        <TinySkull className="text-dusty-rose/70 mt-1 flex-shrink-0" />
        <div>
          <p className="font-handwritten text-lg sm:text-xl text-warm-cream leading-tight tracking-wide">
            {children}
          </p>
          {author && (
            <p className="font-handwritten text-xs text-soft-blush/80 text-right mt-1">
              — {author}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

