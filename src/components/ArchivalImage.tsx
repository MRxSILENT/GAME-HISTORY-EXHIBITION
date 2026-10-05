import React, { useState } from 'react';
import { Layers, Disc, Tv } from 'lucide-react';

interface ArchivalImageProps {
  src: string | null | undefined;
  alt: string;
  year?: number;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'custom';
}

export const ArchivalImage: React.FC<ArchivalImageProps> = ({
  src,
  alt,
  year,
  className = 'w-full h-full object-cover',
  containerClassName = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center p-3 text-center select-none overflow-hidden relative ${containerClassName}`}
      >
        {/* Subtle background scanlines / retro circuit design */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/30 via-transparent to-neutral-950/60 pointer-events-none" />
        <div className="relative z-10 space-y-1.5 max-w-full">
          <div className="w-8 h-8 rounded-xs bg-neutral-800 border border-neutral-700 mx-auto flex items-center justify-center text-amber-400">
            <Tv className="w-4 h-4" />
          </div>
          <div className="text-[10px] font-mono text-amber-400 font-bold block truncate px-1">
            {year || 'EXHIBIT'}
          </div>
          <div className="text-[11px] font-semibold text-neutral-300 line-clamp-2 px-1 leading-tight font-sans">
            {alt}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-neutral-950 ${containerClassName}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center">
          <span className="text-[10px] font-mono text-neutral-600">{year || ''}</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};
