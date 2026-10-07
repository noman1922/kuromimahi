import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie } from '../../types/movie';
import { MovieCard } from './MovieCard';
import { GothStar } from '../common/KuromiDecorations';
import { SkeletonCard } from '../common/SkeletonCard';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  note?: string;
  viewAllLink?: string;
  badgeText?: string;
  className?: string;
  isLoading?: boolean;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  movies,
  note,
  viewAllLink,
  badgeText,
  className = '',
  isLoading = false,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [movies, isLoading]);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    }
  };

  if (!movies.length && !isLoading) return null;

  return (
    <section className={`py-6 sm:py-8 relative ${className}`}>
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GothStar className="w-3.5 h-3.5 text-dusty-rose" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-warm-cream">
              {title}
            </h2>
            {badgeText && (
              <span className="font-pixel text-[8px] px-2 py-0.5 rounded bg-deep-cherry text-soft-blush border border-dusty-rose/40 pixel-crisp">
                {badgeText}
              </span>
            )}
          </div>
          {note && (
            <p className="font-handwritten text-base sm:text-lg text-soft-blush/90 pl-5">
              “{note}”
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs font-sans font-medium text-muted-mauve hover:text-soft-blush transition-colors flex items-center gap-1 group"
            >
              <span>Explore collection</span>
              <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>
          )}

          {/* Desktop Left / Right Scroll Buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              type="button"
              aria-label="Scroll left"
              className={`p-1.5 rounded-full border border-deep-cherry transition-all ${
                canScrollLeft
                  ? 'bg-charcoal-plum text-warm-cream hover:bg-deep-cherry hover:text-soft-blush'
                  : 'bg-midnight-black/40 text-muted-mauve/30 cursor-not-allowed border-transparent'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              type="button"
              aria-label="Scroll right"
              className={`p-1.5 rounded-full border border-deep-cherry transition-all ${
                canScrollRight
                  ? 'bg-charcoal-plum text-warm-cream hover:bg-deep-cherry hover:text-soft-blush'
                  : 'bg-midnight-black/40 text-muted-mauve/30 cursor-not-allowed border-transparent'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Movie Horizontal Row */}
      <div
        ref={rowRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 py-2 scroll-smooth"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} size="md" />
          ))
        ) : (
          movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        )}
      </div>
    </section>
  );
};
