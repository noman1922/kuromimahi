/**
 * Provider Metrics & Reliability Tracker
 * Measures real startup latency and failure counts for streaming providers.
 * Persists locally to automatically prioritize the fastest, most reliable server.
 */

export interface ProviderStat {
  id: string;
  name: string;
  successes: number;
  failures: number;
  totalLoadTimeMs: number;
  samples: number;
  lastUsed: number;
}

const STORAGE_KEY = 'mahis_cinema_provider_metrics_v2';

class ProviderMetricsService {
  private stats: Map<string, ProviderStat> = new Map();

  constructor() {
    this.load();
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: ProviderStat) => {
            this.stats.set(item.id, item);
          });
        }
      }
    } catch {
      // Ignore storage parse issues
    }
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      const array = Array.from(this.stats.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
    } catch {
      // Ignore quota issues
    }
  }

  public recordSuccess(providerId: string, providerName: string, loadTimeMs: number): void {
    const existing = this.stats.get(providerId) || {
      id: providerId,
      name: providerName,
      successes: 0,
      failures: 0,
      totalLoadTimeMs: 0,
      samples: 0,
      lastUsed: Date.now(),
    };

    existing.successes += 1;
    existing.totalLoadTimeMs += Math.max(loadTimeMs, 10);
    existing.samples += 1;
    existing.lastUsed = Date.now();

    this.stats.set(providerId, existing);
    this.save();
  }

  public recordFailure(providerId: string, providerName: string): void {
    const existing = this.stats.get(providerId) || {
      id: providerId,
      name: providerName,
      successes: 0,
      failures: 0,
      totalLoadTimeMs: 0,
      samples: 0,
      lastUsed: Date.now(),
    };

    existing.failures += 1;
    existing.lastUsed = Date.now();

    this.stats.set(providerId, existing);
    this.save();
  }

  public getStat(providerId: string): ProviderStat | undefined {
    return this.stats.get(providerId);
  }

  public getAverageLatency(providerId: string): number | null {
    const stat = this.stats.get(providerId);
    if (!stat || stat.samples === 0) return null;
    return Math.round(stat.totalLoadTimeMs / stat.samples);
  }

  public getReliabilityScore(providerId: string): number {
    const stat = this.stats.get(providerId);
    if (!stat) return 1.0; // Default baseline
    const total = stat.successes + stat.failures;
    if (total === 0) return 1.0;
    return stat.successes / total;
  }
}

export const providerMetrics = new ProviderMetricsService();

