import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  ArrowRight,
  SlidersHorizontal,
  LayoutGrid,
  GitCommit,
  Keyboard,
  Calendar,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Era } from '../types';

interface TimelineControlsProps {
  currentYearCenter: number;
  pixelsPerYear: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onJumpToPresent: () => void;
  onJumpToYear: (year: number) => void;
  onSelectEra: (eraId: string) => void;
  eras: Era[];
  viewMode: 'timeline' | 'gallery';
  onToggleViewMode: (mode: 'timeline' | 'gallery') => void;
  onOpenKeyboardShortcuts: () => void;
  totalGamesCount: number;
  filteredGamesCount: number;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  currentYearCenter,
  pixelsPerYear,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onJumpToPresent,
  onJumpToYear,
  onSelectEra,
  eras,
  viewMode,
  onToggleViewMode,
  onOpenKeyboardShortcuts,
  totalGamesCount,
  filteredGamesCount,
}) => {
  const [yearInput, setYearInput] = useState('');
  const [isEraMenuOpen, setIsEraMenuOpen] = useState(false);

  const handleYearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(yearInput, 10);
    if (!isNaN(parsed) && parsed >= 1945 && parsed <= 2035) {
      onJumpToYear(parsed);
      setYearInput('');
    }
  };

  return (
    <div className="w-full bg-neutral-900/90 border-b border-neutral-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
      {/* Left side: View Mode Toggle & Era Quick Navigation */}
      <div className="flex items-center flex-wrap gap-3">
        {/* View mode switcher */}
        <div className="flex items-center bg-neutral-950 p-1 rounded-xs border border-neutral-800">
          <button
            onClick={() => onToggleViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-colors ${
              viewMode === 'timeline'
                ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Interactive Canvas Timeline"
          >
            <GitCommit className="w-3.5 h-3.5 text-amber-400" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => onToggleViewMode('gallery')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-colors ${
              viewMode === 'gallery'
                ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Museum Exhibition Hall (Chronological Grid)"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />
            <span>Exhibition Hall</span>
          </button>
        </div>

        {/* Quick Era Jump Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsEraMenuOpen(!isEraMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xs bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 transition-colors"
          >
            <span>Jump to Era</span>
            <ChevronDown className="w-3 h-3 text-neutral-500" />
          </button>

          {isEraMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-neutral-900 border border-neutral-750 shadow-2xl rounded-xs py-1 z-50">
              {eras.map(era => (
                <button
                  key={era.id}
                  onClick={() => {
                    onSelectEra(era.id);
                    setIsEraMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-800/80 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] text-neutral-500 block">{era.subtitle}</span>
                    <span className="text-xs text-neutral-200 group-hover:text-amber-400 block font-sans font-medium">
                      {era.name}
                    </span>
                  </div>
                  <span
                    style={{ backgroundColor: era.accentColor }}
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year jump input */}
        <form onSubmit={handleYearSubmit} className="flex items-center">
          <input
            type="number"
            min="1947"
            max="2030"
            placeholder="Year (e.g. 1996)"
            value={yearInput}
            onChange={e => setYearInput(e.target.value)}
            className="w-28 px-2.5 py-1.5 rounded-l-xs bg-neutral-950 border border-neutral-800 focus:border-amber-400 focus:outline-hidden text-neutral-200 placeholder:text-neutral-600 text-xs"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 rounded-r-xs bg-neutral-800 hover:bg-neutral-750 border-y border-r border-neutral-800 text-neutral-300 transition-colors"
            title="Go to year"
          >
            Go
          </button>
        </form>
      </div>

      {/* Right side: Zoom Buttons, Jump to Present, Shortcuts */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Count Indicator */}
        <div className="text-neutral-500 mr-2 text-[11px] hidden sm:block">
          Showing <span className="text-neutral-300 font-bold">{filteredGamesCount}</span> of {totalGamesCount} exhibits
        </div>

        {/* Zoom In */}
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-xs bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-xs bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Reset Zoom */}
        <button
          onClick={onResetZoom}
          className="p-1.5 rounded-xs bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 transition-colors"
          title="Reset Zoom Scale"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Return to Present */}
        <button
          onClick={onJumpToPresent}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 transition-colors font-semibold"
          title="Jump to Present Era (2026)"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Present (2026)</span>
        </button>

        {/* Keyboard shortcut guide */}
        <button
          onClick={onOpenKeyboardShortcuts}
          className="p-1.5 rounded-xs bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
          title="Keyboard Navigation Shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
