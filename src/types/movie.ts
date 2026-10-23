export type ContentType = 'movie' | 'series' | 'anime';

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  poster: string;
  backdrop: string;
  description: string;
  releaseYear: number;
  genres: string[];
  contentType: ContentType;
  language: string;
  rating?: number;
  duration?: string;
  director?: string;
  cast?: string[];
  trailerUrl?: string;
  playbackProviderId?: string;
  isTrending?: boolean;
  isContinueWatching?: boolean;
  progress?: number; // 0-100 percentage
  lastEpisode?: string;
  isKoreanDrama?: boolean;
  isAnime?: boolean;
  isRomanticPick?: boolean;
  isQuietNight?: boolean;
  isRecentlyAdded?: boolean;
  curatorNote?: string;
}

export type FilterGenre = 'All' | 'Romance' | 'Drama' | 'Fantasy' | 'Animation' | 'Mystery' | 'Sci-Fi' | 'Slice of Life' | 'Comedy';

