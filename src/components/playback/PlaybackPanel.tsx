import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Lock, Info } from 'lucide-react';
import type { Movie } from '../../types/movie';
import type { PlaybackResult } from '../../types/playback';
import { playbackService } from '../../services/playbackService';
import { PixelBadge } from '../common/PixelBadge';
import { KuromiMascot, TinySkull } from '../common/KuromiDecorations';

interface PlaybackPanelProps {
  movie: Movie;
}

export const PlaybackPanel: React.FC<PlaybackPanelProps> = ({ movie }) => {
  const [loadingMovieId, setLoadingMovieId] = useState<string | null>(null);
  const [result, setResult] = useState<PlaybackResult | null>(null);

  const isLoading = loadingMovieId !== movie.id || !result;

  useEffect(() => {
    let isMounted = true;

    playbackService.loadSource(movie.id).then((res) => {
      if (isMounted) {
        setResult(res);
        setLoadingMovieId(movie.id);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [movie.id]);

  return (
    <div className="w-full">
      {/* Top back navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          to={`/movie/${movie.id}`}
          className="inline-flex items-center gap-2 text-sm font-sans text-muted-mauve hover:text-soft-blush transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Movie Details</span>
        </Link>

        <PixelBadge variant="mauve" size="xs">
          LOUNGE SCREEN 01
        </PixelBadge>
      </div>

      {/* Main Player Screen Area */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-midnight-black border border-deep-cherry shadow-2xl flex flex-col items-center justify-center p-6 text-center select-none">
        {/* Subtle background art with dark overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="w-full h-full object-cover filter blur-sm brightness-[0.2]"
          />
          <div className="absolute inset-0 bg-midnight-black/80" />
        </div>

        {/* Player Screen Content */}
        <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-dusty-rose border-t-transparent animate-spin" />
              <span className="font-pixel text-[9px] text-soft-blush tracking-wider">
                INITIALIZING LOUNGE PLAYBACK PROTOCOL...
              </span>
            </div>
          ) : (
            <>
              {/* Kuromi Mascot + Lock emblem */}
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-2xl bg-charcoal-plum border border-deep-cherry flex items-center justify-center shadow-cherry-glow">
                  <KuromiMascot className="w-10 h-10 text-dusty-rose" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-deep-cherry border border-dusty-rose flex items-center justify-center">
                  <Lock className="w-3 h-3 text-soft-blush" />
                </div>
              </div>

              {/* Status Badge */}
              <PixelBadge variant="cherry" size="sm" dot>
                STREAM SOURCE UNAVAILABLE
              </PixelBadge>

              {/* Title & Clear Message */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-warm-cream">
                {movie.title}
              </h2>

              <div className="bg-charcoal-plum/90 border border-deep-cherry/80 rounded-xl p-4 text-xs font-sans text-muted-mauve leading-relaxed max-w-md">
                <div className="flex items-start gap-2.5 text-left mb-2">
                  <ShieldAlert className="w-4 h-4 text-dusty-rose flex-shrink-0 mt-0.5" />
                  <p className="text-warm-cream/90 font-medium">
                    {result?.message}
                  </p>
                </div>
                <p className="text-[11px] text-muted-mauve/80 text-left border-t border-deep-cherry/40 pt-2 flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-dusty-rose flex-shrink-0" />
                  Mahi's Cinema uses a sandboxed provider architecture. Direct
                  video stream distribution will be connected once the private
                  cloud media license is configured.
                </p>
              </div>

              {/* Quick actions */}
              <div className="flex items-center gap-3 pt-2">
                <Link
                  to={`/movie/${movie.id}`}
                  className="px-5 py-2.5 rounded-xl bg-deep-cherry hover:bg-cherry-hover text-warm-cream text-xs font-sans font-medium transition-colors border border-dusty-rose/40"
                >
                  Return to Title Overview
                </Link>
                <Link
                  to="/movies"
                  className="px-5 py-2.5 rounded-xl bg-charcoal-plum hover:bg-deep-cherry/60 text-warm-cream text-xs font-sans font-medium transition-colors border border-deep-cherry"
                >
                  Browse Other Titles
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Cinema bottom bar inside player */}
        <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-[10px] text-muted-mauve/60 border-t border-deep-cherry/20 pt-2 font-pixel">
          <span className="flex items-center gap-1">
            <TinySkull className="text-dusty-rose w-3 h-3" />
            MAHI'S PRIVATE SCREEN
          </span>
          <span>OCTOBER 10 LOUNGE</span>
        </div>
      </div>
    </div>
  );
};
