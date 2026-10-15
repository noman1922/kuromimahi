import React from 'react';
import { GENRE_LIST } from '../../data/movies';

interface GenreFilterProps {
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  className?: string;
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  selectedGenre,
  onSelectGenre,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto no-scrollbar py-2 ${className}`}
    >
      {GENRE_LIST.map((genre) => {
        const isSelected = selectedGenre === genre;
        return (
          <button
            key={genre}
            onClick={() => onSelectGenre(genre)}
            type="button"
            className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-medium whitespace-nowrap transition-all duration-200 border ${
              isSelected
                ? 'bg-deep-cherry text-soft-blush border-dusty-rose shadow-goth-glow scale-105'
                : 'bg-charcoal-plum/70 text-muted-mauve border-deep-cherry/70 hover:text-warm-cream hover:border-dusty-rose/40'
            }`}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
};

