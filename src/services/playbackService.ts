import type { PlaybackProvider, PlaybackResult, PlaybackSource } from '../types/playback';
import { parseTmdbId } from './tmdbHelpers';
import { jellyfinProvider } from './providers/jellyfinProvider';
import { vidlinkProvider } from './providers/vidlinkProvider';
import { zoryvaProvider } from './providers/zoryvaProvider';
import { vidsrcProvider } from './providers/vidsrcProvider';
import { youtubeTrailerProvider } from './providers/youtubeTrailerProvider';
import { providerMetrics } from './providerMetrics';

export class PlaybackCoordinator {
  private providers: PlaybackProvider[] = [];

  constructor() {
    // Registered in priority order (lower number = higher priority)
    this.providers = [
      jellyfinProvider,
      vidlinkProvider,
      zoryvaProvider,
      vidsrcProvider,
      youtubeTrailerProvider,
    ].sort((a, b) => a.priority - b.priority);
  }

  public registerProvider(provider: PlaybackProvider): void {
    const existingIndex = this.providers.findIndex((p) => p.id === provider.id);
    if (existingIndex >= 0) {
      this.providers[existingIndex] = provider;
    } else {
      this.providers.push(provider);
    }
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  public setProviderOrder(providerIds: string[]): void {
    const orderMap = new Map(providerIds.map((id, index) => [id, index]));
    this.providers.sort((a, b) => {
      const orderA = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : a.priority;
      const orderB = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : b.priority;
      return orderA - orderB;
    });
  }

  public getProviders(): PlaybackProvider[] {
    return [...this.providers];
  }

  /**
   * Resolves available streams for a movie or TV show.
   * Full-length streams are resolved instantaneously without waiting for trailer API calls.
   * Trailers are fetched concurrently in background so stream startup is immediate.
   */
  public async loadPlaybackSession(
    movie: { id: string; title: string },
    season = 1,
    episode = 1
  ): Promise<PlaybackResult> {
    const { type: mediaType } = parseTmdbId(movie.id);

    // Filter eligible providers
    const activeStreamProviders = this.providers.filter((p) => {
      const supportsType = p.supportedTypes ? p.supportedTypes.includes(mediaType) : true;
      const isStream = p.kind === 'full_movie' || p.kind === 'full_episode';
      return isStream && p.isConfigured() && p.isEligible(movie) && supportsType;
    });

    const activeTrailerProviders = this.providers.filter((p) => {
      const supportsType = p.supportedTypes ? p.supportedTypes.includes(mediaType) : true;
      return p.kind === 'trailer_preview' && p.isConfigured() && p.isEligible(movie) && supportsType;
    });

    if (activeStreamProviders.length === 0 && activeTrailerProviders.length === 0) {
      return {
        status: 'unavailable',
        availableSources: [],
        trailerSources: [],
        message: 'No streaming providers are currently configured or eligible for this title.',
      };
    }

    // 1. Resolve full movie/episode streams immediately without waiting for trailer network requests
    const streamResults = await Promise.allSettled(
      activeStreamProviders.map((p) => p.getSources(movie, season, episode))
    );

    const fullSources: PlaybackSource[] = [];
    streamResults.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        res.value.forEach((src) => {
          if (src.kind === 'full_movie' || src.kind === 'full_episode') {
            fullSources.push({
              ...src,
              kind: mediaType === 'tv' ? ('full_episode' as const) : ('full_movie' as const),
            });
          }
        });
      }
    });

    // Rank streams using measured reliability and performance
    fullSources.sort((a, b) => {
      const relA = providerMetrics.getReliabilityScore(a.providerId);
      const relB = providerMetrics.getReliabilityScore(b.providerId);
      // If a provider has a significantly lower reliability score (< 0.5), demote it
      if (Math.abs(relA - relB) > 0.3) {
        return relB - relA;
      }

      // Check average latency if available
      const latA = providerMetrics.getAverageLatency(a.providerId) ?? 9999;
      const latB = providerMetrics.getAverageLatency(b.providerId) ?? 9999;
      if (latA !== 9999 && latB !== 9999 && Math.abs(latA - latB) > 400) {
        return latA - latB;
      }

      // Otherwise retain default priority order
      const provA = this.providers.find((p) => p.id === a.providerId);
      const provB = this.providers.find((p) => p.id === b.providerId);
      return (provA?.priority ?? 50) - (provB?.priority ?? 50);
    });

    // 2. Fetch trailers (resolve trailer providers if needed or allow background hydration)
    let trailerSources: PlaybackSource[] = [];
    if (activeTrailerProviders.length > 0) {
      // In dev/client mode, fetch trailers concurrently
      try {
        const trailerResults = await Promise.allSettled(
          activeTrailerProviders.map((p) => p.getSources(movie, season, episode))
        );
        trailerResults.forEach((res) => {
          if (res.status === 'fulfilled' && Array.isArray(res.value)) {
            trailerSources.push(...res.value);
          }
        });
      } catch {
        trailerSources = [];
      }
    }

    if (fullSources.length > 0) {
      return {
        status: 'ready',
        activeSource: fullSources[0],
        availableSources: fullSources,
        trailerSources,
      };
    }

    // No full movie stream found, but trailer/preview may be available
    return {
      status: 'unavailable',
      activeSource: undefined,
      availableSources: [],
      trailerSources,
      message:
        mediaType === 'tv'
          ? 'Full episode stream unavailable on configured providers.'
          : 'Full movie stream unavailable on configured providers.',
    };
  }

  /**
   * Helper to get the next eligible source without looping through previously failed sources
   */
  public getNextEligibleSource(
    sources: PlaybackSource[],
    currentSourceId: string,
    failedSourceIds: Set<string>
  ): PlaybackSource | null {
    if (!sources || sources.length === 0) return null;

    const unfailed = sources.filter((s) => !failedSourceIds.has(s.id));
    if (unfailed.length === 0) return null;

    const currentIndex = unfailed.findIndex((s) => s.id === currentSourceId);
    if (currentIndex >= 0 && currentIndex < unfailed.length - 1) {
      return unfailed[currentIndex + 1];
    }

    // Return the first unfailed source that isn't current
    const nextCandidate = unfailed.find((s) => s.id !== currentSourceId);
    return nextCandidate || unfailed[0] || null;
  }
}

export const playbackService = new PlaybackCoordinator();
