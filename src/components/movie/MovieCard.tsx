import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Film, Tv, Play } from 'lucide-react';
import type { Movie } from '../../types/movie';
import { FavoriteButton } from '../common/FavoriteButton';
import { KuromiMascot } from '../common/KuromiDecorations';
import { PixelBadge } from '../common/PixelBadge';

interface MovieCardProps {
  movie: Movie;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  className = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-[140px] sm:w-[160px] aspect-[2/3]',
    md: 'w-[160px] sm:w-[190px] aspect-[2/3]',
    lg: 'w-[190px] sm:w-[220px] aspect-[2/3]',
  }[size];

  return (
    <div
      className={`group relative flex-shrink-0 flex flex-col select-none ${className}`}
    >
      <div
        className={`relative ${sizeClasses} rounded-xl overflow-hidden bg-charcoal-plum border border-deep-cherry/80 transition-all duration-300 group-hover:scale-[1.03] group-hover:border-dusty-rose/70 group-hover:shadow-card-hover`}
      >
        {/* Poster Image with Graceful Fallback */}
        {!imageError ? (
          <img
            src={movie.poster}
            alt={movie.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-charcoal-plum to-deep-cherry">
            <KuromiMascot className="w-8 h-8 text-dusty-rose/60 mb-2" />
            <span className="font-serif text-xs font-semibold text-warm-cream line-clamp-3">
              {movie.title}
            </span>
            <span className="font-pixel text-[8px] text-muted-mauve mt-2">
              {movie.releaseYear}
            </span>
          </div>
        )}

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-black/90 via-midnight-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges: Content Type & Favorite Button */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="px-1.5 py-0.5 rounded bg-midnight-black/80 backdrop-blur-md border border-deep-cherry/60 text-[10px] font-sans font-medium text-soft-blush flex items-center gap-1">
            {movie.contentType === 'series' ? (
              <Tv className="w-3 h-3 text-dusty-rose" />
            ) : (
              <Film className="w-3 h-3 text-dusty-rose" />
            )}
            <span className="capitalize">{movie.contentType}</span>
          </span>

          <FavoriteButton movieId={movie.id} size="sm" />
        </div>

        {/* Rating Pill if available */}
        {movie.rating && (
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded bg-midnight-black/85 backdrop-blur-md border border-deep-cherry/50">
            <Star className="w-3 h-3 text-dusty-rose fill-dusty-rose" />
            <span className="font-pixel text-[8px] text-warm-cream pixel-crisp">
              {movie.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Hover / Touch Quick Action Overlay */}
        <div className="absolute inset-0 bg-midnight-black/85 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3.5 z-20">
          <div className="space-y-1.5 mb-2">
            <h4 className="font-serif text-sm font-bold text-warm-cream line-clamp-1">
              {movie.title}
            </h4>
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="font-sans text-[10px] text-muted-mauve bg-charcoal-plum px-1.5 py-0.5 rounded border border-deep-cherry"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="font-sans text-[11px] text-warm-cream/80 line-clamp-2 leading-relaxed">
              {movie.description}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-deep-cherry/40">
            <Link
              to={`/watch/${movie.id}`}
              className="flex-1 py-1.5 rounded-lg bg-deep-cherry hover:bg-cherry-hover text-warm-cream text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors border border-dusty-rose/40"
            >
              <Play className="w-3 h-3 fill-current text-soft-blush" />
              <span>Watch</span>
            </Link>
            <Link
              to={`/movie/${movie.id}`}
              className="py-1.5 px-2 rounded-lg bg-charcoal-plum hover:bg-deep-cherry text-warm-cream text-xs font-sans font-medium transition-colors border border-deep-cherry"
            >
              Info
            </Link>
          </div>
        </div>
      </div>

      {/* Card Footer: Title & Year */}
      <Link to={`/movie/${movie.id}`} className="mt-2.5 block focus:outline-none">
        <h4 className="font-sans font-medium text-xs sm:text-sm text-warm-cream group-hover:text-soft-blush transition-colors line-clamp-1">
          {movie.title}
        </h4>
        <div className="flex items-center justify-between mt-0.5 text-[11px] text-muted-mauve">
          <span>{movie.releaseYear}</span>
          {movie.isKoreanDrama && (
            <PixelBadge variant="mauve" size="xs">
              K-DRAMA
            </PixelBadge>
          )}
        </div>
      </Link>
    </div>
  );
};
