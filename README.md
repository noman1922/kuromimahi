# Mahi's Cinema — A Personal Midnight Movie Lounge 🎬✨

A custom, cute-goth, romantic midnight movie lounge built as a personal gift for **Mahi** (lovingly called *“Mother Teresa”*).

Crafted with a cozy private film lounge aesthetic inspired by Kuromi mischief, dark cherry and charcoal plum tones, delicate stars, tiny skull motifs, retro pixel typography, and soft handwritten notes.

Now powered by live metadata from **The Movie Database (TMDB) API** with resilient in-memory caching, debounced search, loading skeletons, and an authentic TMDB fallback catalog.

---

## 🖤 Creative Direction & Palette

The visual identity strikes a deliberate balance: cute without looking childish, dark without looking cold, and romantic without becoming overly sweet.

### Color Foundation
- **Midnight Black**: `#100C12` (Main surface & body background)
- **Charcoal Plum**: `#1D1420` (Cards, drawers & subtle layers)
- **Deep Cherry**: `#351726` (Primary interactive containers, banners & borders)
- **Dusty Rose**: `#C86F91` (Glows, accents & active borders)
- **Soft Blush**: `#F1B6CD` (Highlights, icons & cute emblems)
- **Warm Cream**: `#F6EBDD` (Headings, high-contrast readable text)
- **Muted Mauve**: `#9F8998` (Metadata, subtitles & subtle tags)

### Signature Typography
- **Pixel Font (`Press Start 2P` & `Silkscreen`)**: Retro 8-bit game lettering for dates (`10.10`), badges (`NOW PLAYING`, `MIDNIGHT LOUNGE`, `SAVED SPOT`, `K-DRAMA NOOK`), and Kuromi-inspired notes.
- **Editorial Serif (`Playfair Display`)**: Elegant, refined headings.
- **Clean Sans (`Plus Jakarta Sans`)**: Modern, accessible body text.
- **Handwritten (`Caveat`)**: Warm, personal notes with taped paper pin styling.

### Personal Details Preserved
- **October 10 (`10.10`)**: Special birthday stamp on the navigation, hero section, footer, and profile pass.
- **"Mother Teresa"**: Warm, natural messages (*"For my Mother Teresa ♡"*, *"Even Mother Teresa deserves a movie night."*).
- **Kuromi-Inspired Details**: Pointed ear silhouettes, tiny skull motifs, star sparkles, and dusty pink accents.

---

## 🌐 TMDB API Integration

The application connects to **The Movie Database (TMDB)** via a typed API client service layer (`src/services/tmdb.ts`).

### Connected Endpoints

| Category | Endpoint | Section / Usage |
|---|---|---|
| **Trending Movies** | `/trending/movie/week` | Homepage *Trending Tonight* carousel |
| **Popular Movies** | `/movie/popular` | Movies Catalog (`/movies`) with pagination |
| **Top Rated Movies** | `/movie/top_rated` | Movies for a Quiet Night row |
| **Now Playing** | `/movie/now_playing` | Homepage *Recently Added to Lounge* |
| **Popular TV Series** | `/tv/popular` | Series Catalog (`/series`) with pagination |
| **Trending TV Series** | `/trending/tv/week` | Trending television selections |
| **Korean Dramas** | `/discover/tv?with_genres=18&with_original_language=ko` | Homepage *K-Drama Nook* & Series Page |
| **Anime Discovery** | `/discover/tv?with_genres=16&with_original_language=ja` | Anime Catalog (`/anime`) & Homepage Anime row |
| **Romantic Picks** | `/discover/movie?with_genres=10749` | Homepage *Romantic Picks for Mahi* |
| **Multi-Search** | `/search/movie` & `/search/tv` (parallel) | Live Search Page (`/search`) with 300ms debounce |
| **Movie Details** | `/movie/{id}?append_to_response=credits,recommendations,similar` | Movie Detail Page (`/movie/:id`) |
| **TV Details** | `/tv/{id}?append_to_response=credits,recommendations,similar` | Series Detail Page (`/movie/:id`) |
| **Recommendations** | `/{type}/{id}/recommendations` | *You May Also Adore* on Detail & Watch pages |

### Image CDN Configuration
Images utilize TMDB's official CDN (`https://image.tmdb.org/t/p/`):
- Posters: `w500` (cards) and `w780` (detail heroes)
- Backdrops: `w1280` (cards) and `original` (full-width backdrops)
- Missing artwork automatically displays the project's graceful dark-cherry fallback cards with Kuromi emblems.

---

## 🔐 Environment Variables & Security

An `.env.example` file is provided in the repository.

### Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Obtain a free API key from [The Movie Database API Settings](https://www.themoviedb.org/settings/api).
3. Set your credentials using **Option 1** (recommended server proxy) or **Option 2** (direct client):

```ini
# Option 1: Secure Server Proxy (Recommended)
# Keeps credentials out of client bundles. Proxied through Vite server /api/tmdb
TMDB_API_KEY=your_api_key_v3_here
TMDB_ACCESS_TOKEN=your_read_access_token_v4_here

# Option 2: Client-side access (For static host deployments e.g. Vercel/GitHub Pages)
# Note: VITE_ variables are embedded into public compiled JavaScript bundles.
VITE_TMDB_API_KEY=
VITE_TMDB_ACCESS_TOKEN=
```

### Fallback Guarantee
If no API credentials are provided or if rate limits occur, the app activates **Authentic TMDB Fallback Mode** (`src/data/authenticTmdbFallback.ts`). Every entry in this fallback corresponds to verified real TMDB records with official image paths and credits. The site never displays fake movie titles or blank broken layouts.

---

## ⚡ Performance, Caching & UX

- **In-Memory Cache (10-minute TTL)**: Responses are cached in a client-side memory cache to prevent duplicate HTTP requests during navigation.
- **In-Flight Deduplication**: Concurrent requests to identical endpoints share the same Promise.
- **Search Debounce (300ms)**: Live queries on `/search` are debounced to respect rate limits.
- **Dark Cinema Skeletons**: Tailored loading skeletons (`SkeletonCard`, `SkeletonRow`, `SkeletonGrid`) match the dark cherry and charcoal plum palette.
- **Pagination**: "Load More" controls on Movies, Series, and Anime pages append new items without refreshing.

---

## 🎬 Playback Architecture

TMDB provides metadata only. The video playback interface remains separate and sandboxed under the typed `PlaybackProvider` interface (`src/services/playbackService.ts`).

The Watch page (`/watch/:id`) accurately showcases real TMDB metadata while displaying a clear, styled unavailable-state message until authorized video streaming licenses are configured. No fake stream URLs are generated.

---

## 💾 Local Storage Notice

> **Important Note:** Watchlist and favorite titles are saved in **Browser Local Storage** (`localStorage`).
> Items remain saved across browser refreshes on this device, but do not synchronize across different devices or browsers.

---

## 🚀 Development & Build Commands

### Start Vite Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Linter
```bash
npm run lint
```
