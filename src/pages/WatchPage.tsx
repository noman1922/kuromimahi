import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Movie } from '../types/movie';
import { tmdb } from '../services/tmdb';
import { PlaybackPanel } from '../components/playback/PlaybackPanel';
import { MovieCard } from '../components/movie/MovieCard';
import { KuromiMascot, GothStar, BirthdayStamp } from '../components/common/KuromiDecorations';
import { PixelBadge } from '../components/common/PixelBadge';

export const WatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | undefined>(undefined);
  const [related, setRelated] = useState<Movie[]>([]);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  const loading = Boolean(id && loadedId !== id);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    tmdb.getDetailsById(id)
      .then((item) => {
        if (!isMounted) return;
        setMovie(item);
        setLoadedId(id);
        if (item) {
          tmdb.getRelated(item, 6).then((rel) => {
            if (isMounted) setRelated(rel);
          });
        }
      })
      .catch((err) => {
        console.warn('Error loading watch title:', err);
        if (isMounted) setLoadedId(id);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen animate-pulse">
        <div className="h-6 bg-charcoal-plum/60 rounded w-48 mb-4" />
        <div className="aspect-[16/9] w-full rounded-2xl bg-charcoal-plum border border-deep-cherry/40" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 text-center flex flex-col items-center justify-center">
        <KuromiMascot className="w-16 h-16 text-dusty-rose mb-4" />
        <h2 className="font-serif text-3xl font-bold text-warm-cream mb-2">
          Title Unavailable in TMDB
        </h2>
        <p className="font-sans text-sm text-muted-mauve mb-6 max-w-md">
          The requested movie id was not recognized in the TMDB catalog.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-xl bg-deep-cherry hover:bg-cherry-hover text-warm-cream border border-dusty-rose/40 font-sans text-sm"
        >
          Return to Midnight Lounge
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      {/* Top Banner detail */}
      <div className="flex items-center justify-between mb-4 text-xs">
        <div className="flex items-center gap-2">
          <PixelBadge variant="pink" size="xs" dot>
            NOW SCREENING
          </PixelBadge>
          <span className="font-handwritten text-base text-soft-blush hidden sm:inline">
            Screening for Mother Teresa ♡
          </span>
        </div>
        <BirthdayStamp />
      </div>

      {/* Playback Panel (Modular player) */}
      <PlaybackPanel movie={movie} />

      {/* Related Titles */}
      {related.length > 0 && (
        <div className="mt-16 pt-10 border-t border-deep-cherry/60">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <GothStar className="w-4 h-4 text-dusty-rose" />
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-warm-cream">
                More from the TMDB Midnight Vault
              </h3>
            </div>
            <Link
              to="/movies"
              className="text-xs text-muted-mauve hover:text-soft-blush transition-colors"
            >
              View Full Collection →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {related.map((rel) => (
              <MovieCard key={rel.id} movie={rel} size="md" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
