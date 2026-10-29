import { describe, it, expect, vi } from 'vitest';
import { VidLinkProvider } from '../vidlinkProvider';
import { ZoryvaProvider } from '../zoryvaProvider';
import { VidSrcProvider } from '../vidsrcProvider';
import { YoutubeTrailerProvider } from '../youtubeTrailerProvider';
import { JellyfinProvider } from '../jellyfinProvider';
import { PlaybackCoordinator } from '../../playbackService';
import type { PlaybackSource } from '../../../types/playback';
import { tmdb } from '../../tmdb';

describe('VidLinkProvider', () => {
  it('correctly generates sandboxed movie embed URL with TMDB ID and cute-goth theme', async () => {
    const provider = new VidLinkProvider();
    const movie = { id: 'movie-550', title: 'Fight Club' };

    expect(provider.isConfigured()).toBe(true);
    expect(provider.isEligible(movie)).toBe(true);

    const sources = await provider.getSources(movie);
    expect(sources).toHaveLength(1);
    expect(sources[0].kind).toBe('full_movie');
    expect(sources[0].type).toBe('embed');
    expect(sources[0].url).toContain('https://vidlink.pro/movie/550?primaryColor=c86f91');
    expect(sources[0].badge).toBe('Server 1');
  });

  it('correctly generates TV series and Anime episode embed URL', async () => {
    const provider = new VidLinkProvider();
    const anime = { id: 'tv-37854', title: 'One Piece' };

    const sources = await provider.getSources(anime, 1, 1);
    expect(sources).toHaveLength(1);
    expect(sources[0].kind).toBe('full_movie');
    expect(sources[0].url).toContain('https://vidlink.pro/tv/37854/1/1?primaryColor=c86f91');
    expect(sources[0].season).toBe(1);
    expect(sources[0].episode).toBe(1);
  });
});

describe('ZoryvaProvider', () => {
  it('correctly generates sandboxed movie embed URL with TMDB ID', async () => {
    const provider = new ZoryvaProvider();
    const movie = { id: 'movie-550', title: 'Fight Club' };

    expect(provider.isConfigured()).toBe(true);
    expect(provider.isEligible(movie)).toBe(true);

    const sources = await provider.getSources(movie);
    expect(sources).toHaveLength(1);
    expect(sources[0].kind).toBe('full_movie');
    expect(sources[0].type).toBe('embed');
    expect(sources[0].url).toContain('https://zoryva.me/embed/movie/550?color=');
  });

  it('correctly generates TV series embed URL with season and episode numbers', async () => {
    const provider = new ZoryvaProvider();
    const series = { id: 'tv-68814', title: 'Westworld' };

    const sources = await provider.getSources(series, 2, 4);
    expect(sources).toHaveLength(1);
    expect(sources[0].kind).toBe('full_movie');
    expect(sources[0].url).toBe('https://zoryva.me/embed/tv/68814/2/4?color=%23ff0a43&autoplay=true');
    expect(sources[0].season).toBe(2);
    expect(sources[0].episode).toBe(4);
  });

  it('returns empty array when movie id is invalid or has no raw ID', async () => {
    const provider = new ZoryvaProvider();
    const invalid = { id: 'invalid-id', title: 'Invalid' };
    expect(provider.isEligible(invalid)).toBe(false);
    const sources = await provider.getSources(invalid);
    expect(sources).toEqual([]);
  });
});

describe('VidSrcProvider', () => {
  it('correctly constructs movie embed URL', async () => {
    const provider = new VidSrcProvider();
    const movie = { id: 'movie-550', title: 'Fight Club' };

    expect(provider.isConfigured()).toBe(true);
    expect(provider.isEligible(movie)).toBe(true);

    const sources = await provider.getSources(movie);
    expect(sources).toHaveLength(1);
    expect(sources[0].kind).toBe('full_movie');
    expect(sources[0].type).toBe('embed');
    expect(sources[0].url).toBe('https://vidsrc.to/embed/movie/550?autoplay=1');
    expect(sources[0].badge).toBe('Server 3');
  });

  it('correctly constructs TV episode embed URL', async () => {
    const provider = new VidSrcProvider();
    const series = { id: 'tv-68814', title: 'Westworld' };

    const sources = await provider.getSources(series, 3, 7);
    expect(sources).toHaveLength(1);
    expect(sources[0].url).toBe('https://vidsrc.to/embed/tv/68814/3/7?autoplay=1');
    expect(sources[0].season).toBe(3);
    expect(sources[0].episode).toBe(7);
  });
});

describe('YoutubeTrailerProvider', () => {
  it('marks all returned sources strictly as trailer_preview and never full_movie', async () => {
    vi.spyOn(tmdb, 'getVideos').mockResolvedValueOnce([
      {
        id: '1',
        key: 'dfeUzm6KF4g',
        name: 'Official 20th Anniversary Trailer',
        site: 'YouTube',
        type: 'Trailer',
        official: true,
      },
    ]);

    const provider = new YoutubeTrailerProvider();
    const movie = { id: 'movie-550', title: 'Fight Club' };

    expect(provider.isConfigured()).toBe(true);
    expect(provider.isEligible(movie)).toBe(true);

    const sources = await provider.getSources(movie);
    expect(sources).toHaveLength(1);
    expect(sources[0].kind).toBe('trailer_preview');
    expect(sources[0].type).toBe('youtube');
    expect(sources[0].url).toContain('https://www.youtube-nocookie.com/embed/dfeUzm6KF4g');
  });
});

