import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Film, Tv, Heart, Search } from 'lucide-react';
import { useFavorites } from '../../context/useFavorites';

export const MobileNavigation: React.FC = () => {
  const { favorites } = useFavorites();

  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/movies', label: 'Movies', icon: Film },
    { to: '/series', label: 'Series', icon: Tv },
    {
      to: '/my-list',
      label: 'My List',
      icon: Heart,
      badge: favorites.length > 0 ? favorites.length : undefined,
    },
    { to: '/search', label: 'Search', icon: Search },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-midnight-black/95 backdrop-blur-lg border-t border-deep-cherry/80 px-2 py-1.5 shadow-2xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-sans transition-all duration-150 relative min-w-[56px] min-h-[48px] ${
                  isActive
                    ? 'text-soft-blush font-semibold'
                    : 'text-muted-mauve hover:text-warm-cream'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-transform ${
                        isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.5]'
                      }`}
                    />
                    {item.badge !== undefined && (
                      <span className="absolute -top-1 -right-2.5 font-pixel text-[7px] min-w-[14px] h-[14px] px-1 rounded-full bg-dusty-rose text-midnight-black font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="mt-1 tracking-tight">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-dusty-rose mt-0.5" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
