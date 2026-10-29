import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { KuromiMascot, TinySkull } from '../components/common/KuromiDecorations';
import { PixelBadge } from '../components/common/PixelBadge';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-16">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-charcoal-plum border-2 border-deep-cherry flex items-center justify-center shadow-cherry-glow">
          <KuromiMascot className="w-14 h-14 text-dusty-rose" />
        </div>
        <div className="absolute -bottom-2 -right-3">
          <PixelBadge variant="pink" size="xs">
            404 NOT FOUND
          </PixelBadge>
        </div>
      </div>

      <h1 className="font-serif text-3xl sm:text-5xl font-bold text-warm-cream mb-3">
        Lost in the Midnight Fog
      </h1>

      <p className="font-sans text-sm sm:text-base text-muted-mauve max-w-md mx-auto mb-8 leading-relaxed">
        This screening room doesn't exist or has wandered off into the dark.
        Let's take you back to Mahi's main lounge.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-deep-cherry hover:bg-cherry-hover text-warm-cream border border-dusty-rose/60 font-sans text-sm font-semibold flex items-center gap-2 shadow-goth-glow transition-all"
        >
          <Home className="w-4 h-4 text-soft-blush" />
          <span>Return to Lounge Home</span>
        </Link>
        <Link
          to="/movies"
          className="px-6 py-3 rounded-xl bg-charcoal-plum hover:bg-deep-cherry/60 text-warm-cream border border-deep-cherry font-sans text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Compass className="w-4 h-4 text-dusty-rose" />
          <span>Browse Film Catalog</span>
        </Link>
      </div>

      <div className="mt-12 flex items-center gap-2 text-xs text-muted-mauve/70 font-pixel">
        <TinySkull className="text-dusty-rose w-3 h-3" />
        <span>MAHI'S CINEMA • MIDNIGHT LOUNGE</span>
      </div>
    </div>
  );
};

