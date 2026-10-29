export type SourceType = 'mp4' | 'hls' | 'dash' | 'embed' | 'youtube';

export type PlaybackKind = 'full_movie' | 'full_episode' | 'trailer_preview';

export type MediaType = 'movie' | 'tv';

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  src: string;
  default?: boolean;
}

export interface PlaybackSource {
  id: string;
  providerId: string;
  providerName: string;
  kind: PlaybackKind;
  type: SourceType;
  url: string;
  title: string;
  badge?: string;
  quality?: '1080p' | '720p' | '4k' | 'auto';
  subtitles?: SubtitleTrack[];
  drmProtected?: boolean;
  notes?: string;
  season?: number;
  episode?: number;
}

export type PlaybackStatus = 'idle' | 'loading' | 'ready' | 'error' | 'unavailable';

export interface PlaybackResult {
  status: PlaybackStatus;
  activeSource?: PlaybackSource;
  availableSources: PlaybackSource[];
  trailerSources: PlaybackSource[];
  message?: string;
  error?: string;
}

export interface PlaybackProvider {
  id: string;
  name: string;
  priority: number;
  supportedTypes: MediaType[];
  playbackType: SourceType;
  kind: PlaybackKind;
  /**
   * Check whether this provider has required configuration (e.g. env vars or credentials)
   */
  isConfigured(): boolean;
  /**
   * Check whether this provider is eligible for the given media type and ID
   */
  isEligible(movie: { id: string }): boolean;
  /**
   * Resolves playable sources for the title, season, and episode
   */
  getSources(
    movie: { id: string; title: string },
    season?: number,
    episode?: number
  ): Promise<PlaybackSource[]>;
}
