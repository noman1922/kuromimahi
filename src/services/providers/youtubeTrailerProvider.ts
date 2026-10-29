import type { PlaybackProvider, PlaybackSource } from '../../types/playback';
import { tmdb } from '../tmdb';
import { parseTmdbId } from '../tmdbHelpers';

export class YoutubeTrailerProvider implements PlaybackProvider {
  public readonly id = 'tmdb-youtube-trailer';
  public readonly name = 'Official Trailer / Preview';
  public readonly priority = 99; // Fallback preview priority
  public readonly supportedTypes: Array<'movie' | 'tv'> = ['movie', 'tv'];
  public readonly playbackType = 'youtube';
  public readonly kind = 'trailer_preview';

  public isConfigured(): boolean {
    return true; // Uses TMDB videos which are configured with TMDB credentials
  }

  public isEligible(movie: { id: string }): boolean {
    const { rawId } = parseTmdbId(movie.id);
    return Boolean(rawId && rawId > 0);
  }

  public async getSources(
    movie: { id: string; title: string }
  ): Promise<PlaybackSource[]> {
    if (!this.isEligible(movie)) {
      return [];
    }

    try {
      const videos = await tmdb.getVideos(movie.id);
      if (!videos || videos.length === 0) {
        return [];
      }

      // Filter to YouTube videos only
      const ytVideos = videos.filter((v) => v.site === 'YouTube' && Boolean(v.key));
      if (ytVideos.length === 0) {
        return [];
      }

      // Sort by preference: official trailer > trailer > teaser > other
      const sorted = [...ytVideos].sort((a, b) => {
        const score = (item: typeof a) => {
          let s = 0;
          if (item.type === 'Trailer') s += 10;
          if (item.type === 'Teaser') s += 5;
          if (item.official) s += 20;
          return s;
        };
        return score(b) - score(a);
      });

      return sorted.slice(0, 3).map((v, index) => {
        // Safe nocookie embed
        const url = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.key)}?autoplay=1&rel=0&modestbranding=1`;
        return {
          id: `${this.id}-${v.key}`,
          providerId: this.id,
          providerName: this.name,
          kind: 'trailer_preview' as const,
          type: 'youtube' as const,
          url,
          title: v.name || (index === 0 ? 'Official Trailer' : `Trailer Clip #${index + 1}`),
          badge: v.type || 'Trailer',
          quality: '1080p',
          notes: 'Official studio trailer / promotional preview. Not a full-length movie stream.',
        };
      });
    } catch (err) {
      console.warn('Error retrieving YouTube trailer sources:', err);
      return [];
    }
  }
}

export const youtubeTrailerProvider = new YoutubeTrailerProvider();

