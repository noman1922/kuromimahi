export interface TmdbMovieItem {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  original_language: string;
  popularity: number;
  adult?: boolean;
}

export interface TmdbTvItem {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  original_language: string;
  popularity: number;
  origin_country?: string[];
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
  order?: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string | null;
}

export interface TmdbCredits {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbVideoItem {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface TmdbMovieDetails extends Omit<TmdbMovieItem, 'genre_ids'> {
  genres: TmdbGenre[];
  runtime?: number;
  tagline?: string;
  status?: string;
  credits?: TmdbCredits;
  recommendations?: TmdbPaginatedResponse<TmdbMovieItem>;
  similar?: TmdbPaginatedResponse<TmdbMovieItem>;
  videos?: {
    results: TmdbVideoItem[];
  };
}

export interface TmdbTvDetails extends Omit<TmdbTvItem, 'genre_ids'> {
  genres: TmdbGenre[];
  episode_run_time?: number[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  tagline?: string;
  status?: string;
  credits?: TmdbCredits;
  recommendations?: TmdbPaginatedResponse<TmdbTvItem>;
  similar?: TmdbPaginatedResponse<TmdbTvItem>;
  videos?: {
    results: TmdbVideoItem[];
  };
}

export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

