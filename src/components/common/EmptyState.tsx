import React from 'react';
import { Link } from 'react-router-dom';
import { KuromiMascot } from './KuromiDecorations';
import { PixelBadge } from './PixelBadge';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
  badgeText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  actionLink,
  onActionClick,
  badgeText = 'EMPTY LOUNGE',
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-charcoal-plum border border-deep-cherry flex items-center justify-center shadow-cherry-glow">
          <KuromiMascot className="w-12 h-12 text-dusty-rose" />
        </div>
        <div className="absolute -bottom-2 -right-2">
          <PixelBadge variant="pink" size="xs">
            {badgeText}
          </PixelBadge>
        </div>
      </div>

      <h3 className="font-serif text-2xl font-medium text-warm-cream mb-2">
        {title}
      </h3>
      <p className="font-sans text-sm text-muted-mauve mb-6 leading-relaxed">
        {description}
      </p>

      {actionLink && actionText && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-deep-cherry hover:bg-cherry-hover text-warm-cream border border-dusty-rose/40 font-sans text-sm font-medium transition-colors shadow-sm"
        >
          <span>{actionText}</span>
          <span className="text-soft-blush font-pixel text-[9px]">→</span>
        </Link>
      )}

      {onActionClick && actionText && !actionLink && (
        <button
          onClick={onActionClick}
          type="button"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-deep-cherry hover:bg-cherry-hover text-warm-cream border border-dusty-rose/40 font-sans text-sm font-medium transition-colors shadow-sm"
        >
          <span>{actionText}</span>
          <span className="text-soft-blush font-pixel text-[9px]">↺</span>
        </button>
      )}
    </div>
  );
};

