import type { Movie } from '../types/movie';
import type {
  TmdbMovieItem,
  TmdbTvItem,
  TmdbMovieDetails,
  TmdbTvDetails,
  TmdbPaginatedResponse,
} from '../types/tmdb';
import {
  mapTmdbMovieToMovie,
  mapTmdbTvToMovie,
  mapTmdbMovieDetailsToMovie,
  mapTmdbTvDetailsToMovie,
  parseTmdbId,
} from './tmdbHelpers';
import { AUTHENTIC_TMDB_FALLBACK } from '../data/authenticTmdbFallback';

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
    
    // In dev mode without client credentials, route via Vite proxy /api/tmdb
    // Otherwise route direct to TMDB API
    const baseUrl = (!hasAuthToken && !hasApiKey && import.meta.env.DEV)
      ? this.proxyUrl
      : this.baseDirectUrl;

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
      'Accept': 'application/json',
    };

    if (hasAuthToken) {
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
    if (!this.isConfigured()) {
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.isTrending && m.contentType === 'movie');
    }
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbMovieItem>>('/trending/movie/week', { page });
      return res.results.map(mapTmdbMovieToMovie);
    } catch (err) {
      console.warn('TMDB getTrendingMovies error, using fallback:', err);
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.isTrending && m.contentType === 'movie');
    }
  }

  /**
   * 2. Popular Movies (/movie/popular)
   */
  public async getPopularMovies(page = 1): Promise<Movie[]> {
    if (!this.isConfigured()) {
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.contentType === 'movie');
    }
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbMovieItem>>('/movie/popular', { page });
      return res.results.map(mapTmdbMovieToMovie);
    } catch (err) {
      console.warn('TMDB getPopularMovies error, using fallback:', err);
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.contentType === 'movie');
    }
  }

  /**
   * 3. Now Playing Movies (/movie/now_playing)
   */
  public async getNowPlayingMovies(page = 1): Promise<Movie[]> {
    if (!this.isConfigured()) {
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.contentType === 'movie').slice(0, 8);
    }
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbMovieItem>>('/movie/now_playing', { page });
      return res.results.map(mapTmdbMovieToMovie);
    } catch (err) {
      console.warn('TMDB getNowPlayingMovies error, using fallback:', err);
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.contentType === 'movie').slice(0, 8);
    }
  }

  /**
   * 4. Top Rated Movies (/movie/top_rated)
   */
  public async getTopRatedMovies(page = 1): Promise<Movie[]> {
    if (!this.isConfigured()) {
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => (m.rating || 0) >= 8.0);
    }
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbMovieItem>>('/movie/top_rated', { page });
      return res.results.map(mapTmdbMovieToMovie);
    } catch (err) {
      console.warn('TMDB getTopRatedMovies error, using fallback:', err);
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => (m.rating || 0) >= 8.0);
    }
  }

  /**
   * 5. Popular TV Series (/tv/popular)
   */
  public async getPopularTv(page = 1): Promise<Movie[]> {
    if (!this.isConfigured()) {
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.contentType === 'series');
    }
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbTvItem>>('/tv/popular', { page });
      return res.results.map(mapTmdbTvToMovie);
    } catch (err) {
      console.warn('TMDB getPopularTv error, using fallback:', err);
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.contentType === 'series');
    }
  }

  /**
   * 6. Trending TV Series (/trending/tv/week)
   */
  public async getTrendingTv(page = 1): Promise<Movie[]> {
    if (!this.isConfigured()) {
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.contentType === 'series');
    }
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbTvItem>>('/trending/tv/week', { page });
      return res.results.map(mapTmdbTvToMovie);
    } catch (err) {
      console.warn('TMDB getTrendingTv error, using fallback:', err);
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.contentType === 'series');
    }
  }

  /**
   * 7. Korean Dramas (/discover/tv with language=ko and genre=18)
   */
  public async getKoreanDramas(page = 1): Promise<Movie[]> {
    if (!this.isConfigured()) {
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.isKoreanDrama);
    }
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbTvItem>>('/discover/tv', {
        page,
        with_original_language: 'ko',
        with_genres: '18', // Drama
        sort_by: 'popularity.desc',
      });
      return res.results.map((item) => {
        const m = mapTmdbTvToMovie(item);
        m.isKoreanDrama = true;
        return m;
      });
    } catch (err) {
      console.warn('TMDB getKoreanDramas error, using fallback:', err);
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.isKoreanDrama);
    }
  }

  /**
   * 8. Anime Discovery (/discover/tv with genre=16 and language=ja)
   */
  public async getAnime(page = 1): Promise<Movie[]> {
    if (!this.isConfigured()) {
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.isAnime);
    }
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbTvItem>>('/discover/tv', {
        page,
        with_genres: '16', // Animation
        with_original_language: 'ja',
        sort_by: 'popularity.desc',
      });
      return res.results.map((item) => {
        const m = mapTmdbTvToMovie(item);
        m.isAnime = true;
        m.contentType = 'anime';
        return m;
      });
    } catch (err) {
      console.warn('TMDB getAnime error, using fallback:', err);
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.isAnime);
    }
  }

  /**
   * 9. Romantic Picks (/discover/movie with genre=10749 Romance)
   */
  public async getRomanticPicks(page = 1): Promise<Movie[]> {
    if (!this.isConfigured()) {
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.isRomanticPick);
    }
    try {
      const res = await this.request<TmdbPaginatedResponse<TmdbMovieItem>>('/discover/movie', {
        page,
        with_genres: '10749', // Romance
        sort_by: 'popularity.desc',
      });
      return res.results.map((item) => {
        const m = mapTmdbMovieToMovie(item);
        m.isRomanticPick = true;
        return m;
      });
    } catch (err) {
      console.warn('TMDB getRomanticPicks error, using fallback:', err);
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.isRomanticPick);
    }
  }

  /**
   * 10. Multi Search (/search/movie & /search/tv in parallel)
   */
  public async searchMulti(query: string, page = 1): Promise<Movie[]> {
    if (!query.trim()) return [];

    if (!this.isConfigured()) {
      const lower = query.toLowerCase().trim();
      return AUTHENTIC_TMDB_FALLBACK.filter(
        (m) =>
          m.title.toLowerCase().includes(lower) ||
          (m.originalTitle && m.originalTitle.toLowerCase().includes(lower)) ||
          m.description.toLowerCase().includes(lower) ||
          m.genres.some((g) => g.toLowerCase().includes(lower))
      );
    }

    try {
      const [moviesRes, tvRes] = await Promise.allSettled([
        this.request<TmdbPaginatedResponse<TmdbMovieItem>>('/search/movie', { query, page }),
        this.request<TmdbPaginatedResponse<TmdbTvItem>>('/search/tv', { query, page }),
      ]);

      const movies: Movie[] =
        moviesRes.status === 'fulfilled' ? moviesRes.value.results.map(mapTmdbMovieToMovie) : [];
      const tvShows: Movie[] =
        tvRes.status === 'fulfilled' ? tvRes.value.results.map(mapTmdbTvToMovie) : [];

      // Interleave results by popularity
      return [...movies, ...tvShows].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } catch (err) {
      console.warn('TMDB searchMulti error, using fallback:', err);
      const lower = query.toLowerCase().trim();
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.title.toLowerCase().includes(lower));
    }
  }

  /**
   * 11. Movie or TV Details with Credits & Recommendations
   */
  public async getDetailsById(id: string): Promise<Movie | undefined> {
    const { type, rawId } = parseTmdbId(id);

    // If ID is not a recognized format or rawId is 0, check fallback list
    if (!rawId) {
      return AUTHENTIC_TMDB_FALLBACK.find((m) => m.id === id);
    }

    if (!this.isConfigured()) {
      return AUTHENTIC_TMDB_FALLBACK.find((m) => m.id === id || m.id.endsWith(`-${rawId}`));
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
      return AUTHENTIC_TMDB_FALLBACK.find((m) => m.id === id || m.id.endsWith(`-${rawId}`));
    }
  }

  /**
   * 12. Recommendations / Related Titles
   */
  public async getRelated(movie: Movie, limit = 6): Promise<Movie[]> {
    const { type, rawId } = parseTmdbId(movie.id);

    if (!rawId || !this.isConfigured()) {
      return AUTHENTIC_TMDB_FALLBACK.filter(
        (m) =>
          m.id !== movie.id &&
          (m.contentType === movie.contentType || m.genres.some((g) => movie.genres.includes(g)))
      ).slice(0, limit);
    }

    try {
      const endpoint = type === 'tv' ? `/tv/${rawId}/recommendations` : `/movie/${rawId}/recommendations`;
      const res = await this.request<TmdbPaginatedResponse<any>>(endpoint);
      const items = res.results.slice(0, limit);
      return type === 'tv' ? items.map(mapTmdbTvToMovie) : items.map(mapTmdbMovieToMovie);
    } catch (err) {
      console.warn('TMDB getRelated error, fallback to genre match:', err);
      return AUTHENTIC_TMDB_FALLBACK.filter((m) => m.id !== movie.id).slice(0, limit);
    }
  }
}

export const tmdb = new TmdbApiClient();
