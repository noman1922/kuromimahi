import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import type { Movie } from '../types/movie';
import { tmdb } from '../services/tmdb';
import { AUTHENTIC_TMDB_FALLBACK } from '../data/authenticTmdbFallback';
import { MovieGrid } from '../components/movie/MovieGrid';
import { GenreFilter } from '../components/movie/GenreFilter';
import { SearchBar } from '../components/movie/SearchBar';
import { EmptyState } from '../components/common/EmptyState';
import { PixelBadge } from '../components/common/PixelBadge';
import { KuromiMascot, GothStar } from '../components/common/KuromiDecorations';
import { SkeletonGrid } from '../components/common/SkeletonCard';

export const AnimePage: React.FC = () => {
  const [animeList, setAnimeList] = useState<Movie[]>(() =>
    AUTHENTIC_TMDB_FALLBACK.filter((m) => m.contentType === 'anime' || m.isAnime)
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    let isMounted = true;

    async function fetchAnime() {
      try {
        const liveAnime = await tmdb.getAnime(1);
        if (!isMounted) return;
        if (liveAnime.length > 0) {
          setAnimeList(liveAnime);
        }
      } catch (err) {
        console.warn('Error fetching TMDB anime:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAnime();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const more = await tmdb.getAnime(nextPage);
      if (more.length > 0) {
        setAnimeList((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const additions = more.filter((m) => !seen.has(m.id));
          return [...prev, ...additions];
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.warn('Failed to load more anime:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredAnime = useMemo(() => {
    return animeList.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.originalTitle && m.originalTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGenre =
        selectedGenre === 'All' || m.genres.includes(selectedGenre);

      return matchesSearch && matchesGenre;
    });
  }, [animeList, searchTerm, selectedGenre]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-dusty-rose" />
            <PixelBadge variant="pink" size="xs">
              TMDB STUDIO ARCHIVE
            </PixelBadge>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-warm-cream">
            Anime & Animation
          </h1>
          <p className="font-sans text-sm text-muted-mauve mt-1">
            Studio Ghibli wonders, Shinkai skies, and magical worlds where hearts find home.
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-charcoal-plum border border-deep-cherry flex items-center justify-center shadow-cherry-glow flex-shrink-0">
          <KuromiMascot className="w-8 h-8 text-soft-blush" />
        </div>
      </div>

      {/* Filter Row */}
      <div className="space-y-4 mb-8 bg-charcoal-plum/60 border border-deep-cherry/60 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search anime titles, Japanese names, director..."
            className="w-full md:max-w-md"
          />

          {(searchTerm || selectedGenre !== 'All') && (
            <button
              onClick={handleResetFilters}
              type="button"
              className="p-2 rounded-lg bg-deep-cherry/40 text-soft-blush hover:bg-deep-cherry transition-colors border border-dusty-rose/30 text-xs flex items-center gap-1.5 ml-auto"
              title="Reset filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Genre Chips */}
        <div>
          <div className="text-[11px] font-sans text-muted-mauve mb-1">
            Filter by Theme:
          </div>
          <GenreFilter
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6 text-xs text-muted-mauve">
        <div className="flex items-center gap-2">
          <GothStar className="w-3 h-3 text-dusty-rose" />
          <span>
            Showing <strong className="text-warm-cream">{filteredAnime.length}</strong> anime titles
          </span>
        </div>
      </div>

      {loading && animeList.length === 0 ? (
        <SkeletonGrid count={12} />
      ) : filteredAnime.length > 0 ? (
        <>
          <MovieGrid movies={filteredAnime} />
          {page < 5 && !searchTerm && selectedGenre === 'All' && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                type="button"
                className="px-6 py-2.5 rounded-xl bg-charcoal-plum hover:bg-deep-cherry text-warm-cream border border-deep-cherry hover:border-dusty-rose/60 text-xs font-sans font-medium transition-all shadow-sm"
              >
                {loadingMore ? 'Fetching More Anime...' : 'Load More Anime ↓'}
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No Anime Found"
          description={`No anime matched your search. Try another title or switch genres.`}
          actionText="Clear All Filters"
          onActionClick={handleResetFilters}
          badgeText="ZERO ANIME"
        />
      )}
    </div>
  );
};
