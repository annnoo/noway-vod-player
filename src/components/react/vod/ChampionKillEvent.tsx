import React from 'react';
import type { ChampionKillVodEvent } from '../../../lib/types';
import { twitchEventBus } from '../../../lib/store';

interface ChampionKillEventComponentProps {
  event: ChampionKillVodEvent;
}

const ChampionKillEventComponent: React.FC<ChampionKillEventComponentProps> = ({ event }) => {
  const imageUrl = `https://cdn.nowaycdn.com/images/champions/square/16x/${event.championId}.png`;
  const imageUrlV = `https://cdn.nowaycdn.com/images/champions/square/16x/${event.victimChampionId}.png`;
  
  const jumpToTimestamp = () => {
    twitchEventBus.emit(event.offsetSeconds);
  };

  return (
    <div className="bg-gradient-to-br from-red-900/30 to-rose-900/30 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">⚔️</span>
          </div>
          <h3 className="font-bold text-red-200">Champion Kill</h3>
        </div>
        {event.killStreakLength > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-full border border-red-500/30 font-medium">
              🔥 {event.killStreakLength} Kill Streak
            </span>
          </div>
        )}
      </div>
      
      <div className="bg-red-900/20 p-3 rounded-lg border border-red-500/20">
        <div className="flex items-center gap-3 text-sm text-red-100">
          <div className="flex items-center gap-2">
            <img 
              src={imageUrl} 
              alt={event.championName} 
              className="w-8 h-8 rounded-full border-2 border-green-400/50 shadow-lg" 
            />
            <span className="font-semibold text-red-200">{event.championName}</span>
          </div>
          <span className="text-red-300">eliminated</span>
          <div className="flex items-center gap-2">
            <img 
              src={imageUrlV} 
              alt={event.victimChampionName} 
              className="w-8 h-8 rounded-full border-2 border-red-400/50 shadow-lg" 
            />
            <span className="font-semibold text-red-200">{event.victimChampionName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChampionKillEventComponent;
