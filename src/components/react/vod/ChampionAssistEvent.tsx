import React from 'react';
import type { ChampionAssistVodEvent } from '../../../lib/types';
import { twitchEventBus } from '../../../lib/store';

interface ChampionAssistEventComponentProps {
  event: ChampionAssistVodEvent;
}

const ChampionAssistEventComponent: React.FC<ChampionAssistEventComponentProps> = ({ event }) => {
  const assistImageUrl = `https://cdn.nowaycdn.com/images/champions/square/16x/${event.championId}.png`;
  const killerImageUrl = `https://cdn.nowaycdn.com/images/champions/square/16x/${event.killerChampionId}.png`;
  const victimImageUrl = `https://cdn.nowaycdn.com/images/champions/square/16x/${event.victimChampionId}.png`;

  const jumpToTimestamp = () => {
    twitchEventBus.emit(event.offsetSeconds);
  };

  return (
    <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🤝</span>
          </div>
          <h3 className="font-bold text-yellow-200">Champion Assist</h3>
        </div>
        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
      </div>
      
      <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/20">
        <p className="text-sm text-yellow-100">
          <span className="font-semibold text-yellow-200">{event.championName}</span>{' '}
          <span className="text-yellow-300">assisted</span>{' '}
          <span className="font-semibold text-yellow-200">{event.killerChampionName}</span>{' '}
          <span className="text-yellow-300">in eliminating</span>{' '}
          <span className="font-semibold text-yellow-200">{event.victimChampionName}</span>
        </p>
      </div>
    </div>
  );
};

export default ChampionAssistEventComponent;
