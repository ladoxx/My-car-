'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface KiaRayVisualProps {
  customImageUrl?: string;
  isAvailable?: boolean;
}

export default function KiaRayVisual({ customImageUrl, isAvailable = true }: KiaRayVisualProps) {
  const imageSource = customImageUrl && customImageUrl.trim() !== '' 
    ? customImageUrl 
    : '/kia-ray-car-cut.jpg';

  return (
    <div className="relative w-full max-w-[390px] mx-auto flex flex-col items-center select-none pt-1 pb-2">
      {/* Background radial neon halo glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-56 rounded-full blur-3xl pointer-events-none opacity-50 transition-colors duration-700"
        style={{
          background: isAvailable
            ? 'radial-gradient(circle, rgba(163, 245, 66, 0.4) 0%, rgba(37, 211, 102, 0.2) 45%, transparent 75%)'
            : 'radial-gradient(circle, rgba(234, 179, 8, 0.35) 0%, transparent 70%)',
        }}
      />

      {/* Cinematic Vehicle Display Box - Guaranteed 100% Centered */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full h-[220px] sm:h-[250px] flex items-center justify-center rounded-3xl overflow-hidden p-3 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
      >
        <img
          src={imageSource}
          alt="Kia Ray (기아 레이)"
          className="max-w-full max-h-full w-auto h-auto object-contain object-center drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] transform hover:scale-[1.03] transition-transform duration-500 mx-auto my-auto"
        />

        {/* Subtle bottom fade into the dark background */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#06080A] via-[#06080A]/40 to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
}
