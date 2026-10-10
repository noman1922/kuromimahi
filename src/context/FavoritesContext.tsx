import React, { useState, useEffect, type ReactNode } from 'react';
import { AUTHENTIC_TMDB_FALLBACK } from '../data/authenticTmdbFallback';
import type { Movie } from '../types/movie';
import { FavoritesContext } from './favoritesTypes';
import { tmdb } from '../services/tmdb';

const STORAGE_KEY = 'mahis_cinema_watchlist_v1';

// Legacy ID migration map for backwards compatibility
const LEGACY_ID_MAP: Record<string, string> = {
  'crash-landing-on-you': 'tv-94796',
  'howls-moving-castle': 'movie-4935',
  'la-la-land': 'movie-313369',
  'spirited-away': 'movie-129',
  'past-lives': 'movie-666277',
  'your-name': 'movie-372058',
  'interstellar': 'movie-157336',
  'pride-and-prejudice': 'movie-4348',
  'queen-of-tears': 'tv-221851',
  'twenty-five-twenty-one': 'tv-153518',
  'suzume': 'movie-916224',
  'arcane': 'tv-94605',
};

// Safe helper for localStorage
function loadSavedFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return ['tv-94796', 'movie-4935', 'movie-313369'];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      // Migrate legacy string IDs to TMDB IDs
      return parsed.map((id) => LEGACY_ID_MAP[id] || id);
    }
    return ['tv-94796', 'movie-4935', 'movie-313369'];
  } catch (e) {
    console.warn('localStorage is not accessible or corrupted, using memory fallback:', e);
    return ['tv-94796', 'movie-4935', 'movie-313369'];
  }
}

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(loadSavedFavorites);
  const [extraMovies, setExtraMovies] = useState<Record<string, Movie>>({});

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not persist favorites to localStorage:', e);
    }
  }, [favorites]);

  // Dynamically resolve any favorites that are not in the static fallback
  useEffect(() => {
    favorites.forEach((favId) => {
      const existsInFallback = AUTHENTIC_TMDB_FALLBACK.some(
        (m) => m.id === favId || m.id === LEGACY_ID_MAP[favId]
      );
      if (!existsInFallback && !extraMovies[favId]) {
        tmdb.getDetailsById(favId).then((fetched) => {
          if (fetched) {
            setExtraMovies((prev) => ({ ...prev, [favId]: fetched }));
          }
        });
      }
    });
  }, [favorites, extraMovies]);

  const addFavorite = (id: string) => {
    const canonicalId = LEGACY_ID_MAP[id] || id;
    setFavorites((prev) => (prev.includes(canonicalId) ? prev : [...prev, canonicalId]));
  };

  const removeFavorite = (id: string) => {
    const canonicalId = LEGACY_ID_MAP[id] || id;
    setFavorites((prev) => prev.filter((item) => item !== canonicalId && item !== id));
  };

  const toggleFavorite = (id: string) => {
    const canonicalId = LEGACY_ID_MAP[id] || id;
    setFavorites((prev) =>
      prev.includes(canonicalId) || prev.includes(id)
        ? prev.filter((item) => item !== canonicalId && item !== id)
        : [...prev, canonicalId]
    );
  };

  const isFavorite = (id: string) => {
    const canonicalId = LEGACY_ID_MAP[id] || id;
    return favorites.includes(canonicalId) || favorites.includes(id);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const favoriteMovies = favorites
    .map((id) => {
      const canonicalId = LEGACY_ID_MAP[id] || id;
      return (
        AUTHENTIC_TMDB_FALLBACK.find((m) => m.id === canonicalId || m.id === id) ||
        extraMovies[id] ||
        extraMovies[canonicalId]
      );
    })
    .filter((m): m is Movie => m !== undefined);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteMovies,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
