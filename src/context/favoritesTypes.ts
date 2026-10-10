import { createContext } from 'react';
import type { Movie } from '../types/movie';

export interface FavoritesContextType {
  favorites: string[]; // movie IDs
  favoriteMovies: Movie[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

