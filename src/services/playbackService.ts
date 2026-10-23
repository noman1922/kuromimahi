import type { PlaybackProvider, PlaybackResult } from '../types/playback';

/**
 * Standard Mock Playback Provider
 * Follows strict requirement:
 * "For the first version, create a mock provider that returns 'unavailable' when no authorized source is configured.
 * Do not invent stream URLs or pretend that a video is playing."
 */
class PrivateLoungePlaybackProvider implements PlaybackProvider {
  id = 'mahis-private-stream';
  name = 'Mahi Cinema Private Stream Protocol';

  async getPlaybackSource(movieId: string): Promise<PlaybackResult> {
    // Simulate brief network verification
    await new Promise((resolve) => setTimeout(resolve, 350));

    return {
      status: 'unavailable',
      message: `Stream encryption key is locked for private lounge title #${movieId}. Cloud stream distribution adapter has not been connected to a verified license provider yet.`,
      providerName: this.name,
    };
  }
}

class PlaybackService {
  private provider: PlaybackProvider;

  constructor(provider?: PlaybackProvider) {
    this.provider = provider || new PrivateLoungePlaybackProvider();
  }

  public setProvider(newProvider: PlaybackProvider) {
    this.provider = newProvider;
  }

  public async loadSource(movieId: string): Promise<PlaybackResult> {
    try {
      return await this.provider.getPlaybackSource(movieId);
    } catch (err) {
      return {
        status: 'unavailable',
        message: err instanceof Error ? err.message : 'Unknown playback service error.',
        providerName: this.provider.name,
      };
    }
  }
}

export const playbackService = new PlaybackService();
