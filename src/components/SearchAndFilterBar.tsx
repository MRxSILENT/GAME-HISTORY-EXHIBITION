import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Sparkles, Check, ChevronDown } from 'lucide-react';
import { Game, Era, Milestone, TimelineFilter } from '../types';

interface SearchAndFilterBarProps {
  games: Game[];
  milestones: Milestone[];
  eras: Era[];
  filters: TimelineFilter;
  onFilterChange: (newFilters: TimelineFilter) => void;
  onSelectGame: (game: Game) => void;
  onSelectMilestone: (milestone: Milestone) => void;
}

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  games,
  milestones,
  eras,
  filters,
  onFilterChange,
  onSelectGame,
  onSelectMilestone,
}) => {
  const [searchInput, setSearchInput] = useState(filters.searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Debounce search update
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({ ...filters, searchQuery: searchInput });
    }, 200);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute unique genres, platforms, and developers for filter dropdowns
  const genres = Array.from(new Set(games.flatMap(g => g.genres || []))).sort();
  const platforms = Array.from(new Set(games.flatMap(g => g.platforms || []))).sort();
  const developers = Array.from(new Set(games.flatMap(g => g.developers?.length ? g.developers : [g.developer]).filter(Boolean))).sort();

  const decades = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

  // Live suggestions for dropdown
  const query = searchInput.trim().toLowerCase();
  const matchedGames = query.length >= 1
    ? games.filter(g =>
        g.title.toLowerCase().includes(query) ||
        g.alternateTitles?.some(alt => alt.toLowerCase().includes(query)) ||
        g.developer?.toLowerCase().includes(query) ||
        g.genres?.some(genre => genre.toLowerCase().includes(query))
      ).slice(0, 6)
    : [];

  const matchedMilestones = query.length >= 1
    ? milestones.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query)
      ).slice(0, 3)
    : [];

  const activeFiltersCount = [
    filters.selectedEraId,
    filters.selectedDecade !== null,
    filters.selectedGenre,
    filters.selectedPlatform,
    filters.selectedDeveloper,
    filters.featuredOnly,
    filters.milestonesOnly,
  ].filter(Boolean).length;

  const handleClearAll = () => {
    setSearchInput('');
    onFilterChange({
      searchQuery: '',
      selectedEraId: null,
      selectedDecade: null,
      selectedGenre: null,
      selectedPlatform: null,
      selectedDeveloper: null,
      milestonesOnly: false,
      featuredOnly: false,
    });
  };

  return (
    <div className="w-full bg-neutral-950 border-b border-neutral-850 px-6 py-3 relative z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Instant Search Bar with Live Suggestions */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xl">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, creator, genre, year, franchise (e.g. 'Mario', '1998', 'Square', 'Zelda')..."
              value={searchInput}
              onFocus={() => setShowSuggestions(true)}
              onChange={e => {
                setSearchInput(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xs bg-neutral-900 border border-neutral-800 focus:border-amber-400 focus:outline-hidden text-sm text-neutral-100 placeholder:text-neutral-500 font-sans transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 p-0.5 rounded-xs hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Popup */}
          {showSuggestions && (matchedGames.length > 0 || matchedMilestones.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-neutral-900/98 border border-neutral-750 rounded-xs shadow-2xl overflow-hidden z-50 divide-y divide-neutral-850 backdrop-blur-md">
              {matchedGames.length > 0 && (
                <div className="p-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2 py-1">
                    Exhibition Games ({matchedGames.length})
                  </div>
                  {matchedGames.map(game => (
                    <button
                      key={game.id}
                      onClick={() => {
                        onSelectGame(game);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-xs hover:bg-neutral-800/80 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-[11px] font-mono text-amber-400 shrink-0">
                          {game.releaseYear}
                        </span>
                        <span className="text-xs font-medium text-neutral-200 group-hover:text-amber-400 truncate">
                          {game.title}
                        </span>
                        <span className="text-[11px] text-neutral-500 truncate hidden sm:inline">
                          · {game.developer}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-600 uppercase shrink-0">
                        {game.genres?.[0]}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {matchedMilestones.length > 0 && (
                <div className="p-2 bg-neutral-950/60">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 px-2 py-1">
                    Historical Milestones
                  </div>
                  {matchedMilestones.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectMilestone(m);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-xs hover:bg-neutral-800/80 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[11px] font-mono text-sky-400">◆ {m.year}</span>
                        <span className="text-xs text-neutral-200 group-hover:text-sky-300 truncate">
                          {m.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">
                        {m.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Filter Buttons & Drawer Toggle */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          {/* Featured Only Toggle */}
          <button
            onClick={() => onFilterChange({ ...filters, featuredOnly: !filters.featuredOnly })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs border transition-colors ${
              filters.featuredOnly
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold'
                : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Landmarks</span>
          </button>

          {/* Toggle Full Filter Drawer */}
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xs border transition-colors ${
              showFilterDrawer || activeFiltersCount > 0
                ? 'bg-neutral-800 border-neutral-600 text-neutral-100'
                : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-400'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Archive</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-xs bg-amber-400 text-neutral-950 font-bold text-[10px]">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-neutral-500 hover:text-neutral-300 px-2 py-1 text-[11px] underline underline-offset-4"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Expanded Multi-Filter Drawer */}
      {showFilterDrawer && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-neutral-850 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-xs font-mono">
          {/* Era Filter */}
          <div>
            <label className="block text-[10px] uppercase text-neutral-500 mb-1">Historical Era</label>
            <select
              value={filters.selectedEraId || ''}
              onChange={e => onFilterChange({ ...filters, selectedEraId: e.target.value || null })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xs px-2.5 py-1.5 text-neutral-200 focus:outline-hidden focus:border-amber-400"
            >
              <option value="">All Historical Eras</option>
              {eras.map(era => (
                <option key={era.id} value={era.id}>
                  {era.subtitle} — {era.name}
                </option>
              ))}
            </select>
          </div>

          {/* Decade Filter */}
          <div>
            <label className="block text-[10px] uppercase text-neutral-500 mb-1">Decade</label>
            <select
              value={filters.selectedDecade !== null ? filters.selectedDecade.toString() : ''}
              onChange={e => {
                const val = e.target.value ? parseInt(e.target.value, 10) : null;
                onFilterChange({ ...filters, selectedDecade: val });
              }}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xs px-2.5 py-1.5 text-neutral-200 focus:outline-hidden focus:border-amber-400"
            >
              <option value="">All Decades</option>
              {decades.map(dec => (
                <option key={dec} value={dec}>
                  {dec}s
                </option>
              ))}
            </select>
          </div>

          {/* Genre Filter */}
          <div>
            <label className="block text-[10px] uppercase text-neutral-500 mb-1">Genre</label>
            <select
              value={filters.selectedGenre || ''}
              onChange={e => onFilterChange({ ...filters, selectedGenre: e.target.value || null })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xs px-2.5 py-1.5 text-neutral-200 focus:outline-hidden focus:border-amber-400"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="block text-[10px] uppercase text-neutral-500 mb-1">Platform</label>
            <select
              value={filters.selectedPlatform || ''}
              onChange={e => onFilterChange({ ...filters, selectedPlatform: e.target.value || null })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xs px-2.5 py-1.5 text-neutral-200 focus:outline-hidden focus:border-amber-400"
            >
              <option value="">All Platforms</option>
              {platforms.map(plat => (
                <option key={plat} value={plat}>
                  {plat}
                </option>
              ))}
            </select>
          </div>

          {/* Developer Filter */}
          <div>
            <label className="block text-[10px] uppercase text-neutral-500 mb-1">Developer</label>
            <select
              value={filters.selectedDeveloper || ''}
              onChange={e => onFilterChange({ ...filters, selectedDeveloper: e.target.value || null })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xs px-2.5 py-1.5 text-neutral-200 focus:outline-hidden focus:border-amber-400"
            >
              <option value="">All Studios / Creators</option>
              {developers.map(dev => (
                <option key={dev} value={dev}>
                  {dev}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
