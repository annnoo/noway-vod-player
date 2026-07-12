import React from 'react';
import type { ViewportState } from './types';
import { toPercent } from './types';

interface TimeRulerProps {
  viewport: ViewportState;
  vodDuration: number;
}

const TimeRuler: React.FC<TimeRulerProps> = ({ viewport, vodDuration }) => {
  const windowSize = viewport.viewEnd - viewport.viewStart;

  // Determine tick spacing based on viewport duration window size
  let interval = 1800; // 30 mins default
  if (windowSize > 14400) {
    interval = 3600; // 1 hour
  } else if (windowSize > 7200) {
    interval = 1800; // 30 min
  } else if (windowSize > 3600) {
    interval = 900; // 15 min
  } else if (windowSize > 1200) {
    interval = 300; // 5 min
  } else if (windowSize > 300) {
    interval = 60; // 1 min
  } else {
    interval = 10; // 10 seconds for extreme zoom
  }

  // Find the first tick offset seconds
  const startTick = Math.ceil(viewport.viewStart / interval) * interval;
  const ticks: number[] = [];

  for (let s = startTick; s <= viewport.viewEnd && s <= vodDuration; s += interval) {
    ticks.push(s);
  }

  const formatTimestamp = (offsetSeconds: number): string => {
    const hours = Math.floor(offsetSeconds / 3600);
    const minutes = Math.floor((offsetSeconds % 3600) / 60);
    const seconds = Math.floor(offsetSeconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-10 border-b border-white/10 select-none bg-slate-950/60 rounded-t-xl overflow-hidden">
      {ticks.map((tick) => {
        const left = toPercent(tick, viewport);
        return (
          <div
            key={tick}
            className="absolute top-0 bottom-0 border-l border-white/8 flex flex-col justify-between pt-2 pointer-events-none"
            style={{ left: `${left}%` }}
          >
            <span className="text-xs font-mono text-slate-200 font-bold -translate-x-1/2 select-none whitespace-nowrap">
              {formatTimestamp(tick)}
            </span>
            <div className="h-2.5 w-px bg-white/40 self-start" />
          </div>
        );
      })}
    </div>
  );
};

export default TimeRuler;
