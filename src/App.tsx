import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Game, Era, Milestone, TimelineFilter } from './types';
import { loadExhibitionData, filterExhibitionData, getEraForYear } from './services/dataLoader';
import { HeroExhibition } from './components/HeroExhibition';
import { TimelineCanvas } from './components/TimelineCanvas';
import { TimelineControls } from './components/TimelineControls';
import { SearchAndFilterBar } from './components/SearchAndFilterBar';
import { ExhibitionHall } from './components/ExhibitionHall';
import { GameDetailModal } from './components/GameDetailModal';
import { MilestoneDetailModal } from './components/MilestoneDetailModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { MuseumCuratorGuide } from './components/MuseumCuratorGuide';
import {
  Compass,
  Calendar,
  Sparkles,
  Layers,
  ArrowLeft,
  Info,
  GitCommit,
  LayoutGrid,
  ShieldCheck,
  Github
} from 'lucide-react';

export default function App() {
  const [inExhibition, setInExhibition] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [eras, setEras] = useState<Era[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  // Timeline camera state: initial center is present era (2026)
  const [currentYearCenter, setCurrentYearCenter] = useState<number>(2026);
  const [pixelsPerYear, setPixelsPerYear] = useState<number>(85);

  // View mode: 'timeline' canvas vs 'gallery' chronological exhibition hall
  const [viewMode, setViewMode] = useState<'timeline' | 'gallery'>('timeline');

  // Selected item modal states
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Search & Filtering
  const [filters, setFilters] = useState<TimelineFilter>({
    searchQuery: '',
    selectedEraId: null,
    selectedDecade: null,
    selectedGenre: null,
    selectedPlatform: null,
    selectedDeveloper: null,
    milestonesOnly: false,
    featuredOnly: false,
  });

  // Load exhibition dataset
  useEffect(() => {
    async function init() {
      try {
        const dataset = await loadExhibitionData();
        setGames(dataset.games);
        setEras(dataset.eras);
        setMilestones(dataset.milestones);
      } catch (err) {
        console.error('Failed to load dataset:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Filtered dataset
  const { filteredGames, filteredMilestones } = useMemo(() => {
    return filterExhibitionData(games, milestones, eras, filters);
  }, [games, milestones, eras, filters]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setPixelsPerYear(prev => Math.min(450, prev * 1.3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPixelsPerYear(prev => Math.max(12, prev * 0.77));
  }, []);

  const handleResetZoom = useCallback(() => {
    setPixelsPerYear(85);
  }, []);

  const handleJumpToPresent = useCallback(() => {
    setCurrentYearCenter(2026);
    setPixelsPerYear(85);
  }, []);

  const handleJumpToYear = useCallback((year: number) => {
    setCurrentYearCenter(year);
  }, []);

  const handleSelectEra = useCallback((eraId: string) => {
    const era = eras.find(e => e.id === eraId);
    if (era) {
      const mid = Math.round((era.startYear + era.endYear) / 2);
      setCurrentYearCenter(mid);
      setPixelsPerYear(55);
      setFilters(prev => ({ ...prev, selectedEraId: eraId }));
      setInExhibition(true);
    }
  }, [eras]);

  const handleStartCuratorTour = useCallback((year: number, gameId?: string) => {
    setCurrentYearCenter(year);
    setPixelsPerYear(90);
    if (gameId) {
      const g = games.find(item => item.id === gameId);
      if (g) setSelectedGame(g);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [games]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === 'Home') {
        e.preventDefault();
        handleJumpToPresent();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentYearCenter(prev => Math.max(1945, prev - 2));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentYearCenter(prev => Math.min(2035, prev + 2));
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleJumpToPresent]);

  const currentEra = getEraForYear(Math.round(currentYearCenter), eras);

  // If initial landing page
  if (!inExhibition) {
    const recentGames = games.filter(g => g.releaseYear >= 2022).reverse();
    return (
      <HeroExhibition
        onEnter={() => setInExhibition(true)}
        onSelectEra={handleSelectEra}
        onSelectGame={game => {
          setSelectedGame(game);
          setCurrentYearCenter(game.releaseYear);
          setInExhibition(true);
        }}
        eras={eras}
        recentGames={recentGames}
        milestones={milestones}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Museum Navbar */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 border-b border-neutral-850 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setInExhibition(false)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xs hover:bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-mono transition-colors"
            title="Return to Grand Entrance"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grand Entrance</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="font-display font-bold text-sm tracking-wider text-neutral-100">
              GAME HISTORY EXHIBITION
            </span>
            <span className="hidden md:inline text-neutral-600 font-mono text-xs">·</span>
            <span className="hidden md:inline text-xs font-mono text-amber-400">
              {currentEra ? `${currentEra.name} (${currentEra.subtitle})` : 'Timeline Repository'}
            </span>
          </div>
        </div>

        {/* Current Camera Coordinate Status & Preset Portal */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-xs bg-neutral-900 border border-neutral-800 text-neutral-400">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Viewing: <strong className="text-neutral-200">{Math.round(currentYearCenter)}</strong></span>
          </div>

          <button
            onClick={handleJumpToPresent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 text-xs font-mono font-medium transition-colors"
            title="Reset focus to Present Era (2026)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Present Day</span>
          </button>
        </div>
      </header>

      {/* Instant Search & Multi-Faceted Filters */}
      <SearchAndFilterBar
        games={games}
        milestones={milestones}
        eras={eras}
        filters={filters}
        onFilterChange={setFilters}
        onSelectGame={game => {
          setSelectedGame(game);
          setCurrentYearCenter(game.releaseYear);
        }}
        onSelectMilestone={milestone => {
          setSelectedMilestone(milestone);
          setCurrentYearCenter(milestone.year);
        }}
      />

      {/* Main Interactive Timeline Controls */}
      <TimelineControls
        currentYearCenter={currentYearCenter}
        pixelsPerYear={pixelsPerYear}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onJumpToPresent={handleJumpToPresent}
        onJumpToYear={handleJumpToYear}
        onSelectEra={handleSelectEra}
        eras={eras}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenKeyboardShortcuts={() => setIsShortcutsOpen(true)}
        totalGamesCount={games.length}
        filteredGamesCount={filteredGames.length}
      />

      {/* Main Exhibition View */}
      <main className="flex-1 flex flex-col">
        {viewMode === 'timeline' ? (
          <div className="flex-1 flex flex-col">
            {/* The SVG/Canvas Interactive Timeline */}
            <TimelineCanvas
              games={filteredGames}
              milestones={filteredMilestones}
              eras={eras}
              selectedGame={selectedGame}
              selectedMilestone={selectedMilestone}
              onSelectGame={setSelectedGame}
              onSelectMilestone={setSelectedMilestone}
              currentYearCenter={currentYearCenter}
              pixelsPerYear={pixelsPerYear}
              onCameraChange={(center, ppy) => {
                setCurrentYearCenter(center);
                setPixelsPerYear(ppy);
              }}
            />

            {/* Below Canvas: Curator Guided Tours & Current Era Spotlight */}
            <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
              {currentEra && (
                <div className="p-6 rounded-xs bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span style={{ color: currentEra.accentColor }} className="font-bold uppercase tracking-wider">
                      {currentEra.subtitle} · Active Wing
                    </span>
                    <span className="text-neutral-500">Decade Scope: {currentEra.startYear} – {currentEra.endYear}</span>
                  </div>
                  <h3 className="text-xl font-display font-bold text-neutral-100 mb-2">
                    {currentEra.name}
                  </h3>
                  <p className="text-sm text-neutral-300 font-sans leading-relaxed mb-4">
                    {currentEra.description}
                  </p>
                  <p className="text-xs text-neutral-400 font-sans italic border-l-2 border-neutral-700 pl-3">
                    Curator Notes: {currentEra.curatorNotes}
                  </p>
                </div>
              )}

              {/* Guided Curator Historical Tours */}
              <MuseumCuratorGuide onStartTour={handleStartCuratorTour} />
            </div>
          </div>
        ) : (
          /* Museum Exhibition Hall View */
          <ExhibitionHall
            games={filteredGames}
            milestones={filteredMilestones}
            eras={eras}
            onSelectGame={setSelectedGame}
            onSelectMilestone={setSelectedMilestone}
            onSelectEra={handleSelectEra}
          />
        )}
      </main>

      {/* Museum Footer */}
      <footer className="mt-auto bg-neutral-950 border-t border-neutral-850 px-6 py-8 text-neutral-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="font-bold text-neutral-300 block">GAME HISTORY EXHIBITION</span>
            <p className="text-neutral-500 font-sans max-w-md">
              An open-source digital museum and chronology of video game history. Built with zero backend dependencies,
              sourced from structured Wikidata SPARQL endpoints and Wikimedia Commons archives.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-400">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Keyboard Shortcuts (?)
            </button>
            <button
              onClick={handleJumpToPresent}
              className="hover:text-amber-400 transition-colors"
            >
              Return to Present (Home)
            </button>
            <a
              href="https://www.wikidata.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-200 transition-colors"
            >
              Wikidata
            </a>
            <a
              href="https://commons.wikimedia.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-200 transition-colors"
            >
              Wikimedia Commons
            </a>
          </div>
        </div>
      </footer>

      {/* Detail Modals */}
      <GameDetailModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onSelectRelatedGame={setSelectedGame}
        allGames={games}
        eras={eras}
      />

      <MilestoneDetailModal
        milestone={selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
