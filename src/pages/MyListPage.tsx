import React, { useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { useFavorites } from '../context/useFavorites';
import { MovieGrid } from '../components/movie/MovieGrid';
import { EmptyState } from '../components/common/EmptyState';
import { PixelBadge } from '../components/common/PixelBadge';
import { TinySkull, BirthdayStamp } from '../components/common/KuromiDecorations';

export const MyListPage: React.FC = () => {
  const { favoriteMovies, favorites, clearFavorites } = useFavorites();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-dusty-rose fill-dusty-rose" />
            <PixelBadge variant="pink" size="xs">
              PERSONAL WATCHLIST
            </PixelBadge>
            <BirthdayStamp />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-warm-cream">
            Mahi's Watchlist
          </h1>
          <p className="font-sans text-sm text-muted-mauve mt-1">
            Hand-selected favorites and stories waiting for your next midnight movie night.
          </p>
        </div>

        {favorites.length > 0 && (
          <div className="flex items-center gap-3">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 bg-midnight-black/90 p-2 rounded-xl border border-deep-cherry">
                <span className="text-xs text-soft-blush">Clear all {favorites.length}?</span>
                <button
                  onClick={() => {
                    clearFavorites();
                    setShowClearConfirm(false);
                  }}
                  type="button"
                  className="px-2.5 py-1 rounded bg-deep-cherry text-warm-cream text-xs hover:bg-cherry-hover"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  type="button"
                  className="px-2 py-1 text-xs text-muted-mauve hover:text-warm-cream"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-plum hover:bg-deep-cherry text-muted-mauve hover:text-soft-blush border border-deep-cherry text-xs font-sans transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear List</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {favoriteMovies.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-deep-cherry/40 text-xs text-muted-mauve">
            <div className="flex items-center gap-2">
              <TinySkull className="text-dusty-rose" />
              <span>
                You have <strong className="text-warm-cream">{favoriteMovies.length}</strong> saved {favoriteMovies.length === 1 ? 'title' : 'titles'} in your private sanctuary.
              </span>
            </div>
            <span className="font-handwritten text-base text-soft-blush hidden sm:inline">
              Saved for Mother Teresa ♡
            </span>
          </div>

          <MovieGrid movies={favoriteMovies} />
        </>
      ) : (
        <EmptyState
          title="Your List is Waiting"
          description="You haven't saved any movies or series to your personal lounge yet. Browse the catalog and tap the heart on any title you'd love to watch."
          actionText="Explore All Movies"
          actionLink="/movies"
          badgeText="EMPTY WATCHLIST"
        />
      )}
    </div>
  );
};
