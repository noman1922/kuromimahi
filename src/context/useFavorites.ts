import { useContext } from 'react';
import { FavoritesContext, type FavoritesContextType } from './favoritesTypes';

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
