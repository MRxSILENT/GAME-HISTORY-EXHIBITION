import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: '+ / =', action: 'Zoom in on timeline' },
    { key: '- / _', action: 'Zoom out on timeline' },
    { key: 'Home', action: 'Return to present era (2026)' },
    { key: 'Esc', action: 'Close exhibit or modal' },
    { key: '← / →', action: 'Pan time backward / forward' },
    { key: 'Scroll Wheel', action: 'Zoom timeline centered at mouse cursor' },
    { key: 'Mouse Drag', action: 'Pan horizontally through history' },
    { key: '?', action: 'Toggle this keyboard reference guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-neutral-900 border border-neutral-750 rounded-xs shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-200">
            <Keyboard className="w-4 h-4 text-amber-400" />
            <span className="font-bold tracking-wider uppercase">Exhibition Navigation Controls</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xs hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3 font-mono text-xs">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-neutral-800/60 last:border-0">
              <span className="px-2 py-1 bg-neutral-950 border border-neutral-700 rounded-xs text-amber-300 font-bold">
                {sc.key}
              </span>
              <span className="text-neutral-300">{sc.action}</span>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-mono rounded-xs"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
