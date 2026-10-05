import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Game, Era, Milestone, TimelineZoomLevel } from '../types';
import { getEraForYear } from '../services/dataLoader';
import { Sparkles, Calendar, Layers, ExternalLink, Info, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { ArchivalImage } from './ArchivalImage';

interface TimelineCanvasProps {
  games: Game[];
  milestones: Milestone[];
  eras: Era[];
  selectedGame: Game | null;
  selectedMilestone: Milestone | null;
  onSelectGame: (game: Game) => void;
  onSelectMilestone: (milestone: Milestone) => void;
  currentYearCenter: number;
  pixelsPerYear: number;
  onCameraChange: (yearCenter: number, pixelsPerYear: number) => void;
}

export const TimelineCanvas: React.FC<TimelineCanvasProps> = ({
  games,
  milestones,
  eras,
  selectedGame,
  selectedMilestone,
  onSelectGame,
  onSelectMilestone,
  currentYearCenter,
  pixelsPerYear,
  onCameraChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialYearCenter, setInitialYearCenter] = useState(currentYearCenter);
  const [hoveredGame, setHoveredGame] = useState<Game | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<Milestone | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Multi-touch tracking for mobile pinch-to-zoom
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartPpyRef = useRef<number>(pixelsPerYear);

  // Determine current zoom level category for Level of Detail (LOD)
  const getZoomLevel = useCallback((): TimelineZoomLevel => {
    if (pixelsPerYear < 25) return 'era';
    if (pixelsPerYear < 65) return 'decade';
    if (pixelsPerYear < 140) return 'year';
    return 'deep';
  }, [pixelsPerYear]);

  const lod = getZoomLevel();

  // Helper to convert year to screen X pixel coordinate
  const yearToX = useCallback(
    (year: number, containerWidth: number): number => {
      const deltaYears = year - currentYearCenter;
      return containerWidth / 2 + deltaYears * pixelsPerYear;
    },
    [currentYearCenter, pixelsPerYear]
  );

  // Helper to convert screen X to year
  const xToYear = useCallback(
    (x: number, containerWidth: number): number => {
      const deltaPixels = x - containerWidth / 2;
      return currentYearCenter + deltaPixels / pixelsPerYear;
    },
    [currentYearCenter, pixelsPerYear]
  );

  // Wheel handling: zoom centered on mouse cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;

    // Year currently under cursor before zoom
    const yearUnderCursor = xToYear(cursorX, rect.width);

    // Zoom multiplier
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    const newPpy = Math.max(12, Math.min(450, pixelsPerYear * factor));

    // Calculate new yearCenter so that the year under cursor stays under the cursor
    const newYearCenter = yearUnderCursor - (cursorX - rect.width / 2) / newPpy;
    const clampedYear = Math.max(1945, Math.min(2035, newYearCenter));

    onCameraChange(clampedYear, newPpy);
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on left click
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setInitialYearCenter(currentYearCenter);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dYears = dx / pixelsPerYear;
    const newCenter = Math.max(1945, Math.min(2035, initialYearCenter - dYears));
    onCameraChange(newCenter, pixelsPerYear);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStartX(e.touches[0].clientX);
      setInitialYearCenter(currentYearCenter);
      touchStartDistRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartPpyRef.current = pixelsPerYear;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartX;
      const dYears = dx / pixelsPerYear;
      const newCenter = Math.max(1945, Math.min(2035, initialYearCenter - dYears));
      onCameraChange(newCenter, pixelsPerYear);
    } else if (e.touches.length === 2 && touchStartDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartDistRef.current;
      const newPpy = Math.max(12, Math.min(450, touchStartPpyRef.current * ratio));
      onCameraChange(currentYearCenter, newPpy);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  // Group items by year to prevent vertical overlap collisions
  const containerWidth = containerRef.current?.clientWidth || 1200;

  // Generate ticks for the ruler: 1945 to 2030
  const ticks: Array<{ year: number; isDecade: boolean; x: number }> = [];
  const startDecade = 1945;
  const endDecade = 2030;
  for (let y = startDecade; y <= endDecade; y++) {
    const x = yearToX(y, containerWidth);
    if (x >= -100 && x <= containerWidth + 100) {
      ticks.push({
        year: y,
        isDecade: y % 10 === 0,
        x,
      });
    }
  }

  // Pre-calculate vertical placement tracks for games to distribute them neatly above and below axis
  // We distribute games across 5 horizontal bands (tracks)
  const gameTrackMap = new Map<string, number>();
  const yearBucketCounts = new Map<number, number>();
  games.forEach(game => {
    const count = yearBucketCounts.get(game.releaseYear) || 0;
    yearBucketCounts.set(game.releaseYear, count + 1);
    // Alternate tracks: 0, 1, 2, 3, 4
    gameTrackMap.set(game.id, count % 4);
  });

  // Identify visible games and milestones within viewport
  const visibleGames = games.filter(g => {
    const x = yearToX(g.releaseYear, containerWidth);
    return x >= -200 && x <= containerWidth + 200;
  });

  const visibleMilestones = milestones.filter(m => {
    const x = yearToX(m.year, containerWidth);
    return x >= -100 && x <= containerWidth + 100;
  });

  // Track lines in the upper / lower zone
  // Axis is at ~45% from the top
  const axisY = 240;

  const currentEra = getEraForYear(Math.round(currentYearCenter), eras);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-[620px] select-none overflow-hidden bg-neutral-950 border-y border-neutral-850 cursor-grab ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
    >
      {/* Background Era Color Bands */}
      <div className="absolute inset-0 pointer-events-none">
        {eras.map(era => {
          const startX = yearToX(era.startYear, containerWidth);
          const endX = yearToX(era.endYear + 1, containerWidth);
          const width = endX - startX;
          if (endX < -200 || startX > containerWidth + 200) return null;

          return (
            <div
              key={era.id}
              style={{
                left: `${startX}px`,
                width: `${width}px`,
                borderLeft: '1px dashed rgba(255, 255, 255, 0.08)',
              }}
              className="absolute inset-y-0 bg-gradient-to-b from-neutral-900/40 via-transparent to-neutral-900/20"
            >
              {/* Era Watermark Label */}
              <div className="sticky left-4 top-4 px-3 py-1.5 opacity-40 hover:opacity-80 transition-opacity">
                <span
                  style={{ color: era.accentColor }}
                  className="text-[10px] font-mono uppercase tracking-widest block font-bold"
                >
                  {era.subtitle}
                </span>
                <span className="text-xs font-display font-semibold text-neutral-300 block truncate max-w-[200px]">
                  {era.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Center Time Axis Line */}
      <div
        style={{ top: `${axisY}px` }}
        className="absolute left-0 right-0 h-px bg-neutral-800 pointer-events-none z-10"
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-neutral-650 to-transparent" />
      </div>

      {/* Year Ticks & Numbers along Axis */}
      <div
        style={{ top: `${axisY}px` }}
        className="absolute inset-x-0 h-12 pointer-events-none z-10"
      >
        {ticks.map(tick => {
          // If zoomed out, only show decades
          if (lod === 'era' && !tick.isDecade) return null;
          if (lod === 'decade' && !tick.isDecade && tick.year % 5 !== 0) return null;

          return (
            <div
              key={tick.year}
              style={{ left: `${tick.x}px` }}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
            >
              <div
                className={`w-px ${
                  tick.isDecade
                    ? 'h-4 bg-neutral-400'
                    : tick.year % 5 === 0
                    ? 'h-2.5 bg-neutral-600'
                    : 'h-1.5 bg-neutral-800'
                }`}
              />
              {(tick.isDecade || lod === 'year' || lod === 'deep') && (
                <span
                  className={`mt-1 font-mono text-[10px] tracking-tight ${
                    tick.isDecade
                      ? 'text-neutral-300 font-bold'
                      : 'text-neutral-500 font-normal'
                  }`}
                >
                  {tick.year}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Present Day Indicator (2026) */}
      {(() => {
        const x2026 = yearToX(2026, containerWidth);
        if (x2026 >= -100 && x2026 <= containerWidth + 100) {
          return (
            <div
              style={{ left: `${x2026}px` }}
              className="absolute inset-y-0 w-px bg-amber-400/60 pointer-events-none z-20 flex flex-col justify-start items-center"
            >
              <div className="mt-2 px-2 py-0.5 rounded-xs bg-amber-500 text-neutral-950 font-mono text-[9px] font-bold tracking-wider uppercase shadow-md">
                PRESENT (2026)
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Historical Milestones (Diamonds ◆) */}
      <div className="absolute inset-0 pointer-events-auto z-20">
        {visibleMilestones.map(m => {
          const x = yearToX(m.year, containerWidth);
          // Position milestones slightly above the axis line
          const y = axisY - 32;
          const isSelected = selectedMilestone?.id === m.id;

          return (
            <div
              key={m.id}
              style={{ left: `${x}px`, top: `${y}px` }}
              onClick={e => {
                e.stopPropagation();
                onSelectMilestone(m);
              }}
              onMouseEnter={e => {
                setHoveredMilestone(m);
                setHoverPos({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHoveredMilestone(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            >
              {/* Milestone Marker Diamond */}
              <div
                className={`w-5 h-5 rotate-45 border flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-amber-400 border-amber-300 scale-125 shadow-lg shadow-amber-500/50'
                    : 'bg-neutral-900 border-sky-400/80 hover:bg-sky-500/20 hover:border-sky-300 hover:scale-110'
                }`}
              >
                <div className="w-1.5 h-1.5 bg-sky-300 rounded-full" />
              </div>

              {/* Text label when zoomed in or on hover */}
              {(lod === 'year' || lod === 'deep') && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-6 pointer-events-none whitespace-nowrap text-center opacity-85 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-mono text-sky-400 block font-semibold leading-none">
                    ◆ {m.year}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-200 block truncate max-w-[150px]">
                    {m.title}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Game Nodes & Cards (●) */}
      <div className="absolute inset-0 pointer-events-auto z-30">
        {visibleGames.map((game, idx) => {
          const x = yearToX(game.releaseYear, containerWidth);
          const track = gameTrackMap.get(game.id) || 0;
          const isSelected = selectedGame?.id === game.id;

          // Distribute tracks: track 0 and 1 above axis, track 2 and 3 below axis
          let y = axisY;
          if (track === 0) y = axisY - 95;
          else if (track === 1) y = axisY - 175;
          else if (track === 2) y = axisY + 75;
          else if (track === 3) y = axisY + 155;

          // If zoomed far out (LOD = era), only render dots for featured games to maintain performance
          if (lod === 'era' && !game.featured && idx % 3 !== 0) {
            return null;
          }

          return (
            <div
              key={game.id}
              style={{ left: `${x}px`, top: `${y}px` }}
              onClick={e => {
                e.stopPropagation();
                onSelectGame(game);
              }}
              onMouseEnter={e => {
                setHoveredGame(game);
                setHoverPos({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHoveredGame(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            >
              {/* Connecting line to central timeline axis */}
              <div
                style={{
                  height: `${Math.abs(y - axisY)}px`,
                  top: y < axisY ? '100%' : 'auto',
                  bottom: y > axisY ? '100%' : 'auto',
                }}
                className="absolute left-1/2 -translate-x-1/2 w-px bg-neutral-800 group-hover:bg-amber-400/50 transition-colors pointer-events-none"
              />

              {/* Deep Zoom or Year Zoom: Full Mini-Card Exhibit */}
              {lod === 'deep' ? (
                <div
                  className={`w-44 p-2 rounded-xs border transition-all duration-150 backdrop-blur-md flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-neutral-900 border-amber-400 ring-2 ring-amber-400/20 shadow-xl shadow-amber-500/10'
                      : 'bg-neutral-950/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div className="w-10 h-12 bg-neutral-900 rounded-xs overflow-hidden shrink-0 border border-neutral-800 flex items-center justify-center">
                    <ArchivalImage
                      src={game.imageUrl}
                      alt={game.title}
                      year={game.releaseYear}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[9px] font-mono text-amber-400/90 block leading-tight">
                      {game.releaseYear}
                    </span>
                    <span className="text-xs font-semibold text-neutral-100 block truncate leading-tight group-hover:text-amber-400 transition-colors">
                      {game.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 block truncate leading-tight mt-0.5">
                      {game.developer}
                    </span>
                  </div>
                </div>
              ) : lod === 'year' ? (
                /* Year Level: Compact Pill Capsule with Cover Thumbnail */
                <div
                  className={`px-2 py-1 rounded-xs border transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap backdrop-blur-sm ${
                    isSelected
                      ? 'bg-neutral-900 border-amber-400 text-amber-300 shadow-md'
                      : 'bg-neutral-950/85 border-neutral-800 hover:border-neutral-650 hover:bg-neutral-900 text-neutral-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-[11px] font-medium truncate max-w-[120px]">
                    {game.title}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500">
                    '{game.releaseYear.toString().slice(-2)}
                  </span>
                </div>
              ) : (
                /* High-level Decade/Era Zoom: Clean Glowing Node Point */
                <div
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-amber-400 border-amber-200 scale-150 shadow-lg shadow-amber-500/50'
                      : game.featured
                      ? 'bg-amber-500/80 border-amber-300 hover:scale-125'
                      : 'bg-neutral-800 border-neutral-600 hover:bg-neutral-700 hover:scale-125'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Cursor Tooltip Preview for hovered game or milestone */}
      {hoveredGame && hoverPos && (
        <div
          style={{
            left: `${Math.min(window.innerWidth - 300, hoverPos.x + 16)}px`,
            top: `${Math.min(window.innerHeight - 200, hoverPos.y + 16)}px`,
          }}
          className="fixed z-50 pointer-events-none p-3 rounded-xs bg-neutral-900/95 border border-neutral-750 text-neutral-200 shadow-2xl backdrop-blur-md max-w-xs space-y-1.5"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
            <span>RELEASED {hoveredGame.releaseYear}</span>
            <span>{hoveredGame.genres?.[0] || 'Game'}</span>
          </div>
          <div className="text-sm font-semibold text-neutral-100">{hoveredGame.title}</div>
          <div className="text-xs text-neutral-400 font-mono">
            {hoveredGame.developer} · {hoveredGame.platforms?.slice(0, 2).join(', ')}
          </div>
          <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
            {hoveredGame.description}
          </p>
          <div className="text-[10px] text-neutral-500 font-mono pt-1 border-t border-neutral-800 flex items-center justify-between">
            <span>Click to explore full history</span>
            <span>ID: {hoveredGame.id}</span>
          </div>
        </div>
      )}

      {hoveredMilestone && hoverPos && (
        <div
          style={{
            left: `${Math.min(window.innerWidth - 300, hoverPos.x + 16)}px`,
            top: `${Math.min(window.innerHeight - 200, hoverPos.y + 16)}px`,
          }}
          className="fixed z-50 pointer-events-none p-3 rounded-xs bg-neutral-900/95 border border-sky-500/50 text-neutral-200 shadow-2xl backdrop-blur-md max-w-xs space-y-1.5"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-sky-400">
            <span>HISTORICAL MILESTONE · {hoveredMilestone.year}</span>
            <span className="uppercase">{hoveredMilestone.category}</span>
          </div>
          <div className="text-sm font-semibold text-neutral-100">{hoveredMilestone.title}</div>
          <p className="text-[11px] text-neutral-400 line-clamp-3 leading-relaxed">
            {hoveredMilestone.historicalSignificance}
          </p>
          <div className="text-[10px] text-neutral-500 font-mono pt-1 border-t border-neutral-800">
            Click to view archival documents
          </div>
        </div>
      )}

      {/* Floating Bottom Left: Current Position HUD */}
      <div className="absolute bottom-4 left-6 z-20 pointer-events-none flex items-center gap-4 text-xs font-mono text-neutral-400">
        <div className="px-3 py-1.5 rounded-xs bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
          <span>CENTER: </span>
          <span className="text-neutral-100 font-bold">{Math.round(currentYearCenter)}</span>
        </div>
        {currentEra && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xs bg-neutral-900/80 border border-neutral-800 backdrop-blur-sm">
            <span
              style={{ backgroundColor: currentEra.accentColor }}
              className="w-2 h-2 rounded-full inline-block"
            />
            <span className="text-neutral-300">{currentEra.name}</span>
          </div>
        )}
        <div className="hidden md:block text-[11px] text-neutral-500">
          Scroll wheel / Pinch to zoom · Drag to pan time
        </div>
      </div>

      {/* Floating Bottom Right: Level of Detail indicator */}
      <div className="absolute bottom-4 right-6 z-20 pointer-events-none flex items-center gap-2 text-[11px] font-mono text-neutral-500">
        <span className="px-2 py-1 rounded-xs bg-neutral-900/80 border border-neutral-800 uppercase">
          LOD: {lod} ({Math.round(pixelsPerYear)} px/yr)
        </span>
      </div>
    </div>
  );
};
