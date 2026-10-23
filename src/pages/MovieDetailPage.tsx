import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Clock, Globe, Sparkles, ArrowLeft } from 'lucide-react';
import type { Movie } from '../types/movie';
import { tmdb } from '../services/tmdb';
import { FavoriteButton } from '../components/common/FavoriteButton';
import { PixelBadge } from '../components/common/PixelBadge';
import { KuromiMascot, BirthdayStamp, GothStar } from '../components/common/KuromiDecorations';
import { MovieCard } from '../components/movie/MovieCard';
import { HandwrittenNote } from '../components/common/HandwrittenNote';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | undefined>(undefined);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [backdropLoaded, setBackdropLoaded] = useState(false);

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
            if (isMounted) setRelatedMovies(rel);
          });
        }
      })
      .catch((err) => {
        console.warn('Error fetching movie details:', err);
        if (isMounted) setLoadedId(id);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-pulse">
        <div className="h-64 sm:h-96 rounded-2xl bg-charcoal-plum/60 border border-deep-cherry/40 mb-8" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 sm:w-64 aspect-[2/3] bg-charcoal-plum rounded-2xl border border-deep-cherry/60" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-charcoal-plum rounded w-2/3" />
            <div className="h-4 bg-charcoal-plum/60 rounded w-1/3" />
            <div className="h-24 bg-charcoal-plum/40 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 text-center flex flex-col items-center justify-center">
        <KuromiMascot className="w-16 h-16 text-dusty-rose mb-4" />
        <h2 className="font-serif text-3xl font-bold text-warm-cream mb-2">
          Movie Not Found in Lounge
        </h2>
        <p className="font-sans text-sm text-muted-mauve mb-6 max-w-md">
          The title you are searching for is not in the TMDB catalog or may have been archived.
        </p>
        <Link
          to="/movies"
          className="px-6 py-2.5 rounded-xl bg-deep-cherry hover:bg-cherry-hover text-warm-cream border border-dusty-rose/40 font-sans text-sm"
        >
          Return to Movies Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Backdrop Banner */}
      <div className="relative w-full h-[55vh] sm:h-[65vh] overflow-hidden bg-midnight-black">
        <img
          src={movie.backdrop}
          alt={movie.title}
          onLoad={() => setBackdropLoaded(true)}
          className={`w-full h-full object-cover object-center filter brightness-[0.4] contrast-[1.1] transition-opacity duration-700 ${
            backdropLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />
        {/* Gradients for smooth readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-black via-midnight-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight-black via-midnight-black/60 to-transparent" />

        {/* Back Link */}
        <div className="absolute top-20 left-4 sm:left-8 z-20">
          <Link
            to={movie.contentType === 'series' ? '/series' : '/movies'}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-midnight-black/70 backdrop-blur-md border border-deep-cherry text-xs font-sans text-warm-cream hover:text-soft-blush hover:border-dusty-rose transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to {movie.contentType === 'series' ? 'Series' : 'Movies'}</span>
          </Link>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 sm:-mt-48 relative z-20">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Poster Column */}
          <div className="flex-shrink-0 w-48 sm:w-64 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-charcoal-plum border-2 border-deep-cherry shadow-2xl shadow-black/80">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <FavoriteButton movieId={movie.id} size="md" />
              </div>
            </div>

            {/* Quick Watch Now Callout */}
            <div className="mt-4 flex flex-col gap-2.5">
              <Link
                to={`/watch/${movie.id}`}
                className="w-full py-3.5 rounded-xl bg-deep-cherry hover:bg-cherry-hover text-warm-cream border border-dusty-rose/60 font-sans font-semibold text-sm shadow-goth-glow flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current text-soft-blush" />
                <span>Watch in Midnight Lounge</span>
              </Link>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-6">
            {/* Badges & Year */}
            <div className="flex flex-wrap items-center gap-2.5">
              <PixelBadge variant="pink" size="xs">
                {movie.contentType.toUpperCase()}
              </PixelBadge>
              {movie.isKoreanDrama && (
                <PixelBadge variant="mauve" size="xs">
                  KOREAN DRAMA
                </PixelBadge>
              )}
              <span className="font-pixel text-[9px] text-muted-mauve">
                {movie.releaseYear}
              </span>
              {movie.rating && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-charcoal-plum border border-deep-cherry text-xs">
                  <Star className="w-3.5 h-3.5 text-dusty-rose fill-dusty-rose" />
                  <span className="font-bold text-warm-cream">{movie.rating.toFixed(1)}</span>
                </div>
              )}
              <BirthdayStamp />
            </div>

            {/* Title & Original Title */}
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-warm-cream leading-tight">
                {movie.title}
              </h1>
              {movie.originalTitle && (
                <p className="font-sans text-base text-soft-blush/80 mt-1">
                  {movie.originalTitle}
                </p>
              )}
            </div>

            {/* Metadata Tags */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-mauve font-sans border-y border-deep-cherry/40 py-3">
              {movie.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-dusty-rose" />
                  {movie.duration}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-dusty-rose" />
                {movie.language}
              </span>
              <div className="flex items-center gap-1.5">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded bg-charcoal-plum text-soft-blush text-[11px] border border-deep-cherry"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <h3 className="font-serif text-lg font-semibold text-warm-cream mb-2 flex items-center gap-2">
                <GothStar className="w-3.5 h-3.5 text-dusty-rose" />
                Synopsis
              </h3>
              <p className="font-sans text-sm sm:text-base text-warm-cream/90 leading-relaxed max-w-3xl">
                {movie.description}
              </p>
            </div>

            {/* Curator Handwritten Note if present */}
            {movie.curatorNote && (
              <HandwrittenNote rotation="right" author="Mahi's Cinema note">
                {movie.curatorNote}
              </HandwrittenNote>
            )}

            {/* Cast & Director */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-sans">
              {movie.director && (
                <div className="bg-charcoal-plum/60 border border-deep-cherry/60 rounded-xl p-3">
                  <span className="text-muted-mauve block mb-0.5">Director</span>
                  <span className="font-medium text-warm-cream text-sm">
                    {movie.director}
                  </span>
                </div>
              )}

              {movie.cast && movie.cast.length > 0 && (
                <div className="bg-charcoal-plum/60 border border-deep-cherry/60 rounded-xl p-3">
                  <span className="text-muted-mauve block mb-0.5">Featuring Cast</span>
                  <span className="font-medium text-warm-cream text-sm">
                    {movie.cast.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Titles Section */}
        {relatedMovies.length > 0 && (
          <div className="mt-20 pt-10 border-t border-deep-cherry/60">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-dusty-rose" />
              <h3 className="font-serif text-2xl font-bold text-warm-cream">
                You May Also Adore
              </h3>
              <PixelBadge variant="mauve" size="xs">
                SIMILAR VIBES
              </PixelBadge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {relatedMovies.map((rel) => (
                <MovieCard key={rel.id} movie={rel} size="md" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
