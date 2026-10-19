import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import type { Movie, ContentType } from '../types/movie';
import { tmdb } from '../services/tmdb';
import { MovieGrid } from '../components/movie/MovieGrid';
import { SearchBar } from '../components/movie/SearchBar';
import { EmptyState } from '../components/common/EmptyState';
import { PixelBadge } from '../components/common/PixelBadge';
import { TinySkull, GothStar } from '../components/common/KuromiDecorations';
import { SkeletonGrid } from '../components/common/SkeletonCard';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam);
  const [selectedType, setSelectedType] = useState<'all' | ContentType>('all');
  const [results, setResults] = useState<Movie[]>([]);
  const [searchedQuery, setSearchedQuery] = useState(queryParam ? '' : '__init__');

  const isSearching = Boolean(debouncedQuery.trim() && searchedQuery !== debouncedQuery.trim());

  // Synchronize URL query params
  useEffect(() => {
    if (query !== queryParam) {
      if (query) {
        setSearchParams({ q: query }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }
  }, [query, queryParam, setSearchParams]);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute TMDB multi-search when debouncedQuery changes
  useEffect(() => {
    let isMounted = true;
    const trimmed = debouncedQuery.trim();

    if (!trimmed) {
      return;
    }

    tmdb.searchMulti(trimmed)
      .then((items) => {
        if (isMounted) {
          setResults(items);
          setSearchedQuery(trimmed);
        }
      })
      .catch((err) => {
        console.warn('Search error:', err);
        if (isMounted) setSearchedQuery(trimmed);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setSearchedQuery('');
    }
  };

  const filteredResults = useMemo(() => {
    const list = debouncedQuery.trim() ? results : [];
    if (selectedType === 'all') return list;
    return list.filter((item) => item.contentType === selectedType);
  }, [debouncedQuery, results, selectedType]);

  const popularSearches = ['Crash Landing', 'Miyazaki', 'Past Lives', 'Queen of Tears', 'Interstellar', 'Howl', 'Your Name'];

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-dusty-rose" />
          <PixelBadge variant="pink" size="xs">
            TMDB LIVE SEARCH
          </PixelBadge>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-warm-cream">
          Search the Lounge
        </h1>
        <p className="font-sans text-sm text-muted-mauve mt-1">
          Search millions of titles across The Movie Database in real-time.
        </p>

        {/* Search input */}
        <div className="mt-6">
          <SearchBar
            value={query}
            onChange={handleQueryChange}
            autoFocus
            placeholder="Search films, series, anime, actors, directors..."
          />
        </div>

        {/* Popular Tags */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-muted-mauve flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-dusty-rose" />
            Try:
          </span>
          {popularSearches.map((term) => (
            <button
              key={term}
              onClick={() => handleQueryChange(term)}
              type="button"
              className="px-2 py-0.5 rounded-full bg-charcoal-plum border border-deep-cherry text-soft-blush hover:border-dusty-rose text-[11px] font-sans transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Filter by Type Tabs if query exists */}
      {query.trim() && (
        <div className="flex items-center justify-between border-b border-deep-cherry/40 pb-4 mb-6">
          <div className="flex items-center gap-2">
            {(['all', 'movie', 'series', 'anime'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                type="button"
                className={`px-3 py-1 rounded-lg text-xs font-sans capitalize transition-colors ${selectedType === type
                    ? 'bg-deep-cherry text-soft-blush border border-dusty-rose font-medium'
                    : 'bg-charcoal-plum/60 text-muted-mauve hover:text-warm-cream border border-transparent'
                  }`}
              >
                {type === 'all' ? 'All Results' : type}
              </button>
            ))}
          </div>

          <div className="text-xs text-muted-mauve flex items-center gap-1.5">
            <TinySkull className="text-dusty-rose" />
            <span>
              Found <strong className="text-warm-cream">{filteredResults.length}</strong> {filteredResults.length === 1 ? 'match' : 'matches'}
            </span>
          </div>
        </div>
      )}

      {/* Results / Empty States */}
      {isSearching ? (
        <SkeletonGrid count={8} />
      ) : query.trim() ? (
        filteredResults.length > 0 ? (
          <MovieGrid movies={filteredResults} />
        ) : (
          <EmptyState
            title="No Results in the Lounge"
            description={`We couldn't find any title matching "${query}". Check your spelling or try searching for another keyword.`}
            actionText="Clear Search"
            onActionClick={() => handleQueryChange('')}
            badgeText="ZERO MATCHES"
          />
        )
      ) : (
        <div className="text-center py-16 text-muted-mauve space-y-3">
          <GothStar className="w-8 h-8 text-dusty-rose/40 mx-auto" />
          <p className="font-serif text-lg text-warm-cream">
            The TMDB live marquee is ready.
          </p>
          <p className="font-sans text-xs max-w-sm mx-auto">
            Type anything above to search through the entire global cinematic database.
          </p>
        </div>
      )}
    </div>
  );
};
