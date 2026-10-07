import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import type { Movie } from '../../types/movie';
import { KuromiMascot } from '../common/KuromiDecorations';
import { PixelBadge } from '../common/PixelBadge';

interface ContinueWatchingCardProps {
  movie: Movie;
}

export const ContinueWatchingCard: React.FC<ContinueWatchingCardProps> = ({ movie }) => {
  const [imageError, setImageError] = useState(false);
  const progress = movie.progress || 35;

  return (
    <div className="relative group w-[280px] sm:w-[340px] flex-shrink-0 bg-charcoal-plum rounded-xl overflow-hidden border border-deep-cherry/80 hover:border-dusty-rose/60 transition-all duration-300 hover:shadow-card-hover select-none">
      {/* Landscape Backdrop with fallback */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-midnight-black">
        {!imageError ? (
          <img
            src={movie.backdrop}
            alt={movie.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-r from-charcoal-plum to-deep-cherry">
            <KuromiMascot className="w-8 h-8 text-dusty-rose/70 mb-1" />
            <span className="font-serif text-sm font-semibold text-warm-cream">
              {movie.title}
            </span>
          </div>
        )}

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-black via-midnight-black/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <PixelBadge variant="pink" size="xs">
            DEMO PROGRESS
          </PixelBadge>
          <span className="font-pixel text-[8px] text-warm-cream bg-midnight-black/80 px-2 py-0.5 rounded border border-deep-cherry/60">
            {progress}%
          </span>
        </div>

        {/* Play Button Overlay */}
        <Link
          to={`/watch/${movie.id}`}
          aria-label={`Resume watching ${movie.title}`}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-11 h-11 rounded-full bg-deep-cherry/90 border border-dusty-rose text-soft-blush flex items-center justify-center shadow-goth-glow group-hover:scale-110 transition-transform duration-200">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-midnight-black relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-deep-cherry to-dusty-rose transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card Info */}
      <div className="p-3.5 flex items-center justify-between">
        <div className="min-w-0 pr-3">
          <Link
            to={`/movie/${movie.id}`}
            className="font-serif text-sm font-semibold text-warm-cream hover:text-soft-blush transition-colors truncate block"
          >
            {movie.title}
          </Link>
          <p className="font-sans text-[11px] text-muted-mauve truncate mt-0.5">
            {movie.lastEpisode || `${movie.contentType} • ${movie.releaseYear}`}
          </p>
        </div>

        <Link
          to={`/watch/${movie.id}`}
          className="py-1 px-3 rounded-md bg-deep-cherry hover:bg-cherry-hover text-warm-cream text-xs font-sans font-medium border border-dusty-rose/40 flex-shrink-0 transition-colors"
        >
          Resume
        </Link>
      </div>
    </div>
  );
};
