import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../../context/useFavorites';

interface FavoriteButtonProps {
  movieId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  movieId,
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(movieId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(movieId);
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const paddingSizes = {
    sm: 'p-1.5',
    md: 'p-2.5',
    lg: 'p-3',
  }[size];

  return (
    <button
      onClick={handleClick}
      type="button"
      aria-label={favorited ? 'Remove from My List' : 'Add to My List'}
      title={favorited ? 'In My List' : 'Add to My List'}
      className={`inline-flex items-center justify-center gap-2 rounded-full border transition-all duration-200 backdrop-blur-md active:scale-90 ${paddingSizes} ${
        favorited
          ? 'bg-deep-cherry/90 border-dusty-rose text-soft-blush shadow-goth-glow'
          : 'bg-midnight-black/75 border-deep-cherry/60 text-muted-mauve hover:text-soft-blush hover:border-dusty-rose/60 hover:bg-charcoal-plum'
      } ${className}`}
    >
      <Heart
        className={`${iconSizes} transition-transform duration-200 ${
          favorited ? 'fill-current scale-110' : 'stroke-[1.75]'
        }`}
      />
      {showLabel && (
        <span className="text-xs font-medium font-sans pr-1">
          {favorited ? 'In My List' : 'Add to List'}
        </span>
      )}
    </button>
  );
};
