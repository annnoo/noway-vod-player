import React from 'react';
import type { ViewportState } from './types';
import { toPercent } from './types';

interface PlayheadProps {
  currentTime: number;
  viewport: ViewportState;
}

const Playhead: React.FC<PlayheadProps> = ({ currentTime, viewport }) => {
  if (currentTime < viewport.viewStart || currentTime > viewport.viewEnd) {
    return null;
  }

  const left = toPercent(currentTime, viewport);

  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-brand shadow-[0_0_8px_var(--color-brand-glow)] z-20 pointer-events-none transition-all duration-75"
      style={{ left: `${left}%` }}
    >
      {/* Visual Handle at top */}
      <div className="absolute top-0 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-brand rounded-full border-2 border-white shadow-lg" />
    </div>
  );
};

export default Playhead;
