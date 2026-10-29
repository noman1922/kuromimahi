import type { Movie, ContentType } from '../types/movie';
import type { TmdbMovieItem, TmdbTvItem, TmdbMovieDetails, TmdbTvDetails } from '../types/tmdb';

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function getTmdbPosterUrl(path: string | null | undefined, size: 'w342' | 'w500' | 'w780' = 'w500'): string {
  if (!path) {
    return '';
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getTmdbBackdropUrl(path: string | null | undefined, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) {
    return '';
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

const GENRE_MAP: Record<number, string> = {
  // Movies
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  // TV Shows
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export function mapGenreIdsToNames(genreIds: number[] = []): string[] {
  const names = genreIds
    .map((id) => GENRE_MAP[id])
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? names : ['Drama'];
}

const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
  zh: 'Chinese',
  hi: 'Hindi',
  th: 'Thai',
};

export function formatLanguage(langCode = 'en'): string {
  return LANGUAGE_MAP[langCode.toLowerCase()] || langCode.toUpperCase();
}

/**
 * Maps a raw TMDB Movie item to our application Movie interface
 */
export function mapTmdbMovieToMovie(item: TmdbMovieItem): Movie {
  const releaseYear = item.release_date
    ? parseInt(item.release_date.slice(0, 4), 10) || 2024
    : 2024;

  const genres = mapGenreIdsToNames(item.genre_ids);
  const isRomantic = item.genre_ids?.includes(10749);
  const isAnime = item.genre_ids?.includes(16) && item.original_language === 'ja';

  return {
    id: `movie-${item.id}`,
    title: item.title,
    originalTitle: item.original_title !== item.title ? item.original_title : undefined,
    poster: getTmdbPosterUrl(item.poster_path, 'w500'),
    backdrop: getTmdbBackdropUrl(item.backdrop_path || item.poster_path, 'w1280'),
    description: item.overview || 'No synopsis available for this film.',
    releaseYear,
    genres,
    contentType: isAnime ? 'anime' : 'movie',
    language: formatLanguage(item.original_language),
    rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : undefined,
    isTrending: item.popularity > 50,
    isRomanticPick: isRomantic,
    isAnime,
    isQuietNight: isRomantic || genres.includes('Drama'),
  };
}

/**
 * Maps a raw TMDB TV item to our application Movie interface
 */
export function mapTmdbTvToMovie(item: TmdbTvItem): Movie {
  const releaseYear = item.first_air_date
    ? parseInt(item.first_air_date.slice(0, 4), 10) || 2024
    : 2024;

  const genres = mapGenreIdsToNames(item.genre_ids);
  const isKdrama = item.original_language === 'ko';
  const isAnime = item.genre_ids?.includes(16) && item.original_language === 'ja';
  const isRomantic = item.genre_ids?.includes(10749) || (isKdrama && genres.includes('Drama'));

  let contentType: ContentType = 'series';
  if (isAnime) {
    contentType = 'anime';
  }

  return {
    id: `tv-${item.id}`,
    title: item.name,
    originalTitle: item.original_name !== item.name ? item.original_name : undefined,
    poster: getTmdbPosterUrl(item.poster_path, 'w500'),
    backdrop: getTmdbBackdropUrl(item.backdrop_path || item.poster_path, 'w1280'),
    description: item.overview || 'No synopsis available for this series.',
    releaseYear,
    genres,
    contentType,
    language: formatLanguage(item.original_language),
    rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : undefined,
    isTrending: item.popularity > 40,
    isKoreanDrama: isKdrama,
    isAnime,
    isRomanticPick: isRomantic,
    isQuietNight: isRomantic || genres.includes('Drama'),
  };
}

/**
 * Maps full detailed Movie object (with runtime, cast, director, and recommendations)
 */
export function mapTmdbMovieDetailsToMovie(details: TmdbMovieDetails): Movie {
  const releaseYear = details.release_date
    ? parseInt(details.release_date.slice(0, 4), 10) || 2024
    : 2024;

  const genres = details.genres ? details.genres.map((g) => g.name) : ['Drama'];
  const isRomantic = genres.includes('Romance');
  const isAnime = genres.includes('Animation') && details.original_language === 'ja';

  // Extract director from crew
  const director = details.credits?.crew?.find((c) => c.job === 'Director')?.name;

  // Extract top 5 cast members
  const cast = details.credits?.cast
    ?.slice(0, 5)
    ?.map((c) => c.name)
    .filter(Boolean);

  // Format runtime
  const duration = details.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : undefined;

  return {
    id: `movie-${details.id}`,
    title: details.title,
    originalTitle: details.original_title !== details.title ? details.original_title : undefined,
    poster: getTmdbPosterUrl(details.poster_path, 'w780'),
    backdrop: getTmdbBackdropUrl(details.backdrop_path || details.poster_path, 'original'),
    description: details.overview || details.tagline || 'No synopsis available.',
    releaseYear,
    genres,
    contentType: isAnime ? 'anime' : 'movie',
    language: formatLanguage(details.original_language),
    rating: details.vote_average ? Math.round(details.vote_average * 10) / 10 : undefined,
    duration,
    director,
    cast,
    isTrending: details.popularity > 50,
    isRomanticPick: isRomantic,
    isAnime,
    isQuietNight: isRomantic || genres.includes('Drama'),
  };
}

/**
 * Maps full detailed TV object (with seasons, cast, creator, and recommendations)
 */
export function mapTmdbTvDetailsToMovie(details: TmdbTvDetails): Movie {
  const releaseYear = details.first_air_date
    ? parseInt(details.first_air_date.slice(0, 4), 10) || 2024
    : 2024;

  const genres = details.genres ? details.genres.map((g) => g.name) : ['Drama'];
  const isKdrama = details.original_language === 'ko';
  const isAnime = genres.includes('Animation') && details.original_language === 'ja';
  const isRomantic = genres.includes('Romance') || (isKdrama && genres.includes('Drama'));

  // Extract director / creator or executive producer
  const director = details.credits?.crew?.find(
    (c) => c.job === 'Director' || c.job === 'Executive Producer'
  )?.name;

  // Extract top 5 cast members
  const cast = details.credits?.cast
    ?.slice(0, 5)
    ?.map((c) => c.name)
    .filter(Boolean);

  const duration = details.number_of_seasons
    ? `${details.number_of_seasons} ${details.number_of_seasons === 1 ? 'Season' : 'Seasons'} (${details.number_of_episodes || 16} Episodes)`
    : undefined;

  let contentType: ContentType = 'series';
  if (isAnime) {
    contentType = 'anime';
  }

  return {
    id: `tv-${details.id}`,
    title: details.name,
    originalTitle: details.original_name !== details.name ? details.original_name : undefined,
    poster: getTmdbPosterUrl(details.poster_path, 'w780'),
    backdrop: getTmdbBackdropUrl(details.backdrop_path || details.poster_path, 'original'),
    description: details.overview || details.tagline || 'No synopsis available.',
    releaseYear,
    genres,
    contentType,
    language: formatLanguage(details.original_language),
    rating: details.vote_average ? Math.round(details.vote_average * 10) / 10 : undefined,
    duration,
    director,
    cast,
    isKoreanDrama: isKdrama,
    isAnime,
    isRomanticPick: isRomantic,
    isQuietNight: isRomantic || genres.includes('Drama'),
  };
}

/**
 * Parses a combined id e.g. "movie-12345" or "tv-67890" or "12345"
 */
export function parseTmdbId(compositeId: string): { type: 'movie' | 'tv'; rawId: number } {
  if (compositeId.startsWith('tv-')) {
    const rawId = parseInt(compositeId.replace('tv-', ''), 10);
    return { type: 'tv', rawId: isNaN(rawId) ? 0 : rawId };
  }
  if (compositeId.startsWith('movie-')) {
    const rawId = parseInt(compositeId.replace('movie-', ''), 10);
    return { type: 'movie', rawId: isNaN(rawId) ? 0 : rawId };
  }
  // If bare number, default to movie
  const num = parseInt(compositeId, 10);
  return { type: 'movie', rawId: isNaN(num) ? 0 : num };
}

