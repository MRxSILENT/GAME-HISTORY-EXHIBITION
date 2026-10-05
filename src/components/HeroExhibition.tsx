import React, { useEffect, useRef } from 'react';
import { Sparkles, Compass, Play, Calendar, History, ArrowRight, ShieldCheck } from 'lucide-react';
import { Game, Era, Milestone } from '../types';
import { ArchivalImage } from './ArchivalImage';

interface HeroExhibitionProps {
  onEnter: () => void;
  onSelectEra: (eraId: string) => void;
  onSelectGame: (game: Game) => void;
  eras: Era[];
  recentGames: Game[];
  milestones: Milestone[];
}

export const HeroExhibition: React.FC<HeroExhibitionProps> = ({
  onEnter,
  onSelectEra,
  onSelectGame,
  eras,
  recentGames,
  milestones,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subtle ambient particle constellation in background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; alpha: number }> = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;
        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        ctx.fillStyle = `rgba(148, 163, 184, ${p1.alpha})`;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(148, 163, 184, ${0.1 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const modernEra = eras.find(e => e.id === 'modern-era') || eras[eras.length - 1];

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between overflow-hidden">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40 z-0" />

      {/* Subtle radial lighting aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-b from-amber-500/10 via-sky-500/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Header bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b border-neutral-900/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm border border-neutral-700 bg-neutral-900 flex items-center justify-center text-amber-400 font-mono text-xs">
            1950
          </div>
          <div>
            <span className="font-display font-bold tracking-wider text-base text-neutral-200">
              GAME HISTORY EXHIBITION
            </span>
            <span className="block text-[11px] font-mono text-neutral-500 tracking-tight">
              ARCHIVAL DIGITAL REPOSITORY · OPEN WIKIMEDIA METADATA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onEnter}
            className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-neutral-100 text-neutral-950 font-medium text-xs tracking-wider uppercase hover:bg-white transition-all shadow-lg hover:shadow-neutral-100/10 active:scale-95"
          >
            <span>Enter Exhibition</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission & Concept */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400/90 tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Interactive Retrospective · 1950 – 2026+</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[1.05] text-neutral-100">
              From First Pixels <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-500">
                to the Future.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-400 max-w-2xl font-light leading-relaxed">
              Step into a digital museum charting over seventy years of video game evolution. Journey backward from
              modern ray-traced virtual worlds through the 3D revolution, the 8-bit renaissance, and the earliest
              oscilloscope experiments.
            </p>

            {/* Call to action & Present-Day Anchor */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onEnter}
                className="group flex items-center gap-3 px-8 py-4 rounded-sm bg-amber-500 text-neutral-950 font-semibold text-sm tracking-wider uppercase hover:bg-amber-400 transition-all shadow-xl hover:shadow-amber-500/20 active:scale-[0.98]"
              >
                <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
                <span>ENTER EXHIBITION</span>
              </button>

              <button
                onClick={() => modernEra && onSelectEra(modernEra.id)}
                className="flex items-center gap-2 px-6 py-4 rounded-sm border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 text-neutral-300 text-sm font-medium transition-colors"
              >
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>Explore Present Era (2020s–2026)</span>
              </button>
            </div>

            {/* Quick historical stats bar */}
            <div className="pt-6 border-t border-neutral-900 flex flex-wrap items-center gap-8 text-neutral-400 text-xs font-mono">
              <div>
                <span className="text-lg font-bold text-neutral-200 block font-sans">76+ Years</span>
                <span>Documented History</span>
              </div>
              <div className="h-7 w-px bg-neutral-800" />
              <div>
                <span className="text-lg font-bold text-neutral-200 block font-sans">10 Epochs</span>
                <span>Curated Historical Eras</span>
              </div>
              <div className="h-7 w-px bg-neutral-800" />
              <div>
                <span className="text-lg font-bold text-neutral-200 block font-sans">100% Open Data</span>
                <span>Wikidata & Wikimedia Commons</span>
              </div>
            </div>
          </div>

          {/* Right Column: Present Era Preview & Landmark Showcase */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm rounded-sm p-6 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>CURRENT ERA SPOTLIGHT</span>
                </div>
                <span className="text-xs font-mono text-neutral-500">YEAR 2026</span>
              </div>

              <h2 className="text-xl font-display font-bold text-neutral-100 mb-2">
                The Modern Frontier & Next-Gen
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Real-time photorealistic path tracing, micro-polygon virtualization (UE5 Nanite/Lumen), and massive systemic role-playing
                narratives represent the cutting edge of contemporary interactive entertainment.
              </p>

              {/* Landmark Releases in the Present Era */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                  Featured Era Exhibits
                </span>

                {recentGames.slice(0, 3).map(game => (
                  <button
                    key={game.id}
                    onClick={() => onSelectGame(game)}
                    className="w-full text-left p-2.5 rounded-sm bg-neutral-950/70 hover:bg-neutral-800/80 border border-neutral-850 hover:border-neutral-700 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-sm bg-neutral-800 shrink-0 overflow-hidden border border-neutral-700">
                        <ArchivalImage
                          src={game.imageUrl}
                          alt={game.title}
                          year={game.releaseYear}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-neutral-200 group-hover:text-amber-400 transition-colors truncate">
                          {game.title}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500">
                          {game.releaseYear} · {game.developer}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-300 transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Era Jump Grid */}
            <div className="border border-neutral-800/80 bg-neutral-900/30 p-4 rounded-sm">
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-2">
                <History className="w-3.5 h-3.5" />
                <span>Jump Directly to an Historical Era</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {eras.slice(0, 6).map(era => (
                  <button
                    key={era.id}
                    onClick={() => onSelectEra(era.id)}
                    className="text-left p-2 rounded-sm bg-neutral-950/60 hover:bg-neutral-850 border border-neutral-850 hover:border-neutral-700 transition-colors"
                  >
                    <span className="text-[10px] font-mono block text-amber-400/80">{era.subtitle}</span>
                    <span className="text-xs font-medium text-neutral-300 block truncate">{era.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Exhibition Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-neutral-900 text-neutral-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
        <div>
          Game History Exhibition · Sourced via Wikidata SPARQL & Wikimedia Commons
        </div>
        <div className="flex items-center gap-4">
          <span>Nonlinear Time Navigation</span>
          <span aria-hidden="true">·</span>
          <span>Zero Server Dependencies</span>
          <span aria-hidden="true">·</span>
          <span>GitHub Pages Ready</span>
        </div>
      </footer>
    </div>
  );
};