describe('JellyfinProvider', () => {
  it('reports unconfigured and returns empty sources if server URL is not provided', async () => {
    const provider = new JellyfinProvider();
    // Default env has no Jellyfin configuration
    expect(provider.isConfigured()).toBe(false);
    expect(provider.isEligible({ id: 'movie-550' })).toBe(false);

    const sources = await provider.getSources({ id: 'movie-550', title: 'Fight Club' });
    expect(sources).toEqual([]);
  });
});

describe('PlaybackCoordinator', () => {
  it('strictly segregates full streams from promotional trailers', async () => {
    vi.spyOn(tmdb, 'getVideos').mockResolvedValue([]);
    const coordinator = new PlaybackCoordinator();
    const mockFullSource: PlaybackSource = {
      id: 'mock-full',
      providerId: 'mock-prov',
      providerName: 'Mock Provider',
      kind: 'full_movie',
      type: 'embed',
      url: 'https://zoryva.me/embed/movie/550',
      title: 'Full Stream',
    };

    const mockTrailerSource: PlaybackSource = {
      id: 'mock-trailer',
      providerId: 'tmdb-trailer',
      providerName: 'TMDB Trailer',
      kind: 'trailer_preview',
      type: 'youtube',
      url: 'https://www.youtube-nocookie.com/embed/12345',
      title: 'Trailer',
    };

    const mockProvider = {
      id: 'mock-test-provider',
      name: 'Mock Test Provider',
      priority: 1,
      supportedTypes: ['movie' as const, 'tv' as const],
      playbackType: 'embed' as const,
      kind: 'full_movie' as const,
      isConfigured: () => true,
      isEligible: () => true,
      getSources: async () => [mockFullSource, mockTrailerSource],
    };

    coordinator.registerProvider(mockProvider);

    const session = await coordinator.loadPlaybackSession({ id: 'movie-550', title: 'Fight Club' });

    expect(session.status).toBe('ready');
    expect(session.availableSources.every((s) => s.kind === 'full_movie')).toBe(true);
    expect(session.trailerSources.every((s) => s.kind === 'trailer_preview')).toBe(true);
    expect(session.activeSource?.kind).toBe('full_movie');
  });

  it('correctly maps TV series sources to full_episode kind', async () => {
    vi.spyOn(tmdb, 'getVideos').mockResolvedValue([]);
    const coordinator = new PlaybackCoordinator();
    const session = await coordinator.loadPlaybackSession({ id: 'tv-68814', title: 'Westworld' }, 1, 1);

    expect(session.status).toBe('ready');
    expect(session.availableSources.length).toBeGreaterThan(0);
    expect(session.availableSources.every((s) => s.kind === 'full_episode')).toBe(true);
  });

  it('supports configurable provider priority and reordering', () => {
    const coordinator = new PlaybackCoordinator();

    // Reorder: put vidsrc-embed ahead of zoryva-embed
    coordinator.setProviderOrder(['vidsrc-embed', 'zoryva-embed', 'jellyfin-private']);
    const reordered = coordinator.getProviders();

    const vidsrcIndex = reordered.findIndex((p) => p.id === 'vidsrc-embed');
    const zoryvaIndex = reordered.findIndex((p) => p.id === 'zoryva-embed');

    expect(vidsrcIndex).toBeLessThan(zoryvaIndex);
  });

  it('cycles to the next eligible source without loop repetition', () => {
    const coordinator = new PlaybackCoordinator();
    const s1: PlaybackSource = {
      id: 'src-1',
      providerId: 'p1',
      providerName: 'P1',
      kind: 'full_movie',
      type: 'embed',
      url: 'https://zoryva.me/1',
      title: 'Source 1',
    };
    const s2: PlaybackSource = {
      id: 'src-2',
      providerId: 'p2',
      providerName: 'P2',
      kind: 'full_movie',
      type: 'embed',
      url: 'https://vidsrc.to/2',
      title: 'Source 2',
    };
    const s3: PlaybackSource = {
      id: 'src-3',
      providerId: 'p3',
      providerName: 'P3',
      kind: 'full_movie',
      type: 'embed',
      url: 'https://jellyfin.example.com/3',
      title: 'Source 3',
    };

    const sources = [s1, s2, s3];
    const failed = new Set<string>();

    // Current is s1, next should be s2
    let next = coordinator.getNextEligibleSource(sources, 'src-1', failed);
    expect(next?.id).toBe('src-2');

    // If s1 fails, next should still be s2
    failed.add('src-1');
    next = coordinator.getNextEligibleSource(sources, 'src-1', failed);
    expect(next?.id).toBe('src-2');

    // If s2 also fails, next should be s3
    failed.add('src-2');
    next = coordinator.getNextEligibleSource(sources, 'src-2', failed);
    expect(next?.id).toBe('src-3');

    // If all fail, return null (preventing loop)
    failed.add('src-3');
    next = coordinator.getNextEligibleSource(sources, 'src-3', failed);
    expect(next).toBeNull();
  });

  it('ranks higher reliability providers first', async () => {
    const coordinator = new PlaybackCoordinator();
    const session = await coordinator.loadPlaybackSession({ id: 'movie-550', title: 'Fight Club' });

    expect(session.status).toBe('ready');
    expect(session.availableSources.length).toBeGreaterThan(0);
    // Highest ranked full stream is activeSource
    expect(session.activeSource?.id).toBe(session.availableSources[0].id);
  });
});
