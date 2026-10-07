import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart } from 'lucide-react';
import { PixelBadge } from '../common/PixelBadge';
import { TinySkull, GothStar, BirthdayStamp } from '../common/KuromiDecorations';
import { useFavorites } from '../../context/useFavorites';

export const HeroSection: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { favorites } = useFavorites();

  // High quality cinematic backdrop (La La Land / Starry night moody cinema atmosphere)
  const heroImage =
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=85';

  return (
    <section className="relative min-h-[82vh] sm:min-h-[88vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Cinematic Midnight Lounge"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.1] transition-opacity duration-1000 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
        />
        {/* Layered Vignette & Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-black via-midnight-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight-black/90 via-midnight-black/50 to-midnight-black/80" />
        <div className="absolute inset-0 bg-deep-cherry/20 mix-blend-multiply" />
      </div>

      {/* Decorative stars and Kuromi silhouettes floating softly */}
      <div className="absolute top-28 left-8 sm:left-16 pointer-events-none opacity-40 animate-pulse-slow">
        <GothStar className="w-5 h-5 text-soft-blush" />
      </div>
      <div className="absolute top-44 right-10 sm:right-24 pointer-events-none opacity-30 animate-float-gentle">
        <GothStar className="w-7 h-7 text-dusty-rose" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col items-center sm:items-start">
        {/* Badges Row: Eyebrow + 10.10 Stamp */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-5">
          <PixelBadge variant="pink" size="sm" dot>
            YOUR OWN LITTLE MIDNIGHT LOUNGE
          </PixelBadge>
          <BirthdayStamp />
        </div>

        {/* Heading with Refined Editorial Serif */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-warm-cream leading-[1.1] mb-5 max-w-3xl">
          Your little world{' '}
          <span className="italic font-normal text-soft-blush block sm:inline">
            of stories.
          </span>
        </h1>

        {/* Description */}
        <p className="font-sans text-sm sm:text-lg text-warm-cream/90 max-w-xl mb-6 font-normal leading-relaxed">
          A cozy place for your favorite films, late-night stories, and
          everything in between. Dim the lights, grab a blanket, and stay awhile.
        </p>

        {/* Handwritten Note Accent */}
        <div className="mb-8 flex items-center justify-center sm:justify-start gap-2 bg-charcoal-plum/80 border border-deep-cherry/80 px-4 py-2 rounded-lg backdrop-blur-sm shadow-md">
          <TinySkull className="text-soft-blush w-3.5 h-3.5" />
          <span className="font-handwritten text-lg sm:text-xl text-soft-blush tracking-wide">
            For Mahi, with a little extra love ♡
          </span>
        </div>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            to="/movies"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-deep-cherry hover:bg-cherry-hover text-warm-cream border border-dusty-rose/60 font-sans font-semibold text-sm shadow-goth-glow transition-all duration-200 flex items-center justify-center gap-2.5 group"
          >
            <Play className="w-4 h-4 fill-current text-soft-blush group-hover:scale-110 transition-transform" />
            <span>Explore Movies</span>
          </Link>

          <Link
            to="/my-list"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-charcoal-plum/90 hover:bg-deep-cherry/50 text-warm-cream border border-deep-cherry/80 font-sans font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2.5"
          >
            <Heart className="w-4 h-4 text-dusty-rose" />
            <span>My List</span>
            {favorites.length > 0 && (
              <span className="font-pixel text-[8px] px-1.5 py-0.5 rounded-full bg-dusty-rose text-midnight-black font-bold">
                {favorites.length}
              </span>
            )}
          </Link>
        </div>

        {/* Micro-detail footer bar inside hero */}
        <div className="mt-12 flex items-center gap-4 text-xs text-muted-mauve pt-6 border-t border-deep-cherry/30 w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-soft-blush animate-pulse" />
            <span className="font-pixel text-[8px] text-muted-mauve pixel-crisp">
              LOUNGE: PRIVATE SESSION
            </span>
          </div>
          <span className="text-deep-cherry">•</span>
          <span className="font-handwritten text-sm text-soft-blush">
            Curated especially for Mother Teresa
          </span>
        </div>
      </div>
    </section>
  );
};
