import type { Movie } from '../types/movie';
import { AUTHENTIC_TMDB_FALLBACK } from './authenticTmdbFallback';

export const MOVIES: Movie[] = AUTHENTIC_TMDB_FALLBACK;

export const GENRE_LIST = [
  'All',
  'Romance',
  'Drama',
  'Animation',
  'Fantasy',
  'Sci-Fi',
  'Comedy',
  'Slice of Life',
  'Mystery',
] as const;

export function getMovieById(id: string): Movie | undefined {
  return AUTHENTIC_TMDB_FALLBACK.find((m) => m.id === id || m.id.endsWith(`-${id}`));
}

export function getRelatedMovies(currentMovie: Movie, limit = 5): Movie[] {
  return AUTHENTIC_TMDB_FALLBACK.filter(
    (m) =>
      m.id !== currentMovie.id &&
      (m.contentType === currentMovie.contentType ||
        m.genres.some((g) => currentMovie.genres.includes(g)))
  ).slice(0, limit);
}
