import React from 'react';
import type { TrackConfig } from './types';

interface ScrubberToolbarProps {
  tracks: TrackConfig[];
  onToggleTrack: (trackId: string) => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  autoFollow: boolean;
  onToggleAutoFollow: () => void;
}

const ScrubberToolbar: React.FC<ScrubberToolbarProps> = ({
  tracks,
  onToggleTrack,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  autoFollow,
  onToggleAutoFollow,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-white/10 border-b-0 rounded-t-2xl shadow-xl backdrop-blur-sm select-none">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-black uppercase tracking-widest text-brand drop-shadow-[0_0_8px_var(--color-brand-glow)] italic skew-x-[-12deg]">
          ⚡ Timeline
        </h2>
      </div>

      {/* Track Show/Hide Toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-gray-450 uppercase tracking-wider font-extrabold mr-1 italic">Tracks:</span>
        {tracks.map((track) => {
          const isGame = track.id === 'games';
          return (
            <button
              key={track.id}
              onClick={() => !isGame && onToggleTrack(track.id)}
              disabled={isGame}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                track.visible
                  ? 'bg-slate-800 text-white border-white/15 hover:bg-slate-700'
                  : 'bg-slate-950/40 text-gray-500 border-white/5 hover:text-gray-450 hover:bg-slate-900'
              } ${isGame ? 'opacity-90 cursor-not-allowed border-brand/20 text-brand/80' : ''}`}
            >
              <span>{track.visible ? '👁️' : '🕶️'}</span>
              <span>{track.label}</span>
            </button>
          );
        })}
      </div>

      {/* Playback & View Controls */}
      <div className="flex items-center gap-3 ml-auto sm:ml-0">
        {/* Auto Follow playhead */}
        <button
          onClick={onToggleAutoFollow}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border transition-all cursor-pointer italic skew-x-[-12deg] ${
            autoFollow
              ? 'bg-brand border-brand text-slate-950 hover:brightness-110 shadow-md shadow-brand-glow'
              : 'bg-slate-950 border-white/10 text-gray-400 hover:bg-slate-850'
          }`}
        >
          <span>🎯</span>
          <span>Auto-Scroll</span>
        </button>

        {/* Zoom Operations */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-white/5 text-xs font-bold">
          <span className="text-gray-500 font-extrabold px-1 uppercase text-[9px] tracking-wider italic">Scale:</span>
          <button
            type="button"
            onClick={onZoomOut}
            className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer font-extrabold"
            title="Zoom Out"
          >
            -
          </button>
          <button
            type="button"
            onClick={onZoomReset}
            className="px-1.5 hover:bg-white/10 rounded text-[10px] text-brand font-mono cursor-pointer"
            title="Reset Zoom"
          >
            {zoomLevel.toFixed(1)}x
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer font-extrabold"
            title="Zoom In"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScrubberToolbar;
