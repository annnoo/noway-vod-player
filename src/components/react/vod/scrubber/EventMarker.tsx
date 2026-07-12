import React from 'react';
import type { ViewportState } from './types';
import { toPercent } from './types';
import type { VodEvent } from '../../../../lib/types';
import { VodEventType } from '../../../../lib/types';

interface EventMarkerProps {
  offsetSeconds: number;
  viewport: ViewportState;
  onClick?: () => void;
  tooltip?: string;
  isActive?: boolean;
  event: VodEvent;
}

const EventMarker: React.FC<EventMarkerProps> = ({
  offsetSeconds,
  viewport,
  onClick,
  tooltip,
  isActive = false,
  event,
}) => {
  if (offsetSeconds < viewport.viewStart || offsetSeconds > viewport.viewEnd) {
    return null;
  }

  const left = toPercent(offsetSeconds, viewport);

  // Extract championId if present (from kills, deaths, assists, multi-kills)
  const championId = (event as any).championId;
  const championName = (event as any).championName;
  const imageUrl = championId 
    ? `https://cdn.nowaycdn.com/images/champions/square/16x/${championId}.png` 
    : undefined;

  // Determine border color, shadow, and fallback emoji/icon based on event type
  let borderColor = 'border-gray-500';
  let shadowColor = 'shadow-gray-500/20';
  let fallbackContent = '🔹';

  switch (event.type) {
    case VodEventType.CHAMPION_KILL:
    case VodEventType.CHAMPION_SPECIAL_KILL:
      borderColor = 'border-red-500';
      shadowColor = 'shadow-red-500/40';
      fallbackContent = '⚔️';
      break;
    case VodEventType.CHAMPION_DEATH:
      borderColor = 'border-rose-600';
      shadowColor = 'shadow-rose-600/40';
      fallbackContent = '💀';
      break;
    case VodEventType.CHAMPION_ASSIST:
      borderColor = 'border-sky-400';
      shadowColor = 'shadow-sky-400/40';
      fallbackContent = '🛡️';
      break;
    case VodEventType.ELITE_MONSTER_KILL: {
      borderColor = 'border-yellow-500';
      shadowColor = 'shadow-yellow-500/40';
      const isBaron = (event as any).monsterType === 'BARON';
      fallbackContent = isBaron ? '👾' : '🐉';
      break;
    }
    case VodEventType.BUILDING_KILL:
      borderColor = 'border-blue-500';
      shadowColor = 'shadow-blue-500/40';
      fallbackContent = '🏰';
      break;
    case VodEventType.GAME_END:
      borderColor = 'border-emerald-500';
      shadowColor = 'shadow-emerald-500/40';
      fallbackContent = '🏁';
      break;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 bg-slate-900 shadow-md transition-all hover:scale-135 hover:z-30 cursor-pointer flex items-center justify-center overflow-hidden ${borderColor} ${shadowColor} ${
        isActive ? 'ring-4 ring-pink-500 scale-110 z-20 shadow-[0_0_12px_#ec4899]' : 'z-10'
      }`}
      style={{ left: `${left}%` }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={championName || 'Champion'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <span className="text-sm select-none pointer-events-none">
          {fallbackContent}
        </span>
      )}
    </button>
  );
};

export default EventMarker;
