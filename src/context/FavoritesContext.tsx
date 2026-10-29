import React, { useState, useEffect, type ReactNode } from 'react';
import type { Movie } from '../types/movie';
import { FavoritesContext } from './favoritesTypes';
import { tmdb } from '../services/tmdb';

const STORAGE_KEY = 'mahis_cinema_watchlist_v1';

// Safe helper for localStorage
function loadSavedFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.warn('localStorage is not accessible or corrupted, using memory fallback:', e);
    return [];
  }
}

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(loadSavedFavorites);
  const [favoriteMoviesMap, setFavoriteMoviesMap] = useState<Record<string, Movie>>({});

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not persist favorites to localStorage:', e);
    }
  }, [favorites]);

  // Dynamically resolve full metadata for each saved favorite ID using live TMDB
  useEffect(() => {
    let isMounted = true;

    favorites.forEach((id) => {
      if (!favoriteMoviesMap[id]) {
        tmdb.getDetailsById(id).then((fetched) => {
          if (isMounted && fetched) {
            setFavoriteMoviesMap((prev) => ({ ...prev, [id]: fetched }));
          }
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [favorites, favoriteMoviesMap]);

  const addFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item !== id));
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const clearFavorites = () => {
    setFavorites([]);
  };

  const favoriteMovies = favorites
    .map((id) => favoriteMoviesMap[id])
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
