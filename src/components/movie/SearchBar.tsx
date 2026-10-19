import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { TinySkull } from '../common/KuromiDecorations';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search titles, genres, or directors...',
  className = '',
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-4 pointer-events-none text-muted-mauve flex items-center gap-1.5">
        <Search className="w-4 h-4 text-dusty-rose" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-charcoal-plum border border-deep-cherry rounded-xl pl-11 pr-12 py-3 text-sm text-warm-cream placeholder:text-muted-mauve/60 focus:outline-none focus:border-dusty-rose focus:ring-1 focus:ring-dusty-rose/40 transition-all font-sans shadow-inner"
      />

      {value && (
        <button
          onClick={handleClear}
          type="button"
          aria-label="Clear search query"
          className="absolute right-4 p-1 rounded-full text-muted-mauve hover:text-warm-cream hover:bg-deep-cherry/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {!value && (
        <div className="absolute right-4 hidden sm:flex items-center gap-1 pointer-events-none text-muted-mauve/50 font-pixel text-[8px]">
          <span>MAHI</span>
          <TinySkull className="text-dusty-rose/50" />
        </div>
      )}
    </div>
  );
};

