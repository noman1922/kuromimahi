import React, { useEffect, useState, useRef, useTransition, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Film,
  Tv,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Maximize2,
  Server,
  Layers,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import type { Movie } from '../../types/movie';
import type { PlaybackResult, PlaybackSource } from '../../types/playback';
import { playbackService } from '../../services/playbackService';
import { providerMetrics } from '../../services/providerMetrics';
import { parseTmdbId } from '../../services/tmdbHelpers';
import { PixelBadge } from '../common/PixelBadge';
import { KuromiMascot, TinySkull } from '../common/KuromiDecorations';
import { LoadingMessage } from '../common/LoadingMessage';

interface PlaybackPanelProps {
  movie: Movie;
}

export const PlaybackPanel: React.FC<PlaybackPanelProps> = ({ movie }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [switchingSource, setSwitchingSource] = useState(false);
  const [session, setSession] = useState<PlaybackResult | null>(null);
  const [activeSource, setActiveSource] = useState<PlaybackSource | null>(null);
  const [activeMode, setActiveMode] = useState<'stream' | 'trailer'>('stream');
  const [failedSourceIds, setFailedSourceIds] = useState<Set<string>>(new Set());
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [failoverNotice, setFailoverNotice] = useState<string | null>(null);

  // Performance & Buffer diagnostic timers
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [isNativeBuffering, setIsNativeBuffering] = useState(false);
  const loadStartTimeRef = useRef<number>(Date.now());

  // TV series season / episode support
  const { type: mediaType } = parseTmdbId(movie.id);
  const isTv = mediaType === 'tv';
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [, startTransition] = useTransition();

  const loadSources = useCallback(
    async (s = season, ep = episode) => {
      setLoading(true);
      try {
        const result = await playbackService.loadPlaybackSession(movie, s, ep);
        setSession(result);

        if (activeMode === 'stream') {
          const eligible = result.availableSources.filter((src) => !failedSourceIds.has(src.id));
          setActiveSource(eligible[0] || result.availableSources[0] || null);
        } else {
          setActiveSource(result.trailerSources[0] || null);
        }
      } catch (err) {
        console.error('Failed to load playback session:', err);
      } finally {
        setLoading(false);
      }
    },
    [movie, season, episode, activeMode, failedSourceIds]
  );

  useEffect(() => {
    setFailedSourceIds(new Set());
    loadSources(season, episode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie.id, season, episode]);

  // Dynamic Resource Hints (Preconnect & DNS-Prefetch) for active provider origin
  useEffect(() => {
    if (!activeSource?.url) return;
    try {
      const origin = new URL(activeSource.url).origin;
      if (!origin.startsWith('http')) return;

      const existingPreconnect = document.head.querySelector(`link[data-origin="${origin}"]`);
      if (!existingPreconnect) {
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = origin;
        preconnect.crossOrigin = 'anonymous';
        preconnect.setAttribute('data-origin', origin);
        document.head.appendChild(preconnect);

        const dns = document.createElement('link');
        dns.rel = 'dns-prefetch';
        dns.href = origin;
        dns.setAttribute('data-origin', origin);
        document.head.appendChild(dns);
      }
    } catch {
      // Ignore origin parsing on atypical URLs
    }
  }, [activeSource?.url]);

  // Elapsed buffer timer on active source change
  useEffect(() => {
    setIsIframeLoaded(false);
    setIsNativeBuffering(false);
    setElapsedSeconds(0);
    loadStartTimeRef.current = Date.now();

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => +(prev + 0.5).toFixed(1));
    }, 500);

    return () => clearInterval(timer);
  }, [activeSource?.id]);

  // Clean up iframe before switching or unmounting to stop stray audio/workers
  useEffect(() => {
    const currentIframe = iframeRef.current;
    return () => {
      if (currentIframe) {
        currentIframe.src = 'about:blank';
      }
    };
  }, [activeSource?.id]);

  // Handle successful iframe load
  const handleIframeLoad = () => {
    setIsIframeLoaded(true);
    const durationMs = Date.now() - loadStartTimeRef.current;
    if (activeSource) {
      providerMetrics.recordSuccess(activeSource.providerId, activeSource.providerName, durationMs);
    }
  };

  // Handle manual source selection
  const handleSelectSource = (src: PlaybackSource) => {
    setSwitchingSource(true);
    setActiveSource(src);
    if (src.kind === 'trailer_preview') {
      setActiveMode('trailer');
    } else {
      setActiveMode('stream');
    }
    setTimeout(() => setSwitchingSource(false), 200);
  };

  // Safe failover to next eligible source with loop protection
  const handleTryNextSource = useCallback(() => {
    if (!session) return;
    setSwitchingSource(true);

    if (activeMode === 'stream') {
      const next = playbackService.getNextEligibleSource(
        session.availableSources,
        activeSource?.id || '',
        failedSourceIds
      );
      if (next) {
        setActiveSource(next);
      } else {
        setActiveSource(null);
      }
    } else {
      const trailers = session.trailerSources;
      if (trailers.length > 1) {
        const currIdx = trailers.findIndex((s) => s.id === activeSource?.id);
        const nextIdx = (currIdx + 1) % trailers.length;
        setActiveSource(trailers[nextIdx]);
      }
    }

    setTimeout(() => setSwitchingSource(false), 200);
  }, [session, activeMode, activeSource, failedSourceIds]);

  // Record an explicit provider error with automatic failover notification
  const handleSourceError = useCallback(
    (sourceId: string) => {
      if (activeSource) {
        providerMetrics.recordFailure(activeSource.providerId, activeSource.providerName);
      }

      setFailedSourceIds((prev) => {
        const next = new Set(prev);
        next.add(sourceId);
        return next;
      });

      if (session && activeMode === 'stream') {
        const next = playbackService.getNextEligibleSource(
          session.availableSources,
          sourceId,
          new Set([...failedSourceIds, sourceId])
        );
        if (next) {
          setFailoverNotice(
            `Source ${activeSource?.badge || ''} was unavailable. Automatically switched to ${next.badge || next.providerName}.`
          );
          setActiveSource(next);
        } else {
          setActiveSource(null);
        }
      }
    },
    [session, activeMode, failedSourceIds, activeSource]
  );

  // Auto-dismiss failover notification
  useEffect(() => {
    if (!failoverNotice) return;
    const timer = setTimeout(() => setFailoverNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [failoverNotice]);

  // Listen for iframe postMessage error dispatches
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && (data.event === 'error' || data.type === 'PLAYER_ERROR' || data.status === 'error')) {
          if (activeSource) {
            handleSourceError(activeSource.id);
          }
        }
      } catch {
        // ignore non-JSON messages
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [activeSource, handleSourceError]);

  const handleModeSwitch = useCallback(
    (mode: 'stream' | 'trailer') => {
      setActiveMode(mode);
      setSwitchingSource(true);
      if (mode === 'trailer') {
        if (session?.trailerSources && session.trailerSources.length > 0) {
          setActiveSource(session.trailerSources[0]);
        }
      } else {
        const eligible = session?.availableSources.filter((s) => !failedSourceIds.has(s.id)) || [];
        setActiveSource(eligible[0] || session?.availableSources[0] || null);
      }
      setTimeout(() => setSwitchingSource(false), 200);
    },
    [session, failedSourceIds]
  );

  // Fullscreen helper
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (isTv) {
          startTransition(() => setEpisode((ep) => ep + 1));
        } else {
          handleTryNextSource();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (isTv && episode > 1) {
          startTransition(() => setEpisode((ep) => ep - 1));
        }
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleModeSwitch(activeMode === 'stream' ? 'trailer' : 'stream');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleTryNextSource, handleModeSwitch, activeMode, isTv, episode]);

  const availableStreams = session?.availableSources || [];
  const availableTrailers = session?.trailerSources || [];
  const hasFullStream = availableStreams.length > 0;
  const hasTrailer = availableTrailers.length > 0;

  return (
    <div className="w-full">
      {/* Top Navigation & Status Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/movie/${movie.id}`}
          className="inline-flex items-center gap-2 text-sm font-sans text-muted-mauve hover:text-soft-blush transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Details</span>
        </Link>

        {/* Source Mode Toggles: Full Stream vs. Official Trailer */}
        <div className="flex items-center gap-2">
          {hasFullStream && (
            <button
              onClick={() => handleModeSwitch('stream')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all flex items-center gap-1.5 ${
                activeMode === 'stream'
                  ? 'bg-deep-cherry text-warm-cream border border-dusty-rose/60 shadow-cherry-glow font-medium'
                  : 'bg-charcoal-plum/70 text-muted-mauve hover:text-warm-cream border border-deep-cherry/40'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-dusty-rose" />
              <span>{isTv ? 'Full Episode' : 'Full Movie'}</span>
              <span className="text-[10px] opacity-70">({availableStreams.length})</span>
            </button>
          )}

          {hasTrailer && (
            <button
              onClick={() => handleModeSwitch('trailer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all flex items-center gap-1.5 ${
                activeMode === 'trailer'
                  ? 'bg-deep-cherry text-warm-cream border border-dusty-rose/60 shadow-cherry-glow font-medium'
                  : 'bg-charcoal-plum/70 text-muted-mauve hover:text-warm-cream border border-deep-cherry/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-dusty-rose" />
              <span>Official Preview</span>
              <span className="text-[10px] opacity-70">({availableTrailers.length})</span>
            </button>
          )}

          <PixelBadge variant="mauve" size="xs">
            LOUNGE SCREEN 01
          </PixelBadge>
        </div>
      </div>

      {/* Main Unified Player Container */}
      <div
        ref={containerRef}
        className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-midnight-black border border-deep-cherry shadow-2xl flex flex-col justify-between group"
      >
        {/* TOP OVERLAY BAR: Active source metadata & switcher */}
        <div className="relative z-30 bg-gradient-to-b from-midnight-black/95 via-midnight-black/75 to-transparent p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 border-b border-deep-cherry/20">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isIframeLoaded || !loading ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="font-pixel text-[10px] text-warm-cream">
              {activeMode === 'trailer'
                ? 'OFFICIAL PREVIEW'
                : isTv
                ? `FULL EPISODE (S${season}:E${episode})`
                : 'FULL MOVIE'}
              :
            </span>
            <span className="text-xs text-soft-blush font-medium truncate max-w-[170px] sm:max-w-xs">
              {activeSource ? activeSource.title : 'None Selected'}
            </span>
            {activeSource?.badge && (
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-pixel bg-charcoal-plum border border-deep-cherry text-muted-mauve">
                <Zap className="w-2.5 h-2.5 text-dusty-rose" />
                {activeSource.badge}
              </span>
            )}
          </div>

          {/* Server Pill Selector & Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Server Switcher Pills */}
            <div className="hidden md:flex items-center gap-1.5 bg-charcoal-plum/80 p-1 rounded-lg border border-deep-cherry/40">
              <Server className="w-3 h-3 text-muted-mauve ml-1" />
              {(activeMode === 'stream' ? availableStreams : availableTrailers).map((src, idx) => {
                const isSelected = activeSource?.id === src.id;
                const isFailed = failedSourceIds.has(src.id);
                return (
                  <button
                    key={src.id}
                    onClick={() => handleSelectSource(src)}
                    className={`px-2 py-0.5 rounded text-[11px] font-sans transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-deep-cherry text-warm-cream font-medium shadow-cherry-glow'
                        : isFailed
                        ? 'text-dusty-rose/40 line-through'
                        : 'text-muted-mauve hover:text-warm-cream'
                    }`}
                  >
                    <span>{src.badge || `Server ${idx + 1}`}</span>
                  </button>
                );
              })}
            </div>

            {/* Try Next Source Button */}
            {((activeMode === 'stream' && availableStreams.length > 1) ||
              (activeMode === 'trailer' && availableTrailers.length > 1)) && (
              <button
                onClick={handleTryNextSource}
                title="Switch to alternative provider if this stream buffers"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-charcoal-plum hover:bg-deep-cherry text-warm-cream text-xs border border-deep-cherry transition-colors"
              >
                <RefreshCw className="w-3 h-3 text-dusty-rose" />
                <span className="hidden sm:inline">Try Next Source</span>
                <span className="sm:hidden">Next</span>
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={handleToggleFullscreen}
              title="Toggle Fullscreen (F)"
              className="p-1.5 rounded-md bg-charcoal-plum hover:bg-deep-cherry text-muted-mauve hover:text-warm-cream border border-deep-cherry transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Automatic Failover Notice Banner */}
        {failoverNotice && (
          <div className="absolute top-16 left-4 right-4 z-40 bg-charcoal-plum/95 border border-dusty-rose/80 rounded-xl px-4 py-2.5 shadow-2xl flex items-center justify-between animate-fade-in text-xs font-sans text-warm-cream">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-dusty-rose flex-shrink-0" />
              <span>{failoverNotice}</span>
            </div>
            <button
              onClick={() => setFailoverNotice(null)}
              className="text-muted-mauve hover:text-warm-cream text-xs ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* MIDDLE SCREEN CONTENT: The Active Video / Embed or Fallback Screen */}
        <div className="relative flex-1 w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden">
          {loading || switchingSource ? (
            <div className="flex flex-col items-center space-y-3 z-20">
              <LoadingMessage size="md" subtitle="CALIBRATING PRIVATE STREAM PROTOCOL..." />
            </div>
          ) : activeSource ? (
            <>
              {/* Visible waiting & elapsed buffering indicator before frame paints */}
              {!isIframeLoaded && activeSource.type === 'embed' && (
                <div className="absolute inset-0 z-20 bg-midnight-black/90 flex flex-col items-center justify-center space-y-3 p-4 pointer-events-none">
                  <LoadingMessage
                    size="md"
                    subtitle={`Connecting to ${activeSource.providerName}... (${elapsedSeconds}s)`}
                  />
                  {elapsedSeconds >= 7 && (
                    <div className="pointer-events-auto mt-2">
                      <button
                        onClick={handleTryNextSource}
                        className="px-3 py-1.5 rounded-lg bg-deep-cherry text-warm-cream text-xs border border-dusty-rose/60 hover:bg-cherry-hover transition-colors shadow-cherry-glow"
                      >
                        Buffering slow? Click to Try Next Source
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Native HTML5 video buffering badge */}
              {isNativeBuffering && (
                <div className="absolute top-16 right-4 z-30 px-2.5 py-1 rounded bg-charcoal-plum/90 border border-deep-cherry text-[11px] text-warm-cream flex items-center gap-1.5">
                  <LoadingMessage size="xs" inline showSpinner />
                  <span className="text-[10px] text-muted-mauve ml-1">• Buffering stream...</span>
                </div>
              )}

              {activeSource.type === 'embed' || activeSource.type === 'youtube' ? (
                <iframe
                  ref={iframeRef}
                  key={`${activeSource.url}-${season}-${episode}`}
                  src={activeSource.url}
                  title={`${movie.title} Playback`}
                  loading="eager"
                  className="w-full h-full border-0 absolute inset-0 z-10 bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="origin"
                  onLoad={handleIframeLoad}
                  onError={() => handleSourceError(activeSource.id)}
                />
              ) : (
                <video
                  key={activeSource.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain absolute inset-0 z-10 bg-black"
                  onWaiting={() => setIsNativeBuffering(true)}
                  onPlaying={() => setIsNativeBuffering(false)}
                  onCanPlay={() => setIsNativeBuffering(false)}
                  onError={() => handleSourceError(activeSource.id)}
                >
                  <source
                    src={activeSource.url}
                    type={activeSource.type === 'hls' ? 'application/x-mpegURL' : 'video/mp4'}
                  />
                  Your browser does not support HTML5 video playback.
                </video>
              )}
            </>
          ) : (
            /* ALL SOURCES FAILED OR UNAVAILABLE STATE */
            <div className="relative z-20 max-w-lg mx-auto flex flex-col items-center space-y-4 p-6 text-center select-none">
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-2xl bg-charcoal-plum border border-deep-cherry flex items-center justify-center shadow-cherry-glow">
                  <KuromiMascot className="w-10 h-10 text-dusty-rose" />
                </div>
              </div>

              <PixelBadge variant="cherry" size="sm" dot>
                {activeMode === 'trailer'
                  ? 'NO TRAILER AVAILABLE'
                  : 'ALL STREAM SOURCES FAILED OR UNAVAILABLE'}
              </PixelBadge>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-warm-cream">
                {movie.title}
              </h2>

              <div className="bg-charcoal-plum/90 border border-deep-cherry/80 rounded-xl p-4 text-xs font-sans text-muted-mauve leading-relaxed max-w-md">
                <div className="flex items-start gap-2.5 text-left mb-2">
                  <AlertCircle className="w-4 h-4 text-dusty-rose flex-shrink-0 mt-0.5" />
                  <p className="text-warm-cream/90 font-medium">
                    All configured stream providers encountered errors or lack sources for this title.
                  </p>
                </div>
                <p className="text-[11px] text-muted-mauve/80 text-left border-t border-deep-cherry/40 pt-2">
                  VidLink, Zoryva, and VidSrc providers were queried. You can retry with a fresh session
                  or switch to the official promotional trailer below.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {hasTrailer && activeMode !== 'trailer' && (
                  <button
                    onClick={() => handleModeSwitch('trailer')}
                    className="px-4 py-2 rounded-xl bg-deep-cherry hover:bg-cherry-hover text-warm-cream text-xs font-sans font-medium transition-colors border border-dusty-rose/40 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-dusty-rose" />
                    <span>Watch Official Trailer</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setFailedSourceIds(new Set());
                    loadSources(season, episode);
                  }}
                  className="px-4 py-2 rounded-xl bg-charcoal-plum hover:bg-deep-cherry/60 text-warm-cream text-xs font-sans font-medium transition-colors border border-deep-cherry flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-muted-mauve" />
                  <span>Retry All Sources</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM BAR: Cinema footer & TV season/episode selector */}
        <div className="relative z-30 bg-gradient-to-t from-midnight-black/95 via-midnight-black/85 to-transparent p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 border-t border-deep-cherry/20">
          <div className="flex items-center gap-3 text-[10px] text-muted-mauve font-pixel">
            <span className="flex items-center gap-1">
              <TinySkull className="text-dusty-rose w-3 h-3" />
              MAHI'S PRIVATE SCREEN
            </span>
            <span>MIDNIGHT CINEMA LOUNGE</span>
          </div>

          {/* TV Episode Selector with Prev / Next shortcuts */}
          {isTv && (
            <div className="flex items-center gap-2">
              <Tv className="w-3.5 h-3.5 text-dusty-rose" />
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-mauve font-pixel text-[10px]">SEASON</span>
                <select
                  aria-label="Select season"
                  value={season}
                  onChange={(e) => {
                    const newS = Number(e.target.value);
                    startTransition(() => {
                      setSeason(newS);
                      setEpisode(1);
                    });
                  }}
                  className="bg-charcoal-plum text-warm-cream rounded px-1.5 py-0.5 border border-deep-cherry text-xs outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <span className="text-muted-mauve font-pixel text-[10px] ml-2">EPISODE</span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={episode <= 1}
                    onClick={() => startTransition(() => setEpisode((ep) => Math.max(1, ep - 1)))}
                    title="Previous Episode (P)"
                    className="p-1 rounded bg-charcoal-plum hover:bg-deep-cherry disabled:opacity-40 text-warm-cream border border-deep-cherry transition-colors"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>

                  <select
                    aria-label="Select episode"
                    value={episode}
                    onChange={(e) => {
                      const newEp = Number(e.target.value);
                      startTransition(() => setEpisode(newEp));
                    }}
                    className="bg-charcoal-plum text-warm-cream rounded px-1.5 py-0.5 border border-deep-cherry text-xs outline-none"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((ep) => (
                      <option key={ep} value={ep}>
                        Ep {ep}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => startTransition(() => setEpisode((ep) => ep + 1))}
                    title="Next Episode (N)"
                    className="p-1 rounded bg-charcoal-plum hover:bg-deep-cherry text-warm-cream border border-deep-cherry transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
                    title="Toggle Episode List"
                    className="ml-1 p-1 rounded bg-charcoal-plum hover:bg-deep-cherry text-muted-mauve hover:text-warm-cream border border-deep-cherry transition-colors"
                  >
                    <Layers className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Issue reporting / switch server link */}
          <div className="text-[11px] text-muted-mauve/70 flex items-center gap-1">
            <span>Stuck or buffering?</span>
            <button
              onClick={handleTryNextSource}
              className="text-soft-blush hover:underline inline-flex items-center gap-0.5 ml-1"
            >
              Try Next Source <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Episode Grid Drawer (MovieBox / StreamHub style) */}
      {isTv && showEpisodeDrawer && (
        <div className="mt-4 p-4 rounded-xl bg-charcoal-plum/60 border border-deep-cherry/60">
          <div className="flex items-center justify-between mb-3">
            <span className="font-pixel text-[11px] text-warm-cream">
              SEASON {season} EPISODES
            </span>
            <span className="text-[11px] text-muted-mauve">Click episode to jump</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
            {Array.from({ length: 24 }, (_, i) => i + 1).map((epNum) => {
              const isCurrent = epNum === episode;
              return (
                <button
                  key={epNum}
                  onClick={() => {
                    startTransition(() => setEpisode(epNum));
                    setShowEpisodeDrawer(false);
                  }}
                  className={`py-2 px-1 rounded-lg text-xs font-mono transition-all text-center border ${
                    isCurrent
                      ? 'bg-deep-cherry text-warm-cream border-dusty-rose font-bold shadow-cherry-glow'
                      : 'bg-midnight-black/60 text-muted-mauve hover:text-warm-cream hover:bg-charcoal-plum border-deep-cherry/40'
                  }`}
                >
                  E{epNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Transparent Architecture & Diagnostic Card */}
      <div className="mt-4 p-4 rounded-xl bg-charcoal-plum/40 border border-deep-cherry/40 text-xs font-sans text-muted-mauve flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-dusty-rose flex-shrink-0" />
          <span>
            {activeMode === 'trailer'
              ? 'Currently viewing the official studio trailer / promotional preview from TMDB.'
              : `Playing via ${activeSource?.providerName || 'Provider Adapter'}. Same-origin security protects your browser from third-party embed scripts.`}
          </span>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-[11px]">
          <span className="hidden md:inline text-muted-mauve/60">
            Shortcuts: <kbd className="px-1 py-0.5 bg-midnight-black rounded border border-deep-cherry">F</kbd> Fullscreen • <kbd className="px-1 py-0.5 bg-midnight-black rounded border border-deep-cherry">N</kbd> Next • <kbd className="px-1 py-0.5 bg-midnight-black rounded border border-deep-cherry">T</kbd> Trailer
          </span>
          {activeSource?.url && (
            <a
              href={activeSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-mauve hover:text-soft-blush transition-colors ml-2"
            >
              <span>Direct Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
