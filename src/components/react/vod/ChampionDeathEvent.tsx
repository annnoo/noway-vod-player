import React from 'react';
import type { ChampionDeathVodEvent } from '../../../lib/types';
import { twitchEventBus } from '../../../lib/store';
import { getChampionImageUrl } from '../../../lib/championUtils';

interface ChampionDeathEventComponentProps {
  event: ChampionDeathVodEvent;
}

const ChampionDeathEventComponent: React.FC<ChampionDeathEventComponentProps> = ({ event }) => {
  const jumpToTimestamp = () => {
    twitchEventBus.emit(event.offsetSeconds);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 backdrop-blur-sm border border-gray-500/30 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">💀</span>
          </div>
          <h3 className="font-bold text-gray-200">Champion Death</h3>
        </div>
        <div className="w-3 h-3 bg-gray-400 rounded-full opacity-60"></div>
      </div>
      
      <div className="bg-gray-900/20 p-3 rounded-lg border border-gray-500/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <img 
              src={getChampionImageUrl(event.championId)} 
              alt={event.championName}
              className="w-8 h-8 rounded-full border-2 border-red-400/50 shadow-lg"
            />
            <span className="font-semibold text-gray-200">{event.championName}</span>
          </div>
          <span className="text-gray-300">was eliminated by</span>
          <div className="flex items-center gap-2">
            <img 
              src={getChampionImageUrl(event.killerChampionId)} 
              alt={event.killerChampionName}
              className="w-8 h-8 rounded-full border-2 border-green-400/50 shadow-lg"
            />
            <span className="font-semibold text-gray-200">{event.killerChampionName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChampionDeathEventComponent;
