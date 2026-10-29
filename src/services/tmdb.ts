import type { Movie } from '../types/movie';
import type {
  TmdbMovieItem,
  TmdbTvItem,
  TmdbMovieDetails,
  TmdbTvDetails,
  TmdbPaginatedResponse,
  TmdbVideoItem,
} from '../types/tmdb';
import {
  mapTmdbMovieToMovie,
  mapTmdbTvToMovie,
  mapTmdbMovieDetailsToMovie,
  mapTmdbTvDetailsToMovie,
  parseTmdbId,
} from './tmdbHelpers';

// Cache configuration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
const cache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

// TMDB API Client
class TmdbApiClient {
  private baseDirectUrl = 'https://api.themoviedb.org/3';
  private proxyUrl = '/api/tmdb';

  private get apiKey(): string | undefined {
    return import.meta.env.VITE_TMDB_API_KEY;
  }

  private get accessToken(): string | undefined {
    return import.meta.env.VITE_TMDB_ACCESS_TOKEN;
  }

  public isConfigured(): boolean {
    return Boolean(this.accessToken || this.apiKey) || import.meta.env.DEV;
  }

  /**
   * Internal fetcher with caching, deduplication, and auth headers
   */
  private async request<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
    const urlParams = new URLSearchParams();

    // Append custom query params
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        urlParams.append(key, String(val));
      }
    });

    const hasAuthToken = Boolean(this.accessToken);
    const hasApiKey = Boolean(this.apiKey);

    // If using direct API key without access token, append api_key param
    if (!hasAuthToken && hasApiKey) {
      urlParams.append('api_key', this.apiKey as string);
    }

    const queryString = urlParams.toString();
    const endpointWithSlash = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // In browser dev mode, route via Vite proxy /api/tmdb which securely attaches credentials
    // When running in production or node/test environments, route directly to TMDB API
    const isBrowser = typeof window !== 'undefined';
    const baseUrl = import.meta.env.DEV && isBrowser ? this.proxyUrl : this.baseDirectUrl;

    const finalUrl = `${baseUrl}${endpointWithSlash}${queryString ? `?${queryString}` : ''}`;
    const cacheKey = finalUrl;

    // Check memory cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }

    // Check in-flight request to deduplicate simultaneous requests
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey) as Promise<T>;
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (hasAuthToken && !import.meta.env.DEV) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const fetchPromise = (async () => {
      try {
        const response = await fetch(finalUrl, { headers });

        if (!response.ok) {
          throw new Error(`TMDB HTTP error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        // Save to cache
        cache.set(cacheKey, { data, timestamp: Date.now() });
        return data as T;
      } finally {
        inFlightRequests.delete(cacheKey);
      }
    })();

    inFlightRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  /**
   * 1. Trending Movies (/trending/movie/week)
   */
  public async getTrendingMovies(page = 1): Promise<Movie[]> {
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbMovieItem>>('/trending/movie/week', { page });
      return res.results?.map(mapTmdbMovieToMovie) || [];
    } catch (err) {
      console.warn('TMDB getTrendingMovies error:', err);
      return [];
    }
  }

  /**
   * 2. Popular Movies (/movie/popular)
   */
  public async getPopularMovies(page = 1): Promise<Movie[]> {
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbMovieItem>>('/movie/popular', { page });
      return res.results?.map(mapTmdbMovieToMovie) || [];
    } catch (err) {
      console.warn('TMDB getPopularMovies error:', err);
      return [];
    }
  }

  /**
   * 3. Now Playing Movies (/movie/now_playing)
   */
  public async getNowPlayingMovies(page = 1): Promise<Movie[]> {
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbMovieItem>>('/movie/now_playing', { page });
      return res.results?.map(mapTmdbMovieToMovie) || [];
    } catch (err) {
      console.warn('TMDB getNowPlayingMovies error:', err);
      return [];
    }
  }

  /**
   * 4. Top Rated Movies (/movie/top_rated)
   */
  public async getTopRatedMovies(page = 1): Promise<Movie[]> {
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbMovieItem>>('/movie/top_rated', { page });
      return res.results?.map(mapTmdbMovieToMovie) || [];
    } catch (err) {
      console.warn('TMDB getTopRatedMovies error:', err);
      return [];
    }
  }

  /**
   * 5. Popular TV Series (/tv/popular)
   */
  public async getPopularTv(page = 1): Promise<Movie[]> {
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbTvItem>>('/tv/popular', { page });
      return res.results?.map(mapTmdbTvToMovie) || [];
    } catch (err) {
      console.warn('TMDB getPopularTv error:', err);
      return [];
    }
  }

  /**
   * 6. Trending TV Series (/trending/tv/week)
   */
  public async getTrendingTv(page = 1): Promise<Movie[]> {
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbTvItem>>('/trending/tv/week', { page });
      return res.results?.map(mapTmdbTvToMovie) || [];
    } catch (err) {
      console.warn('TMDB getTrendingTv error:', err);
      return [];
    }
  }

  /**
   * 7. Korean Dramas (/discover/tv with language=ko and genre=18)
   */
  public async getKoreanDramas(page = 1): Promise<Movie[]> {
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbTvItem>>('/discover/tv', {
        page,
        with_original_language: 'ko',
        with_genres: '18', // Drama
        sort_by: 'popularity.desc',
      });
      return (
        res.results?.map((item) => {
          const m = mapTmdbTvToMovie(item);
          m.isKoreanDrama = true;
          return m;
        }) || []
      );
    } catch (err) {
      console.warn('TMDB getKoreanDramas error:', err);
      return [];
    }
  }

  /**
   * 8. Anime Discovery (/discover/tv with genre=16 and language=ja)
   */
  public async getAnime(page = 1): Promise<Movie[]> {
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbTvItem>>('/discover/tv', {
        page,
        with_genres: '16', // Animation
        with_original_language: 'ja',
        sort_by: 'popularity.desc',
      });
      return (
        res.results?.map((item) => {
          const m = mapTmdbTvToMovie(item);
          m.isAnime = true;
          m.contentType = 'anime';
          return m;
        }) || []
      );
    } catch (err) {
      console.warn('TMDB getAnime error:', err);
      return [];
    }
  }

  /**
   * 9. Romantic Picks (/discover/movie with genre=10749 Romance)
   */
  public async getRomanticPicks(page = 1): Promise<Movie[]> {
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbMovieItem>>('/discover/movie', {
        page,
        with_genres: '10749', // Romance
        sort_by: 'popularity.desc',
      });
      return (
        res.results?.map((item) => {
          const m = mapTmdbMovieToMovie(item);
          m.isRomanticPick = true;
          return m;
        }) || []
      );
    } catch (err) {
      console.warn('TMDB getRomanticPicks error:', err);
      return [];
    }
  }

  /**
   * 10. Multi Search (/search/movie & /search/tv in parallel)
   */
  public async searchMulti(query: string, page = 1): Promise<Movie[]> {
    if (!query.trim()) return [];

    try {
      const [moviesRes, tvRes] = await Promise.allSettled([
        this.request<TmdbPaginatedResponse<TmdbMovieItem>>('/search/movie', { query, page }),
        this.request<TmdbPaginatedResponse<TmdbTvItem>>('/search/tv', { query, page }),
      ]);

      const movies: Movie[] =
        moviesRes.status === 'fulfilled' && moviesRes.value.results
          ? moviesRes.value.results.map(mapTmdbMovieToMovie)
          : [];
      const tvShows: Movie[] =
        tvRes.status === 'fulfilled' && tvRes.value.results
          ? tvRes.value.results.map(mapTmdbTvToMovie)
          : [];

      return [...movies, ...tvShows].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } catch (err) {
      console.warn('TMDB searchMulti error:', err);
      return [];
    }
  }

  /**
   * 11. Movie or TV Details with Credits & Recommendations
   */
  public async getDetailsById(id: string): Promise<Movie | undefined> {
    const { type, rawId } = parseTmdbId(id);

    if (!rawId) {
      return undefined;
    }

    try {
      if (type === 'tv') {
        const details = await this.request<TmdbTvDetails>(`/tv/${rawId}`, {
          append_to_response: 'credits,recommendations,similar',
        });
        return mapTmdbTvDetailsToMovie(details);
      } else {
        const details = await this.request<TmdbMovieDetails>(`/movie/${rawId}`, {
          append_to_response: 'credits,recommendations,similar',
        });
        return mapTmdbMovieDetailsToMovie(details);
      }
    } catch (err) {
      console.warn(`TMDB getDetailsById(${id}) error:`, err);
      return undefined;
    }
  }

  /**
   * 12. Recommendations / Related Titles
   */
  public async getRelated(movie: Movie, limit = 6): Promise<Movie[]> {
    const { type, rawId } = parseTmdbId(movie.id);

    if (!rawId) {
      return [];
    }

    try {
      const endpoint = type === 'tv' ? `/tv/${rawId}/recommendations` : `/movie/${rawId}/recommendations`;
      const res = await this.request<TmdbPaginatedResponse<any>>(endpoint);
      const items = res.results?.slice(0, limit) || [];
      return type === 'tv' ? items.map(mapTmdbTvToMovie) : items.map(mapTmdbMovieToMovie);
    } catch (err) {
      console.warn('TMDB getRelated error:', err);
      return [];
    }
  }

  /**
   * 13. Official Videos (Trailers & Teasers)
   */
  public async getVideos(id: string): Promise<TmdbVideoItem[]> {
    const { type, rawId } = parseTmdbId(id);
    if (!rawId) return [];

    try {
      const endpoint = type === 'tv' ? `/tv/${rawId}/videos` : `/movie/${rawId}/videos`;
      const res = await this.request<{ id: number; results: TmdbVideoItem[] }>(endpoint);
      return res.results || [];
    } catch (err) {
      console.warn(`TMDB getVideos(${id}) error:`, err);
      return [];
    }
  }
}

export const tmdb = new TmdbApiClient();
