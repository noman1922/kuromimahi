import React, { useState, useEffect, useMemo } from 'react';
import { Tv, RotateCcw } from 'lucide-react';
import type { Movie } from '../types/movie';
import { tmdb } from '../services/tmdb';
import { MovieGrid } from '../components/movie/MovieGrid';
import { GenreFilter } from '../components/movie/GenreFilter';
import { SearchBar } from '../components/movie/SearchBar';
import { EmptyState } from '../components/common/EmptyState';
import { PixelBadge } from '../components/common/PixelBadge';
import { TinySkull, GothStar } from '../components/common/KuromiDecorations';
import { SkeletonGrid } from '../components/common/SkeletonCard';

export const SeriesPage: React.FC = () => {
  const [series, setSeries] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [onlyKdramas, setOnlyKdramas] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchSeries() {
      try {
        const [popularTv, kdramas] = await Promise.allSettled([
          tmdb.getPopularTv(1),
          tmdb.getKoreanDramas(1),
        ]);

        if (!isMounted) return;

        const combined: Movie[] = [];
        const seenIds = new Set<string>();

        if (kdramas.status === 'fulfilled') {
          kdramas.value.forEach((s) => {
            if (!seenIds.has(s.id)) {
              seenIds.add(s.id);
              combined.push(s);
            }
          });
        }
        if (popularTv.status === 'fulfilled') {
          popularTv.value.forEach((s) => {
            if (!seenIds.has(s.id)) {
              seenIds.add(s.id);
              combined.push(s);
            }
          });
        }

        if (combined.length > 0) {
          setSeries(combined);
        }
      } catch (err) {
        console.warn('Error fetching TMDB series:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSeries();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const more = onlyKdramas
        ? await tmdb.getKoreanDramas(nextPage)
        : await tmdb.getPopularTv(nextPage);

      if (more.length > 0) {
        setSeries((prev) => {
          const seen = new Set(prev.map((s) => s.id));
          const additions = more.filter((s) => !seen.has(s.id));
          return [...prev, ...additions];
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.warn('Failed to load more series:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredSeries = useMemo(() => {
    return series.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGenre =
        selectedGenre === 'All' || m.genres.includes(selectedGenre);

      const matchesKdrama = !onlyKdramas || m.isKoreanDrama;

      return matchesSearch && matchesGenre && matchesKdrama;
    });
  }, [series, searchTerm, selectedGenre, onlyKdramas]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
    setOnlyKdramas(false);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Tv className="w-4 h-4 text-dusty-rose" />
          <PixelBadge variant="mauve" size="xs">
            TMDB EPISODIC ARCHIVE
          </PixelBadge>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-warm-cream">
          Series & K-Dramas
        </h1>
        <p className="font-sans text-sm text-muted-mauve mt-1">
          Multi-episode sagas, heart-wrenching plot twists, and late-night binge marathons.
        </p>
      </div>

      {/* Filter Row */}
      <div className="space-y-4 mb-8 bg-charcoal-plum/60 border border-deep-cherry/60 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search series or Korean dramas..."
            className="w-full md:max-w-md"
          />

          {/* Quick Korean Drama toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setOnlyKdramas(!onlyKdramas)}
              type="button"
              className={`px-3 py-1.5 rounded-lg border text-xs font-sans font-medium flex items-center gap-2 transition-colors ${
                onlyKdramas
                  ? 'bg-deep-cherry text-soft-blush border-dusty-rose shadow-goth-glow'
                  : 'bg-midnight-black text-muted-mauve border-deep-cherry hover:text-warm-cream'
              }`}
            >
              <TinySkull className={onlyKdramas ? 'text-soft-blush' : 'text-muted-mauve'} />
              <span>K-Drama Only</span>
            </button>

            {(searchTerm || selectedGenre !== 'All' || onlyKdramas) && (
              <button
                onClick={handleResetFilters}
                type="button"
                className="p-2 rounded-lg bg-deep-cherry/40 text-soft-blush hover:bg-deep-cherry transition-colors border border-dusty-rose/30 text-xs flex items-center gap-1"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Genre Chips */}
        <div>
          <div className="text-[11px] font-sans text-muted-mauve mb-1">
            Filter by Genre:
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
            Showing <strong className="text-warm-cream">{filteredSeries.length}</strong> series
          </span>
        </div>
        {onlyKdramas && (
          <span className="font-pixel text-[8px] text-soft-blush">
            FILTER: KOREAN DRAMAS ONLY
          </span>
        )}
      </div>

      {loading && series.length === 0 ? (
        <SkeletonGrid count={12} />
      ) : filteredSeries.length > 0 ? (
        <>
          <MovieGrid movies={filteredSeries} />
          {page < 5 && !searchTerm && selectedGenre === 'All' && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                type="button"
                className="px-6 py-2.5 rounded-xl bg-charcoal-plum hover:bg-deep-cherry text-warm-cream border border-deep-cherry hover:border-dusty-rose/60 text-xs font-sans font-medium transition-all shadow-sm"
              >
                {loadingMore ? 'Fetching More Series...' : 'Load More Series ↓'}
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No Series Found"
          description={`No series found matching your criteria. Try adjusting your search query or reset your filters.`}
          actionText="Clear All Filters"
          onActionClick={handleResetFilters}
          badgeText="EMPTY SERIES"
        />
      )}
    </div>
  );
};
