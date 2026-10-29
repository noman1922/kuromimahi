import React from 'react';
import { KuromiMascot, BirthdayStamp } from '../common/KuromiDecorations';
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

        {/* Center decorative accent: Signature badge */}
        <div className="flex items-center gap-3">
          <BirthdayStamp />
        </div>

        {/* Right side tribute */}
        <div className="flex flex-col items-center md:items-end text-xs text-muted-mauve space-y-1.5">
          <div className="flex items-center gap-2">
            <svg
              className="h-3.5 w-auto"
              viewBox="0 0 185 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="The Movie Database (TMDB) logo"
            >
              <defs>
                <linearGradient id="tmdbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#90cea1" />
                  <stop offset="50%" stopColor="#01b4e4" />
                  <stop offset="100%" stopColor="#0d253f" />
                </linearGradient>
              </defs>
              <rect width="185" height="15" rx="3" fill="#1D1420" stroke="#351726" />
              <text x="8" y="11" fill="url(#tmdbGrad)" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                THE MOVIE DATABASE
              </text>
            </svg>
            <span className="font-pixel text-[8px] text-muted-mauve pixel-crisp">
              EST. 2026
            </span>
          </div>
          <p className="font-sans text-[11px] text-muted-mauve/80 max-w-sm">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
};

