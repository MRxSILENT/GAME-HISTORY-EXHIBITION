import React from 'react';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';
import { Game } from '../types';

interface CuratorTour {
  id: string;
  title: string;
  theme: string;
  description: string;
  targetYear: number;
  highlightGameIds: string[];
}

interface MuseumCuratorGuideProps {
  onStartTour: (targetYear: number, gameId?: string) => void;
}

export const MuseumCuratorGuide: React.FC<MuseumCuratorGuideProps> = ({ onStartTour }) => {
  const tours: CuratorTour[] = [
    {
      id: 'pioneers',
      title: 'Dawn of Interactive Computing',
      theme: '1950 – 1972',
      description: 'From experimental radar vacuum tubes to the first coin-operated arcade machines in California taverns.',
      targetYear: 1958,
      highlightGameIds: ['Q2631916', 'Q240683', 'Q234479', 'Q216293'],
    },
    {
      id: 'renaissance',
      title: 'The 8-Bit Renaissance',
      theme: '1983 – 1988',
      description: 'How Nintendo rescued the post-crash video game industry through rigorous quality standards and timeless game design.',
      targetYear: 1985,
      highlightGameIds: ['Q11168', 'Q564403', 'Q12384', 'Q12398'],
    },
    {
      id: '3d-shift',
      title: 'The 3D Dimensional Revolution',
      theme: '1994 – 1999',
      description: 'The monumental leap from flat 2D sprite grids to real-time 3D spatial geometry, analog movement, and cinematic storytelling.',
      targetYear: 1996,
      highlightGameIds: ['Q214170', 'Q214172', 'Q214174', 'Q279446'],
    },
    {
      id: 'open-worlds',
      title: 'Sandbox Agency & Open Worlds',
      theme: '2001 – 2026',
      description: 'The trajectory of simulated worlds: from GTA III to Breath of the Wild, Elden Ring, and beyond.',
      targetYear: 2017,
      highlightGameIds: ['Q14920', 'Q22998', 'Q171457', 'Q106317440', 'Q110822602'],
    },
  ];

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 p-6 rounded-xs backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Curator-Guided Historical Tours</span>
        </div>
        <span className="text-[11px] font-mono text-neutral-500">Curated Historical Narratives</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tours.map(tour => (
          <button
            key={tour.id}
            onClick={() => onStartTour(tour.targetYear, tour.highlightGameIds[0])}
            className="text-left p-3.5 rounded-xs bg-neutral-950/80 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-400/50 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-amber-400 block font-semibold">{tour.theme}</span>
              <h4 className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300 transition-colors">
                {tour.title}
              </h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-sans line-clamp-3">
                {tour.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-neutral-850 flex items-center justify-between text-[10px] font-mono text-neutral-500 group-hover:text-neutral-300">
              <span>Begin Guided Tour</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-amber-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
