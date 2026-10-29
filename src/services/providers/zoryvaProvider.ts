import type { PlaybackProvider, PlaybackSource } from '../../types/playback';
import { parseTmdbId } from '../tmdbHelpers';

const DEFAULT_BASE_URL = 'https://zoryva.me';
const ALLOWED_HOSTS = ['zoryva.me', 'www.zoryva.me'];

export class ZoryvaProvider implements PlaybackProvider {
  public readonly id = 'zoryva-embed';
  public readonly name = 'Zoryva Cinema Stream';
  public readonly priority = 20; // Priority after local Jellyfin (10)
  public readonly supportedTypes: Array<'movie' | 'tv'> = ['movie', 'tv'];
  public readonly playbackType = 'embed';
  public readonly kind = 'full_movie';

  private get isEnabled(): boolean {
    const envVal = import.meta.env.VITE_ENABLE_ZORYVA;
    // Default enabled unless explicitly disabled via 'false'
    return envVal === undefined || envVal === 'true' || envVal === true;
  }

  private get baseUrl(): string {
    const raw = import.meta.env.VITE_ZORYVA_BASE_URL || DEFAULT_BASE_URL;
    return raw.replace(/\/+$/, '');
  }

  public isConfigured(): boolean {
    if (!this.isEnabled) return false;
    try {
      const url = new URL(this.baseUrl);
      // Ensure host is in allowed list or matches custom configured host
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
    const customHost = import.meta.env.VITE_ZORYVA_BASE_URL
      ? new URL(import.meta.env.VITE_ZORYVA_BASE_URL).hostname
      : null;

    const isAllowed = ALLOWED_HOSTS.includes(url.hostname) || (customHost && url.hostname === customHost);
    if (!isAllowed) {
      throw new Error(`Zoryva embed hostname rejected by security allowlist: ${url.hostname}`);
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
    const colorParam = '%23ff0a43'; // Mahi dark cherry accent

    let embedPath: string;
    if (type === 'tv') {
      embedPath = `/embed/tv/${rawId}/${season}/${episode}?color=${colorParam}&autoplay=true`;
    } else {
      embedPath = `/embed/movie/${rawId}?color=${colorParam}&autoplay=true`;
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
      title: type === 'tv' ? `Zoryva Stream (S${season}:E${episode})` : 'Zoryva HD Stream',
      badge: 'Server 2',
      quality: '1080p',
      season: type === 'tv' ? season : undefined,
      episode: type === 'tv' ? episode : undefined,
      notes: 'Third-party sandboxed multi-source player. Use Try Next Source if experiencing playback issues.',
    };

    return [source];
  }
}

export const zoryvaProvider = new ZoryvaProvider();

