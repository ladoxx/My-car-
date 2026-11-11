import React from 'react';

export function KiaRayBrand({ className = 'h-6' }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Modern KIA geometric logo */}
      <svg
        viewBox="0 0 110 32"
        className="h-full w-auto fill-current text-white"
        aria-label="KIA"
      >
        {/* Modern connected KIA wordmark */}
        <path d="M 0 30 L 12 2 L 20 2 L 8 30 Z" />
        <path d="M 12 2 L 28 2 L 24 10 L 15 10 Z" />
        <path d="M 17 14 L 32 30 L 22 30 L 10 18 Z" />
        {/* I */}
        <path d="M 33 2 L 40 2 L 27 30 L 20 30 Z" />
        {/* A */}
        <path d="M 40 2 L 53 2 L 40 30 L 32 30 Z" />
        <path d="M 53 2 L 66 30 L 57 30 L 48 10 Z" />
        <path d="M 41 18 L 57 18 L 54 24 L 38 24 Z" />
      </svg>

      {/* Styled Ray script in electric green */}
      <span
        className="text-[#A3F542] font-black italic tracking-wide text-lg sm:text-xl font-serif select-none drop-shadow-[0_0_12px_rgba(163,245,66,0.6)]"
        style={{
          fontFamily: '"Brush Script MT", "Caveat", "Segoe Script", cursive, sans-serif',
          transform: 'skewX(-10deg)',
        }}
      >
        Ray
      </span>
    </div>
  );
}

export function CarOutlineIcon({ className = 'w-10 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 70 28"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Sleek roofline and hood profile */}
      <path d="M 4 22 C 8 22, 14 20, 20 18 L 30 7 C 36 6, 46 6, 54 11 L 64 18 C 67 19, 68 22, 65 22 Z" />
      <path d="M 12 22 A 4 4 0 0 0 20 22" />
      <path d="M 48 22 A 4 4 0 0 0 56 22" />
      <path d="M 31 9 L 45 9 L 52 16 L 31 16 Z" />
    </svg>
  );
}

export function HandshakeIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2-2" />
      <path d="m14 14 2.5 2.5a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L16 9" />
      <path d="m3 11 2.8-2.8a1 1 0 0 1 1.4 0L10 11" />
      <path d="m6.5 14.5 3-3" />
      <path d="m3 18 3-3" />
      <path d="m10 18 3.5-3.5" />
      <path d="M2 13h4" />
      <path d="M18 11h4" />
    </svg>
  );
}
