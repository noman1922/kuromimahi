import React, { useState, useEffect } from 'react';
import type { Movie } from '../types/movie';
import { tmdb } from '../services/tmdb';
import { HeroSection } from '../components/hero/HeroSection';
import { MovieRow } from '../components/movie/MovieRow';
import { ContinueWatchingCard } from '../components/movie/ContinueWatchingCard';
import { HandwrittenNote } from '../components/common/HandwrittenNote';
import { PixelBadge } from '../components/common/PixelBadge';
import { BirthdayStamp, GothStar, TinySkull } from '../components/common/KuromiDecorations';

const WATCH_HISTORY_KEY = 'mahis_cinema_watch_history_v1';

export const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [kdramaMovies, setKdramaMovies] = useState<Movie[]>([]);
  const [animeMovies, setAnimeMovies] = useState<Movie[]>([]);
  const [romanticMovies, setRomanticMovies] = useState<Movie[]>([]);
  const [quietNightMovies, setQuietNightMovies] = useState<Movie[]>([]);
  const [seriesMovies, setSeriesMovies] = useState<Movie[]>([]);
  const [recentlyAddedMovies, setRecentlyAddedMovies] = useState<Movie[]>([]);
  const [continueWatchingMovies] = useState<Movie[]>(() => {
    try {
      const raw = localStorage.getItem(WATCH_HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load genuine watch history:', e);
    }
    return [];
  });

  useEffect(() => {
    let isMounted = true;

    async function loadTmdbData() {
      try {
        const [trending, kdramas, anime, romance, quietNight, series, nowPlaying] =
          await Promise.allSettled([
            tmdb.getTrendingMovies(),
            tmdb.getKoreanDramas(),
            tmdb.getAnime(),
            tmdb.getRomanticPicks(),
            tmdb.getTopRatedMovies(),
            tmdb.getPopularTv(),
            tmdb.getNowPlayingMovies(),
          ]);

        if (!isMounted) return;

        if (trending.status === 'fulfilled') {
          setTrendingMovies(trending.value);
        }
        if (kdramas.status === 'fulfilled') {
          setKdramaMovies(kdramas.value);
        }
        if (anime.status === 'fulfilled') {
          setAnimeMovies(anime.value);
        }
        if (romance.status === 'fulfilled') {
          setRomanticMovies(romance.value);
        }
        if (quietNight.status === 'fulfilled') {
          setQuietNightMovies(quietNight.value);
        }
        if (series.status === 'fulfilled') {
          setSeriesMovies(series.value);
        }
        if (nowPlaying.status === 'fulfilled') {
          setRecentlyAddedMovies(nowPlaying.value);
        }
      } catch (err) {
        console.warn('Error fetching TMDB live streams:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTmdbData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* 1. Personalized Hero */}
      <HeroSection />

      <div className="space-y-4">
        {/* 2. Continue Watching (Only shown when genuine viewing history exists) */}
        {continueWatchingMovies.length > 0 && (
          <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TinySkull className="text-dusty-rose" />
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-warm-cream">
                  Continue Watching
                </h2>
                <PixelBadge variant="mauve" size="xs">
                  SAVED SPOT
                </PixelBadge>
              </div>
              <span className="text-[11px] font-sans text-muted-mauve hidden sm:inline">
                Real watch progress saved in your browser
              </span>
            </div>

            <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2">
              {continueWatchingMovies.map((movie) => (
                <ContinueWatchingCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* 3. Trending Tonight */}
        <MovieRow
          title="Trending Tonight"
          movies={trendingMovies}
          badgeText="TMDB LIVE TRENDING"
          note="Stories lighting up the global midnight marquee"
          viewAllLink="/movies"
          isLoading={loading && trendingMovies.length === 0}
        />

        {/* 4. Korean Dramas (with dedicated visual atmosphere) */}
        <div className="relative py-2 bg-gradient-to-b from-charcoal-plum/30 via-deep-cherry/10 to-transparent border-y border-deep-cherry/20 my-4">
          <MovieRow
            title="Korean Dramas & Romance"
            movies={kdramaMovies}
            badgeText="K-SERIES NOOK"
            note="Unspoken feelings, warm bowls of ramyun, and rain under shared umbrellas."
            viewAllLink="/series"
            isLoading={loading && kdramaMovies.length === 0}
          />
        </div>

        {/* 5. Anime Section */}
        <MovieRow
          title="Anime & Magical Realms"
          movies={animeMovies}
          badgeText="STUDIO SPIRIT"
          note="Flying castles, braided cords, and quiet train rides with spirits."
          viewAllLink="/anime"
          isLoading={loading && animeMovies.length === 0}
        />

        {/* 6. Romantic Picks */}
        <MovieRow
          title="Romantic Picks"
          movies={romanticMovies}
          badgeText="FOR MAHI ♡"
          note="For when you need something tender, honest, and unforgettable."
          isLoading={loading && romanticMovies.length === 0}
        />

        {/* 7. Personal Handwritten Note Banner */}
        <div className="py-10 px-4 text-center flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <GothStar className="w-64 h-64 text-dusty-rose" />
          </div>
          <HandwrittenNote
            rotation="left"
            author="With all my love"
            className="max-w-xl"
          >
            Your movie nights deserve their own little universe. ♡
          </HandwrittenNote>
          <div className="mt-4 flex items-center gap-2">
            <BirthdayStamp />
          </div>
        </div>

        {/* 8. More to Explore: Movies for a Quiet Night */}
        <MovieRow
          title="Movies for a Quiet Night"
          movies={quietNightMovies}
          badgeText="TMDB TOP RATED"
          note="Low light, gentle soundtracks, and space to breathe."
          isLoading={loading && quietNightMovies.length === 0}
        />

        {/* 9. Popular Series */}
        <MovieRow
          title="Popular Series"
          movies={seriesMovies}
          badgeText="MULTI-EPISODE"
          viewAllLink="/series"
          isLoading={loading && seriesMovies.length === 0}
        />

        {/* 10. Recently Added */}
        <MovieRow
          title="Recently Added to the Lounge"
          movies={recentlyAddedMovies}
          badgeText="NOW PLAYING"
          isLoading={loading && recentlyAddedMovies.length === 0}
        />
      </div>
    </div>
  );
};
