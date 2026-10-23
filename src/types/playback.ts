export type SourceType = 'mp4' | 'hls' | 'dash' | 'embed';

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  src: string;
  default?: boolean;
}

export interface PlaybackSource {
  url?: string;
  type?: SourceType;
  quality?: '1080p' | '720p' | '4k' | 'auto';
  subtitles?: SubtitleTrack[];
  drmProtected?: boolean;
}

export type PlaybackStatus = 'ready' | 'unavailable' | 'needs_authorization' | 'geoblocked';

export interface PlaybackResult {
  status: PlaybackStatus;
  source?: PlaybackSource;
  message: string;
  providerName: string;
}

export interface PlaybackProvider {
  id: string;
  name: string;
  getPlaybackSource(movieId: string): Promise<PlaybackResult>;
}

