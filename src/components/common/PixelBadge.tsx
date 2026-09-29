import React from 'react';

interface PixelBadgeProps {
  children: React.ReactNode;
  variant?: 'pink' | 'cherry' | 'cream' | 'mauve' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const PixelBadge: React.FC<PixelBadgeProps> = ({
  children,
  variant = 'pink',
  size = 'xs',
  className = '',
  dot = false,
}) => {
  const sizeClasses = {
    xs: 'text-[8px] sm:text-[9px] px-2 py-0.5 leading-relaxed',
    sm: 'text-[9px] sm:text-[10px] px-2.5 py-1 leading-normal',
    md: 'text-[10px] sm:text-[11px] px-3 py-1.5 leading-normal',
  }[size];

  const variantClasses = {
    pink: 'bg-dusty-rose/20 text-soft-blush border-dusty-rose/40 hover:border-soft-blush/60',
    cherry: 'bg-deep-cherry text-warm-cream border-deep-cherry hover:border-dusty-rose/50',
    cream: 'bg-warm-cream/10 text-warm-cream border-warm-cream/30 hover:border-warm-cream/60',
    mauve: 'bg-charcoal-plum text-muted-mauve border-muted-mauve/30 hover:text-warm-cream',
    outline: 'bg-transparent text-soft-blush border-dusty-rose/40 hover:bg-dusty-rose/10',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-pixel font-normal uppercase tracking-wider rounded border shadow-pixel-tag select-none pixel-crisp transition-colors duration-150 ${sizeClasses} ${variantClasses} ${className}`}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-none bg-dusty-rose animate-pulse inline-block flex-shrink-0" />
      )}
      <span>{children}</span>
    </span>
  );
};

