import React from 'react';
import { KuromiMascot, TinySkull, BirthdayStamp } from '../common/KuromiDecorations';
import { PixelBadge } from '../common/PixelBadge';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-deep-cherry/60 bg-midnight-black/95 py-12 px-4 sm:px-6 lg:px-8 mt-20 relative z-10 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        {/* Brand & Mascot */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-charcoal-plum border border-deep-cherry flex items-center justify-center">
            <KuromiMascot className="w-6 h-6 text-soft-blush" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="font-serif text-lg font-bold text-warm-cream">
                Mahi's Cinema
              </span>
              <PixelBadge variant="mauve" size="xs">
                PRIVATE LOUNGE
              </PixelBadge>
            </div>
            <p className="font-handwritten text-base text-soft-blush">
              Made with care for Mother Teresa ♡
            </p>
          </div>
        </div>

        {/* Center decorative accent: 10.10 birthday badge */}
        <div className="flex items-center gap-3">
          <BirthdayStamp />
        </div>

        {/* Right side tribute */}
        <div className="flex flex-col items-center md:items-end text-xs text-muted-mauve space-y-1">
          <div className="flex items-center gap-1.5 font-pixel text-[8px] text-muted-mauve pixel-crisp">
            <span>POWERED BY TMDB API</span>
            <TinySkull className="text-dusty-rose" />
            <span>EST. 2026</span>
          </div>
          <p className="font-sans text-[11px] text-muted-mauve/80">
            Real metadata provided by The Movie Database. Not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
};

