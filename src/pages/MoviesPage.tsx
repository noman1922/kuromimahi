import React, { useState, useEffect, useMemo } from 'react';
import { Film, SlidersHorizontal, RotateCcw } from 'lucide-react';
import type { Movie } from '../types/movie';
import { tmdb } from '../services/tmdb';
import { MovieGrid } from '../components/movie/MovieGrid';
import { GenreFilter } from '../components/movie/GenreFilter';
import { SearchBar } from '../components/movie/SearchBar';
import { EmptyState } from '../components/common/EmptyState';
import { PixelBadge } from '../components/common/PixelBadge';
import { TinySkull, GothStar } from '../components/common/KuromiDecorations';
import { SkeletonGrid } from '../components/common/SkeletonCard';

export const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'year-desc' | 'year-asc' | 'title' | 'rating'>('year-desc');

  useEffect(() => {
    let isMounted = true;

    async function fetchMovies() {
      try {
        const [popular, topRated] = await Promise.allSettled([
          tmdb.getPopularMovies(1),
          tmdb.getTopRatedMovies(1),
        ]);

        if (!isMounted) return;

        const combined: Movie[] = [];
        const seenIds = new Set<string>();

        if (popular.status === 'fulfilled') {
          popular.value.forEach((m) => {
            if (!seenIds.has(m.id)) {
              seenIds.add(m.id);
              combined.push(m);
            }
          });
        }
        if (topRated.status === 'fulfilled') {
          topRated.value.forEach((m) => {
            if (!seenIds.has(m.id)) {
              seenIds.add(m.id);
              combined.push(m);
            }
          });
        }

        if (combined.length > 0) {
          setMovies(combined);
        }
      } catch (err) {
        console.warn('Error fetching TMDB movies catalog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const more = await tmdb.getPopularMovies(nextPage);
      if (more.length > 0) {
        setMovies((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const additions = more.filter((m) => !seen.has(m.id));
          return [...prev, ...additions];
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.warn('Failed to load more movies:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredMovies = useMemo(() => {
    return movies
      .filter((m) => {
        const matchesSearch =
          m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.director && m.director.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesGenre =
          selectedGenre === 'All' || m.genres.includes(selectedGenre);

        return matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        if (sortBy === 'year-desc') return b.releaseYear - a.releaseYear;
        if (sortBy === 'year-asc') return a.releaseYear - b.releaseYear;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [movies, searchTerm, selectedGenre, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
    setSortBy('year-desc');
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Film className="w-4 h-4 text-dusty-rose" />
          <PixelBadge variant="pink" size="xs">
            TMDB LIVE ARCHIVE
          </PixelBadge>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-warm-cream">
          Feature Films
        </h1>
        <p className="font-sans text-sm text-muted-mauve mt-1">
          Full-length cinematic gems for when you want a complete journey in one sitting.
        </p>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="space-y-4 mb-8 bg-charcoal-plum/60 border border-deep-cherry/60 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search movie titles, directors, synopsis..."
            className="w-full md:max-w-md"
          />

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-sans text-muted-mauve flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-dusty-rose" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-midnight-black border border-deep-cherry rounded-lg px-3 py-2 text-xs text-warm-cream font-sans focus:outline-none focus:border-dusty-rose"
            >
              <option value="year-desc">Release Year (Newest)</option>
              <option value="year-asc">Release Year (Oldest)</option>
              <option value="rating">Rating (Highest)</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>

            {(searchTerm || selectedGenre !== 'All') && (
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
          <div className="text-[11px] font-sans text-muted-mauve mb-1 flex items-center gap-1">
            <TinySkull className="text-dusty-rose w-3 h-3" />
            <span>Filter by Genre:</span>
          </div>
          <GenreFilter
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
          />
        </div>
      </div>

      {/* Results Count & Badges */}
      <div className="flex items-center justify-between mb-6 text-xs text-muted-mauve">
        <div className="flex items-center gap-2">
          <GothStar className="w-3 h-3 text-dusty-rose" />
          <span>
            Showing <strong className="text-warm-cream">{filteredMovies.length}</strong> {filteredMovies.length === 1 ? 'film' : 'films'}
          </span>
        </div>
        {selectedGenre !== 'All' && (
          <span className="font-pixel text-[8px] text-soft-blush">
            GENRE: {selectedGenre.toUpperCase()}
          </span>
        )}
      </div>

      {/* Grid or Empty State or Loading */}
      {loading && movies.length === 0 ? (
        <SkeletonGrid count={12} />
      ) : filteredMovies.length > 0 ? (
        <>
          <MovieGrid movies={filteredMovies} />
          {/* Load More Button */}
          {page < 5 && !searchTerm && selectedGenre === 'All' && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                type="button"
                className="px-6 py-2.5 rounded-xl bg-charcoal-plum hover:bg-deep-cherry text-warm-cream border border-deep-cherry hover:border-dusty-rose/60 text-xs font-sans font-medium transition-all shadow-sm"
              >
                {loadingMore ? 'Fetching More Films from TMDB...' : 'Load More Films from Vault ↓'}
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No Films Found"
          description={`We couldn't find any movie matching "${searchTerm || selectedGenre}". Try searching another keyword or clearing your filters.`}
          actionText="Clear All Filters"
          onActionClick={handleResetFilters}
          badgeText="ZERO MATCHES"
        />
      )}
    </div>
  );
};
