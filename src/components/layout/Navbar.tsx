import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, Menu, X, Heart } from 'lucide-react';
import { KuromiMascot } from '../common/KuromiDecorations';
import { PixelBadge } from '../common/PixelBadge';
import { useFavorites } from '../../context/useFavorites';
import { ProfileModal } from './ProfileModal';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { favorites } = useFavorites();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/movies', label: 'Movies' },
    { to: '/series', label: 'Series' },
    { to: '/anime', label: 'Anime' },
    {
      to: '/my-list',
      label: 'My List',
      badge: favorites.length > 0 ? favorites.length : undefined,
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled
            ? 'bg-midnight-black/90 backdrop-blur-md border-b border-deep-cherry/60 shadow-lg shadow-black/30'
            : 'bg-gradient-to-b from-midnight-black/90 via-midnight-black/50 to-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo & Wordmark */}
            <Link
              to="/"
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
            >
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-charcoal-plum border border-deep-cherry group-hover:border-dusty-rose/60 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-goth-glow">
                  <KuromiMascot className="w-6 h-6 sm:w-7 sm:h-7 text-soft-blush transition-transform duration-300 group-hover:scale-105" />
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-dusty-rose/80 border border-charcoal-plum" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-warm-cream group-hover:text-soft-blush transition-colors">
                    Mahi's Cinema
                  </span>
                  <span className="text-soft-blush text-xs hidden sm:inline-block font-handwritten">
                    ♡
                  </span>
                </div>
                <div className="flex items-center gap-1.5 -mt-0.5">
                  <span className="font-pixel text-[8px] text-muted-mauve tracking-wider uppercase pixel-crisp">
                    MIDNIGHT LOUNGE
                  </span>
                  <span className="text-deep-cherry text-[9px]">•</span>
                  <span className="font-pixel text-[8px] text-dusty-rose tracking-wider pixel-crisp">
                    10.10
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md font-sans text-sm font-medium transition-colors duration-150 flex items-center gap-1.5 relative ${isActive
                      ? 'text-soft-blush bg-deep-cherry/40 border border-deep-cherry/80'
                      : 'text-warm-cream/80 hover:text-warm-cream hover:bg-charcoal-plum/60'
                    }`
                  }
                >
                  {link.label}
                  {link.badge !== undefined && (
                    <span className="font-pixel text-[8px] px-1.5 py-0.2 rounded-full bg-dusty-rose text-midnight-black font-bold">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Actions: Search, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/search"
                aria-label="Search movies and series"
                className="p-2 rounded-full text-warm-cream/80 hover:text-soft-blush hover:bg-charcoal-plum/80 border border-transparent hover:border-deep-cherry transition-all duration-150"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Profile Avatar Button */}
              <button
                onClick={() => setIsProfileOpen(true)}
                type="button"
                aria-label="Open Mahi's Profile Pass"
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-charcoal-plum border border-deep-cherry hover:border-dusty-rose/60 transition-all duration-200 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-deep-cherry flex items-center justify-center overflow-hidden border border-dusty-rose/40">
                  <KuromiMascot className="w-5 h-5 text-soft-blush group-hover:rotate-6 transition-transform" />
                </div>
                <span className="hidden sm:inline font-pixel text-[9px] text-soft-blush pixel-crisp">
                  MAHI
                </span>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                className="md:hidden p-2 rounded-lg text-warm-cream hover:text-soft-blush hover:bg-charcoal-plum transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-midnight-black/95 backdrop-blur-xl pt-20 px-6 pb-8 flex flex-col justify-between animate-fadeIn">
          <div className="space-y-4">
            <div className="pb-3 border-b border-deep-cherry flex items-center justify-between">
              <span className="font-pixel text-[10px] text-soft-blush pixel-crisp">
                LOUNGE NAVIGATION
              </span>
              <PixelBadge variant="pink" size="xs">
                10.10 EDITION
              </PixelBadge>
            </div>

            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl font-sans text-base font-medium flex items-center justify-between transition-colors ${isActive
                      ? 'bg-deep-cherry text-soft-blush border border-dusty-rose/50 font-semibold'
                      : 'text-warm-cream hover:bg-charcoal-plum'
                    }`
                  }
                >
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="font-pixel text-[9px] px-2 py-0.5 rounded-full bg-dusty-rose text-midnight-black font-bold">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              ))}

              <NavLink
                to="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl font-sans text-base font-medium flex items-center gap-3 transition-colors ${isActive
                    ? 'bg-deep-cherry text-soft-blush border border-dusty-rose/50'
                    : 'text-warm-cream hover:bg-charcoal-plum'
                  }`
                }
              >
                <Search className="w-5 h-5 text-dusty-rose" />
                <span>Search Catalog</span>
              </NavLink>
            </nav>
          </div>

          <div className="pt-6 border-t border-deep-cherry/60 text-center">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsProfileOpen(true);
              }}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-charcoal-plum border border-deep-cherry flex items-center justify-center gap-2 text-sm text-soft-blush font-sans mb-3"
            >
              <Heart className="w-4 h-4 fill-dusty-rose text-dusty-rose" />
              <span>View Mahi's Lounge Pass</span>
            </button>
            <p className="font-handwritten text-base text-muted-mauve">
              “For my Mother Teresa ♡”
            </p>
          </div>
        </div>
      )}

      {/* Profile Pass Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};
