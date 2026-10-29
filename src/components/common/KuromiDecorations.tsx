import React from 'react';

// Two-pointed Kuromi silhouette icon / mascot mark
export const KuromiMascot: React.FC<{
  className?: string;
  size?: number;
  variant?: 'outline' | 'filled' | 'detailed';
}> = ({ className = 'w-6 h-6', size, variant = 'detailed' }) => {
  const style = size ? { width: size, height: size } : undefined;

  if (variant === 'outline') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={style}
        aria-hidden="true"
      >
        {/* Pointed jester ears */}
        <path
          d="M14 26 C9 10 17 5 23 16 C25 21 24 26 24 26"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="13" cy="11" r="3.5" fill="currentColor" />
        <path
          d="M50 26 C55 10 47 5 41 16 C39 21 40 26 40 26"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="51" cy="11" r="3.5" fill="currentColor" />
        {/* Head outline */}
        <path
          d="M16 35 C14 46 22 54 32 54 C42 54 50 46 48 35 C48 27 40 26 32 26 C24 26 16 27 16 35 Z"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Center skull symbol */}
        <circle cx="32" cy="33" r="4.5" fill="currentColor" />
        <circle cx="30.5" cy="32.5" r="1" fill="#100C12" />
        <circle cx="33.5" cy="32.5" r="1" fill="#100C12" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Background shadow/glow filter */}
      <defs>
        <radialGradient id="kuromiGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C86F91" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#C86F91" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Pointed jester ears (signature Kuromi silhouette) */}
      <path
        d="M12 28 C7 10 17 5 23 17 C25 22 23 28 23 28"
        fill="#1D1420"
        stroke="#C86F91"
        strokeWidth="2"
      />
      <circle cx="12" cy="10" r="3.5" fill="#F1B6CD" />
      <circle cx="12" cy="10" r="1.5" fill="#FFFFFF" />

      <path
        d="M52 28 C57 10 47 5 41 17 C39 22 41 28 41 28"
        fill="#1D1420"
        stroke="#C86F91"
        strokeWidth="2"
      />
      <circle cx="52" cy="10" r="3.5" fill="#F1B6CD" />
      <circle cx="52" cy="10" r="1.5" fill="#FFFFFF" />

      {/* Main Face Shape */}
      <path
        d="M15 35 C13 47 21 55 32 55 C43 55 51 47 49 35 C49 26 40 25 32 25 C24 25 15 26 15 35 Z"
        fill="#1D1420"
        stroke="#351726"
        strokeWidth="2"
      />

      {/* Signature cute skull on forehead */}
      <circle cx="32" cy="31" r="5" fill="#F6EBDD" />
      <circle cx="30" cy="30.5" r="1.2" fill="#100C12" />
      <circle cx="34" cy="30.5" r="1.2" fill="#100C12" />
      <path d="M30.5 33.5 L30.5 35 M32 33.5 L32 35 M33.5 33.5 L33.5 35" stroke="#100C12" strokeWidth="0.8" strokeLinecap="round" />

      {/* Big anime eyes */}
      <ellipse cx="24" cy="40" rx="3.5" ry="4.5" fill="#F1B6CD" />
      <ellipse cx="40" cy="40" rx="3.5" ry="4.5" fill="#F1B6CD" />
      {/* Eye highlights */}
      <circle cx="23" cy="39" r="1.5" fill="#FFFFFF" />
      <circle cx="39" cy="39" r="1.5" fill="#FFFFFF" />
      <circle cx="25" cy="42" r="0.8" fill="#FFFFFF" />
      <circle cx="41" cy="42" r="0.8" fill="#FFFFFF" />

      {/* Cute little mouth */}
      <path d="M30 46 Q32 48 34 46" stroke="#F1B6CD" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Subtle cheeks blush */}
      <circle cx="19" cy="43" r="2.5" fill="#C86F91" fillOpacity="0.5" />
      <circle cx="45" cy="43" r="2.5" fill="#C86F91" fillOpacity="0.5" />
    </svg>
  );
};

// Tiny skull motif for borders, badges, and accents
export const TinySkull: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-3.5 h-3.5',
  size,
}) => {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <circle cx="8" cy="7" r="5.5" fill="currentColor" />
      <rect x="5.5" y="10.5" width="5" height="3" rx="1" fill="currentColor" />
      {/* Eye sockets */}
      <circle cx="6.2" cy="6.8" r="1.2" fill="#100C12" />
      <circle cx="9.8" cy="6.8" r="1.2" fill="#100C12" />
      {/* Nose */}
      <path d="M8 8.8 L7.4 9.6 L8.6 9.6 Z" fill="#100C12" />
      {/* Teeth cuts */}
      <line x1="6.8" y1="12" x2="6.8" y2="13.2" stroke="#100C12" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="9.2" y1="12" x2="9.2" y2="13.2" stroke="#100C12" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
};

// Cute Gothic Star / Sparkle
export const GothStar: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-4 h-4 text-dusty-rose',
  size,
}) => {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M12 0C12 7 7 12 0 12C7 12 12 17 12 24C12 17 17 12 24 12C17 12 12 7 12 0Z" />
    </svg>
  );
};

// Cute ribbon / bow SVG detail
export const CuteBow: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-5 h-4 text-dusty-rose',
  size,
}) => {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 32 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Left loop */}
      <path d="M16 11 C11 5 3 6 4 12 C5 17 12 15 16 13 Z" fill="currentColor" fillOpacity="0.9" />
      {/* Right loop */}
      <path d="M16 11 C21 5 29 6 28 12 C27 17 20 15 16 13 Z" fill="currentColor" fillOpacity="0.9" />
      {/* Center knot */}
      <ellipse cx="16" cy="12" rx="3.5" ry="3" fill="#F1B6CD" />
      {/* Ribbons */}
      <path d="M14 14 C12 18 10 22 9 24 C11 22 13 21 15 17 Z" fill="currentColor" />
      <path d="M18 14 C20 18 22 22 23 24 C21 22 19 21 17 17 Z" fill="currentColor" />
    </svg>
  );
};

// Signature Lounge Stamp for Mahi
export const BirthdayStamp: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-dusty-rose/40 bg-deep-cherry/40 shadow-pixel-tag backdrop-blur-sm group select-none ${className}`}
      title="Mahi's Private Lounge Edition"
    >
      <TinySkull className="text-soft-blush group-hover:rotate-12 transition-transform duration-200" />
      <span className="font-pixel text-[9px] tracking-wider text-soft-blush pixel-crisp">
        MAHI
      </span>
      <span className="text-[10px] text-dusty-rose font-handwritten">★ special</span>
    </div>
  );
};

