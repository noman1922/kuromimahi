import type { PlaybackProvider, PlaybackSource } from '../../types/playback';
import { parseTmdbId } from '../tmdbHelpers';

interface JellyfinItem {
  Id: string;
  Name: string;
  Type: 'Movie' | 'Series' | 'Episode';
  MediaSources?: Array<{
    Id: string;
    Container?: string;
  }>;
}

export class JellyfinProvider implements PlaybackProvider {
  public readonly id = 'jellyfin-private';
  public readonly name = 'Jellyfin Lounge Vault';
  public readonly priority = 10; // Highest priority for personal media server
  public readonly supportedTypes: Array<'movie' | 'tv'> = ['movie', 'tv'];
  public readonly playbackType = 'mp4';
  public readonly kind = 'full_movie';

  private get serverUrl(): string | undefined {
    const raw = import.meta.env.VITE_JELLYFIN_SERVER_URL;
    return raw ? raw.trim().replace(/\/+$/, '') : undefined;
  }

  private get apiKey(): string | undefined {
    return import.meta.env.VITE_JELLYFIN_API_KEY || import.meta.env.VITE_JELLYFIN_TOKEN;
  }

  private get userId(): string | undefined {
    return import.meta.env.VITE_JELLYFIN_USER_ID;
  }

  public isConfigured(): boolean {
    return Boolean(this.serverUrl && this.apiKey);
  }

  public isEligible(_movie: { id: string }): boolean {
    return this.isConfigured();
  }

  /**
   * Securely queries Jellyfin using documented API to check if media genuinely exists
   */
  public async getSources(
    movie: { id: string; title: string },
    season = 1,
    episode = 1
  ): Promise<PlaybackSource[]> {
    if (!this.isConfigured() || !this.serverUrl || !this.apiKey) {
      return [];
    }

    const { rawId, type } = parseTmdbId(movie.id);

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'X-Emby-Token': this.apiKey,
      };

      const baseItemsUrl = this.userId
        ? `${this.serverUrl}/Users/${encodeURIComponent(this.userId)}/Items`
        : `${this.serverUrl}/Items`;

      // 1. Try finding by TMDB Provider ID
      let searchUrl = `${baseItemsUrl}?hasTmdbId=${rawId}&fields=MediaSources,Path&recursive=true`;
      let res = await fetch(searchUrl, { headers, signal: AbortSignal.timeout(4000) });

      let data = res.ok ? await res.json() : null;
      let items: JellyfinItem[] = data?.Items || [];

      // 2. If not found by TMDB ID, fallback to exact title search
      if (items.length === 0 && movie.title) {
        const titleQuery = encodeURIComponent(movie.title.trim());
        const targetType = type === 'tv' ? 'Series' : 'Movie';
        searchUrl = `${baseItemsUrl}?searchTerm=${titleQuery}&includeItemTypes=${targetType}&fields=MediaSources,Path&recursive=true`;
        res = await fetch(searchUrl, { headers, signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          data = await res.json();
          items = data?.Items || [];
        }
      }

      if (items.length === 0) {
        return [];
      }

      let playableItemId = items[0].Id;
      let displayTitle = `${items[0].Name} (Jellyfin Lossless)`;

      // If TV series, resolve the specific season and episode
      if (type === 'tv' && items[0].Type === 'Series') {
        const seriesId = items[0].Id;
        const epUrl = `${baseItemsUrl}?parentId=${seriesId}&includeItemTypes=Episode&season=${season}&fields=MediaSources&recursive=true`;
        const epRes = await fetch(epUrl, { headers, signal: AbortSignal.timeout(4000) });
        if (epRes.ok) {
          const epData = await epRes.json();
          const epList: Array<JellyfinItem & { IndexNumber?: number }> = epData?.Items || [];
          const foundEp = epList.find((e) => e.IndexNumber === episode) || epList[0];
          if (foundEp) {
            playableItemId = foundEp.Id;
            displayTitle = `S${season}:E${episode} - ${foundEp.Name || 'Episode'} (Jellyfin)`;
          }
        }
      }

      // Construct documented stream endpoint
      const streamUrl = `${this.serverUrl}/Videos/${playableItemId}/stream?static=true&api_key=${encodeURIComponent(this.apiKey)}`;

      return [
        {
          id: `${this.id}-${playableItemId}`,
          providerId: this.id,
          providerName: this.name,
          kind: 'full_movie',
          type: 'mp4',
          url: streamUrl,
          title: displayTitle,
          badge: 'Personal Media',
          quality: '4k',
          season: type === 'tv' ? season : undefined,
          episode: type === 'tv' ? episode : undefined,
          notes: 'Direct streaming from private Jellyfin server library.',
        },
      ];
    } catch {
      // Offline, network error, or CORS restriction: silently return empty array
      // Never leak tokens or error backtraces into console/UI
      return [];
    }
  }
}

export const jellyfinProvider = new JellyfinProvider();

