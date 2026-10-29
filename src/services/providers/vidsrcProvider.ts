import type { PlaybackProvider, PlaybackSource } from '../../types/playback';
import { parseTmdbId } from '../tmdbHelpers';

const DEFAULT_BASE_URL = 'https://vidsrc.to';
const ALLOWED_HOSTS = ['vidsrc.to', 'www.vidsrc.to', 'vidsrc.xyz', 'www.vidsrc.xyz'];

export class VidSrcProvider implements PlaybackProvider {
  public readonly id = 'vidsrc-embed';
  public readonly name = 'VidSrc Cinema Stream';
  public readonly priority = 30; // Priority after Jellyfin (10) and Zoryva (20)
  public readonly supportedTypes: Array<'movie' | 'tv'> = ['movie', 'tv'];
  public readonly playbackType = 'embed';
  public readonly kind = 'full_movie';

  private get isEnabled(): boolean {
    const envVal = import.meta.env.VITE_ENABLE_VIDSRC;
    return envVal === undefined || envVal === 'true' || envVal === true;
  }

  private get baseUrl(): string {
    const raw = import.meta.env.VITE_VIDSRC_BASE_URL || DEFAULT_BASE_URL;
    return raw.replace(/\/+$/, '');
  }

  public isConfigured(): boolean {
    if (!this.isEnabled) return false;
    try {
      const url = new URL(this.baseUrl);
      return Boolean(url.protocol.startsWith('http') && url.hostname);
    } catch {
      return false;
    }
  }

  public isEligible(movie: { id: string }): boolean {
    if (!this.isConfigured()) return false;
    const { rawId } = parseTmdbId(movie.id);
    return Boolean(rawId && rawId > 0);
  }

  private validateUrl(urlStr: string): string {
    const url = new URL(urlStr);
    const customHost = import.meta.env.VITE_VIDSRC_BASE_URL
      ? new URL(import.meta.env.VITE_VIDSRC_BASE_URL).hostname
      : null;

    const isAllowed = ALLOWED_HOSTS.includes(url.hostname) || (customHost && url.hostname === customHost);
    if (!isAllowed) {
      throw new Error(`VidSrc embed hostname rejected by security allowlist: ${url.hostname}`);
    }
    return url.toString();
  }

  public async getSources(
    movie: { id: string; title: string },
    season = 1,
    episode = 1
  ): Promise<PlaybackSource[]> {
    if (!this.isEligible(movie)) {
      return [];
    }

    const { type, rawId } = parseTmdbId(movie.id);

    let embedPath: string;
    if (type === 'tv') {
      embedPath = `/embed/tv/${rawId}/${season}/${episode}?autoplay=1`;
    } else {
      embedPath = `/embed/movie/${rawId}?autoplay=1`;
    }

    const fullUrl = `${this.baseUrl}${embedPath}`;
    const validatedUrl = this.validateUrl(fullUrl);

    const source: PlaybackSource = {
      id: `${this.id}-${type}-${rawId}${type === 'tv' ? `-s${season}e${episode}` : ''}`,
      providerId: this.id,
      providerName: this.name,
      kind: 'full_movie',
      type: 'embed',
      url: validatedUrl,
      title: type === 'tv' ? `VidSrc Stream (S${season}:E${episode})` : 'VidSrc Stream',
      badge: 'Server 3',
      quality: '1080p',
      season: type === 'tv' ? season : undefined,
      episode: type === 'tv' ? episode : undefined,
      notes: 'Third-party sandboxed multi-source player. Use Try Next Source if experiencing playback issues.',
    };

    return [source];
  }
}

export const vidsrcProvider = new VidSrcProvider();
