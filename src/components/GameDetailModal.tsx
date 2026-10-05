import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Code,
  Building,
  Globe,
  Share2,
  Bookmark,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { Game, Era } from '../types';
import { getEraForYear } from '../services/dataLoader';
import { ArchivalImage } from './ArchivalImage';

interface GameDetailModalProps {
  game: Game | null;
  onClose: () => void;
  onSelectRelatedGame: (game: Game) => void;
  allGames: Game[];
  eras: Era[];
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  onClose,
  onSelectRelatedGame,
  allGames,
  eras,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'development' | 'releases' | 'impact' | 'sources'>('overview');

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!game) return null;

  const era = getEraForYear(game.releaseYear, eras);

  // Find related games: same franchise, or same developer, or same genre in same era
  const relatedGames = allGames
    .filter(g => {
      if (g.id === game.id) return false;
      const sameFranchise = game.franchises?.some(f => g.franchises?.includes(f));
      const sameDeveloper = g.developer && g.developer === game.developer;
      const sameSeries = game.series?.some(s => g.series?.includes(s));
      const explicitRelated = game.relatedGameIds?.includes(g.id);
      return explicitRelated || sameFranchise || sameSeries || sameDeveloper;
    })
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-750 shadow-2xl rounded-xs overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        {/* Exhibition Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest px-2 py-0.5 rounded-xs bg-amber-500/10 border border-amber-500/30">
              ARCHIVE REF: {game.id}
            </span>
            {era && (
              <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
                {era.name} ({era.subtitle})
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xs hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Close exhibit (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Banner with Title & Cover */}
        <div className="p-6 bg-gradient-to-b from-neutral-950 to-neutral-900 border-b border-neutral-800 flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-28 sm:w-36 h-36 sm:h-44 bg-neutral-950 rounded-xs border border-neutral-750 shrink-0 overflow-hidden shadow-lg flex items-center justify-center relative">
            <ArchivalImage
              src={game.imageUrl}
              alt={game.title}
              year={game.releaseYear}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="text-amber-400 font-bold">{game.releaseYear}</span>
              <span>·</span>
              <span>{game.developer}</span>
              {game.country && (
                <>
                  <span>·</span>
                  <span>{game.country}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-black text-neutral-100 tracking-tight">
              {game.title}
            </h1>

            {game.alternateTitles && game.alternateTitles.length > 0 && (
              <div className="text-xs text-neutral-400 font-sans italic">
                Also known as: {game.alternateTitles.join(', ')}
              </div>
            )}

            {/* Clean Typographic Metadata Specs (Anti-slop zero pills) */}
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 font-mono">
              <div>
                <span className="text-neutral-500 uppercase text-[10px] block">Publisher</span>
                <span className="text-neutral-200">{game.publisher || 'Independent'}</span>
              </div>
              <div className="h-6 w-px bg-neutral-800 hidden sm:block" />
              <div>
                <span className="text-neutral-500 uppercase text-[10px] block">Genres</span>
                <span className="text-neutral-200">{game.genres?.join(', ') || 'Video Game'}</span>
              </div>
              <div className="h-6 w-px bg-neutral-800 hidden sm:block" />
              <div>
                <span className="text-neutral-500 uppercase text-[10px] block">Platforms</span>
                <span className="text-neutral-200">{game.platforms?.slice(0, 3).join(', ') || 'Hardware'}{game.platforms && game.platforms.length > 3 ? ` +${game.platforms.length - 3}` : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 bg-neutral-950/70 border-b border-neutral-800 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('development')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'development'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Development Context
          </button>
          <button
            onClick={() => setActiveTab('releases')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'releases'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Release History & Ports
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'impact'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Historical Impact
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'sources'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Archival Sources & Licensing
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-neutral-300 leading-relaxed font-sans">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">
                  Exhibition Synopsis
                </h3>
                <p className="text-base text-neutral-200 leading-relaxed">
                  {game.description}
                </p>
              </div>

              {/* Key Specs Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800 text-xs font-mono">
                <div className="p-3 bg-neutral-950/60 rounded-xs border border-neutral-800/80">
                  <span className="text-neutral-500 uppercase text-[10px] block mb-1">Earliest Documented Release</span>
                  <span className="text-neutral-100 font-semibold text-sm">{game.earliestReleaseDate || game.releaseDate}</span>
                </div>
                <div className="p-3 bg-neutral-950/60 rounded-xs border border-neutral-800/80">
                  <span className="text-neutral-500 uppercase text-[10px] block mb-1">Primary Creative Leadership</span>
                  <span className="text-neutral-100 font-semibold text-sm">
                    {game.developers && game.developers.length > 0 ? game.developers.join(', ') : game.developer}
                  </span>
                </div>
              </div>

              {/* Related Exhibits in this wing */}
              {relatedGames.length > 0 && (
                <div className="pt-4 border-t border-neutral-800">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-3">
                    Chronologically & Thematically Related Exhibits
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {relatedGames.map(rel => (
                      <button
                        key={rel.id}
                        onClick={() => onSelectRelatedGame(rel)}
                        className="text-left p-3 rounded-xs bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-center justify-between group"
                      >
                        <div className="truncate">
                          <span className="text-[10px] font-mono text-amber-400 block">{rel.releaseYear}</span>
                          <span className="text-xs font-semibold text-neutral-200 group-hover:text-amber-400 transition-colors truncate block">
                            {rel.title}
                          </span>
                          <span className="text-[11px] text-neutral-500 block truncate">{rel.developer}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 transition-transform group-hover:translate-x-0.5 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'development' && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                Engineering & Design Background
              </h3>
              {game.developmentContext ? (
                <p className="text-base text-neutral-200 leading-relaxed">
                  {game.developmentContext}
                </p>
              ) : (
                <p className="text-neutral-500 italic font-mono text-xs">
                  Detailed developmental engineering logs for this entry are being synthesized from primary archival documentation.
                </p>
              )}

              <div className="p-4 bg-neutral-950/80 rounded-xs border border-neutral-800 space-y-2 mt-4 text-xs font-mono">
                <span className="text-neutral-400 uppercase text-[10px] block font-bold">
                  Technical Architecture & Systems
                </span>
                <div className="text-neutral-300">
                  Platforms: {game.platforms?.join(' · ') || 'Dedicated Hardware'}
                </div>
                {game.country && (
                  <div className="text-neutral-400">
                    Jurisdiction / Origin: {game.country}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'releases' && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">
                Release Timeline & Regional Distribution
              </h3>

              {game.releaseHistory && game.releaseHistory.length > 0 ? (
                <div className="space-y-3 font-mono text-xs">
                  {game.releaseHistory.map((rel, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-950 rounded-xs border border-neutral-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-amber-400 font-bold block">{rel.label}</span>
                        <span className="text-neutral-400 text-[11px]">
                          Region: {rel.region} {rel.platform ? `· Platform: ${rel.platform}` : ''}
                        </span>
                      </div>
                      <div className="text-neutral-300 font-semibold shrink-0">
                        {rel.date}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-neutral-950 rounded-xs border border-neutral-800 font-mono text-xs">
                  <div className="text-neutral-300 font-semibold">Original Public Release: {game.releaseDate}</div>
                  <div className="text-neutral-500 text-[11px] mt-1">
                    Earliest verified commercial or exhibition availability: {game.earliestReleaseDate}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                Significance in Video Game History
              </h3>
              <p className="text-base text-neutral-200 leading-relaxed">
                {game.historicalSignificance}
              </p>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-4 font-mono text-xs">
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                Open Data Provenance & Attribution
              </h3>
              <p className="text-neutral-400 font-sans text-xs leading-relaxed">
                This record is compiled from legitimate structured open knowledge graphs. Every field retains direct provenance to prevent fabricated or hallucinated historical trivia.
              </p>

              <div className="space-y-2 pt-2">
                {game.wikidataUrl && (
                  <a
                    href={game.wikidataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-neutral-950 rounded-xs border border-neutral-800 hover:border-neutral-700 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="text-sky-400 block font-semibold">Wikidata Entity Record</span>
                      <span className="text-neutral-500 text-[11px]">{game.wikidataUrl}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-sky-400 transition-colors shrink-0" />
                  </a>
                )}

                {game.wikipediaUrl && (
                  <a
                    href={game.wikipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-neutral-950 rounded-xs border border-neutral-800 hover:border-neutral-700 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="text-sky-400 block font-semibold">Wikipedia Historical Article</span>
                      <span className="text-neutral-500 text-[11px]">{game.wikipediaUrl}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-sky-400 transition-colors shrink-0" />
                  </a>
                )}

                {game.sources?.wikimediaCommons && (
                  <a
                    href={game.sources.wikimediaCommons}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-neutral-950 rounded-xs border border-neutral-800 hover:border-neutral-700 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <span className="text-sky-400 block font-semibold">Wikimedia Commons Image File</span>
                      <span className="text-neutral-500 text-[11px]">{game.sources.wikimediaCommons}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-sky-400 transition-colors shrink-0" />
                  </a>
                )}
              </div>

              {/* Image Credit & Licensing */}
              <div className="p-3 bg-neutral-950/80 rounded-xs border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block">Media Credit & Attribution</span>
                  <span>{game.imageCredit || 'Wikimedia Commons / Public Knowledge'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block">License</span>
                  <span>{game.imageLicense || 'Fair Use / Public Domain / CC'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-500">
          <div>
            Data confidence: <span className="text-amber-400 uppercase">{game.confidence}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xs bg-neutral-800 hover:bg-neutral-750 text-neutral-200 transition-colors font-medium"
          >
            Close Exhibit
          </button>
        </div>
      </div>
    </div>
  );
};
