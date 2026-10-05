import React, { useEffect } from 'react';
import { X, ExternalLink, Calendar, ShieldCheck, Tag } from 'lucide-react';
import { Milestone } from '../types';
import { ArchivalImage } from './ArchivalImage';

interface MilestoneDetailModalProps {
  milestone: Milestone | null;
  onClose: () => void;
}

export const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
  milestone,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!milestone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-750 shadow-2xl rounded-xs overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
            <span>◆ HISTORICAL MILESTONE</span>
            <span>·</span>
            <span className="uppercase text-neutral-400">{milestone.category}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xs hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {milestone.imageUrl && (
            <div className="w-full h-56 bg-neutral-950 rounded-xs border border-neutral-800 overflow-hidden flex items-center justify-center relative">
              <ArchivalImage
                src={milestone.imageUrl}
                alt={milestone.title}
                year={milestone.year}
                className="w-full h-full object-contain p-2"
              />
            </div>
          )}

          <div>
            <div className="text-xs font-mono text-amber-400 mb-1">
              Documented Event · {milestone.date || milestone.year}
            </div>
            <h2 className="text-2xl font-display font-bold text-neutral-100">
              {milestone.title}
            </h2>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">
              Chronicle
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed font-sans">
              {milestone.description}
            </p>
          </div>

          <div className="p-4 bg-neutral-950 rounded-xs border border-neutral-800 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-sky-400">
              Historical Impact & Legacy
            </h3>
            <p className="text-sm text-neutral-200 leading-relaxed font-sans">
              {milestone.historicalSignificance}
            </p>
          </div>

          {/* Sources and media credits */}
          <div className="pt-2 border-t border-neutral-800 space-y-2 text-xs font-mono text-neutral-500">
            {milestone.wikipediaUrl && (
              <a
                href={milestone.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xs bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-sky-400 hover:text-sky-300 transition-colors"
              >
                <span>Read Full Wikipedia Historical Documentation</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {milestone.imageCredit && (
              <div className="text-[11px] text-neutral-500">
                Media Credit: {milestone.imageCredit} ({milestone.imageLicense || 'Public Domain'})
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xs bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-mono font-medium transition-colors"
          >
            Close Exhibit
          </button>
        </div>
      </div>
    </div>
  );
};
