import type { PlaybackProvider, PlaybackSource } from '../../types/playback';
import { parseTmdbId } from '../tmdbHelpers';

const DEFAULT_BASE_URL = 'https://vidlink.pro';
const ALLOWED_HOSTS = ['vidlink.pro', 'www.vidlink.pro'];

export class VidLinkProvider implements PlaybackProvider {
  public readonly id = 'vidlink-embed';
  public readonly name = 'VidLink Cinema Stream';
  public readonly priority = 10; // Top priority for fast, ad-light zero-cost streaming
  public readonly supportedTypes: Array<'movie' | 'tv'> = ['movie', 'tv'];
  public readonly playbackType = 'embed';
  public readonly kind = 'full_movie';

  private get isEnabled(): boolean {
    const envVal = import.meta.env.VITE_ENABLE_VIDLINK;
    return envVal === undefined || envVal === 'true' || envVal === true;
  }

  private get baseUrl(): string {
    const raw = import.meta.env.VITE_VIDLINK_BASE_URL || DEFAULT_BASE_URL;
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
    const customHost = import.meta.env.VITE_VIDLINK_BASE_URL
      ? new URL(import.meta.env.VITE_VIDLINK_BASE_URL).hostname
      : null;

    const isAllowed = ALLOWED_HOSTS.includes(url.hostname) || (customHost && url.hostname === customHost);
    if (!isAllowed) {
      throw new Error(`VidLink embed hostname rejected by security allowlist: ${url.hostname}`);
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

    // Cute-goth theme color query params + auto-initialization for faster playback start
    const colorParams = 'primaryColor=c86f91&secondaryColor=351726&iconColor=ff0a43&autoplay=true';

    let embedPath: string;
    if (type === 'tv') {
      embedPath = `/tv/${rawId}/${season}/${episode}?${colorParams}`;
    } else {
      embedPath = `/movie/${rawId}?${colorParams}`;
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
      title: type === 'tv' ? `VidLink Stream (S${season}:E${episode})` : 'VidLink HD Stream',
      badge: 'Server 1',
      quality: '1080p',
      season: type === 'tv' ? season : undefined,
      episode: type === 'tv' ? episode : undefined,
      notes: 'High-speed authorized multi-source player with cute-goth custom styling.',
    };

    return [source];
  }
}

export const vidlinkProvider = new VidLinkProvider();

