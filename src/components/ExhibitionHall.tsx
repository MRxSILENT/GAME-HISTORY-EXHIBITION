import React from 'react';
import { Game, Era, Milestone } from '../types';
import { ArrowRight, Sparkles, ExternalLink, Calendar } from 'lucide-react';
import { ArchivalImage } from './ArchivalImage';

interface ExhibitionHallProps {
  games: Game[];
  milestones: Milestone[];
  eras: Era[];
  onSelectGame: (game: Game) => void;
  onSelectMilestone: (milestone: Milestone) => void;
  onSelectEra: (eraId: string) => void;
}

export const ExhibitionHall: React.FC<ExhibitionHallProps> = ({
  games,
  milestones,
  eras,
  onSelectGame,
  onSelectMilestone,
  onSelectEra,
}) => {
  // Group games and milestones by era
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-16">
      <div className="border-b border-neutral-800 pb-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-100">
          Chronological Exhibition Wings
        </h2>
        <p className="text-sm text-neutral-400 font-sans mt-1">
          Explore video game history systematically through designated historical eras and landmark artifacts.
        </p>
      </div>

      {eras.map(era => {
        const eraGames = games.filter(g => g.releaseYear >= era.startYear && g.releaseYear <= era.endYear);
        const eraMilestones = milestones.filter(m => m.year >= era.startYear && m.year <= era.endYear);

        if (eraGames.length === 0 && eraMilestones.length === 0) return null;

        return (
          <section key={era.id} className="space-y-6">
            {/* Era Banner */}
            <div className="p-6 rounded-xs bg-neutral-900/60 border border-neutral-800 backdrop-blur-sm relative overflow-hidden">
              <div
                style={{ backgroundColor: era.accentColor }}
                className="absolute top-0 left-0 right-0 h-1"
              />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                    <span>{era.subtitle}</span>
                    <span>·</span>
                    <span>{eraGames.length} Documented Games</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-neutral-100 mt-1">
                    {era.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl mt-2 leading-relaxed font-sans">
                    {era.description}
                  </p>
                </div>

                <button
                  onClick={() => onSelectEra(era.id)}
                  className="px-4 py-2 rounded-xs bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-mono font-medium transition-colors shrink-0 self-start md:self-auto flex items-center gap-2"
                >
                  <span>Focus in Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Defining Technologies */}
              {era.definingTech && era.definingTech.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-neutral-400">
                  <span className="text-neutral-500 uppercase text-[10px]">Defining Tech:</span>
                  {era.definingTech.map((tech, i) => (
                    <React.Fragment key={tech}>
                      <span className="text-neutral-300">{tech}</span>
                      {i < era.definingTech.length - 1 && <span className="text-neutral-600">·</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Milestones in this Era */}
            {eraMilestones.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 block font-semibold">
                  Historical Hardware & Industry Milestones
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {eraMilestones.map(m => (
                    <button
                      key={m.id}
                      onClick={() => onSelectMilestone(m)}
                      className="text-left p-3 rounded-xs bg-neutral-950/80 hover:bg-neutral-900 border border-sky-500/20 hover:border-sky-500/50 transition-colors flex items-start gap-3 group"
                    >
                      <div className="w-6 h-6 rotate-45 border border-sky-400/60 bg-sky-500/10 flex items-center justify-center shrink-0 mt-1">
                        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-mono text-sky-400 block font-bold">
                          {m.year} · {m.category.toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold text-neutral-200 group-hover:text-sky-300 block truncate">
                          {m.title}
                        </span>
                        <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed font-sans">
                          {m.historicalSignificance}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Games Grid in this Era */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {eraGames.map(game => (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game)}
                  className="group bg-neutral-950/90 rounded-xs border border-neutral-800/90 hover:border-neutral-700 hover:bg-neutral-900 transition-all p-4 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="aspect-4/3 w-full bg-neutral-900 rounded-xs overflow-hidden border border-neutral-800 relative flex items-center justify-center">
                      <ArchivalImage
                        src={game.imageUrl}
                        alt={game.title}
                        year={game.releaseYear}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {game.featured && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-xs bg-amber-500 text-neutral-950 font-mono text-[9px] font-bold uppercase tracking-wider shadow-md">
                          Landmark
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-1">
                        <span>{game.releaseYear}</span>
                        <span className="text-neutral-500 text-[10px]">{game.genres?.[0]}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                        {game.title}
                      </h4>
                      <div className="text-xs text-neutral-400 font-mono mt-0.5 truncate">
                        {game.developer}
                      </div>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-sans">
                      {game.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-850 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <span className="truncate">{game.platforms?.[0] || 'Hardware'}</span>
                    <span className="group-hover:text-neutral-200 transition-colors flex items-center gap-1 text-amber-400/90 font-medium">
                      Examine
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
