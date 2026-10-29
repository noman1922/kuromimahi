import React from 'react';
import { X, Calendar, Sparkles, Heart, Film } from 'lucide-react';
import { KuromiMascot, TinySkull } from '../common/KuromiDecorations';
import { PixelBadge } from '../common/PixelBadge';
import { useFavorites } from '../../context/useFavorites';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { favorites } = useFavorites();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-charcoal-plum border border-deep-cherry rounded-2xl shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-dusty-rose/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close profile card"
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted-mauve hover:text-warm-cream hover:bg-deep-cherry/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Card Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-deep-cherry/70 border-2 border-dusty-rose/50 flex items-center justify-center shadow-cherry-glow overflow-hidden">
              <KuromiMascot className="w-11 h-11" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <span className="w-4 h-4 rounded-full bg-soft-blush border-2 border-charcoal-plum flex items-center justify-center text-[8px] text-midnight-black font-bold">
                ★
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-warm-cream">
                Mahi
              </h3>
              <PixelBadge variant="pink" size="xs">
                VIP LOUNGE
              </PixelBadge>
            </div>
            <p className="font-handwritten text-base text-soft-blush">
              For my Mother Teresa ♡
            </p>
          </div>
        </div>

        {/* Lounge Pass Info */}
        <div className="space-y-3 bg-midnight-black/60 rounded-xl p-4 border border-deep-cherry/50 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-mauve flex items-center gap-1.5 font-sans">
              <Calendar className="w-3.5 h-3.5 text-dusty-rose" />
              Lounge Pass
            </span>
            <span className="font-pixel text-[10px] text-soft-blush pixel-crisp">
              VIP ACCESS
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-mauve flex items-center gap-1.5 font-sans">
              <Sparkles className="w-3.5 h-3.5 text-dusty-rose" />
              Lounge Spirit
            </span>
            <span className="font-sans font-medium text-warm-cream flex items-center gap-1">
              Kuromi Mischief
              <TinySkull className="text-dusty-rose w-3 h-3" />
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-mauve flex items-center gap-1.5 font-sans">
              <Heart className="w-3.5 h-3.5 text-dusty-rose" />
              Saved in My List
            </span>
            <span className="font-sans font-medium text-warm-cream">
              {favorites.length} Titles
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-mauve flex items-center gap-1.5 font-sans">
              <Film className="w-3.5 h-3.5 text-dusty-rose" />
              TMDB Database
            </span>
            <span className="font-pixel text-[9px] text-soft-blush pixel-crisp">
              LIVE METADATA
            </span>
          </div>
        </div>

        {/* Small personal footer note */}
        <div className="text-center pt-1 border-t border-deep-cherry/30">
          <p className="font-handwritten text-base text-muted-mauve">
            “Even Mother Teresa deserves a movie night.”
          </p>
        </div>
      </div>
    </div>
  );
};
