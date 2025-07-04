import React from 'react';
import type { GameEndVodEvent } from '../../../lib/types';
import { twitchEventBus } from '../../../lib/store';

interface GameEndEventComponentProps {
  event: GameEndVodEvent;
}

const GameEndEventComponent: React.FC<GameEndEventComponentProps> = ({ event }) => {
  const jumpToTimestamp = () => {
    twitchEventBus.emit(event.offsetSeconds);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/30 to-gray-900/30 backdrop-blur-sm border border-slate-500/30 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🏁</span>
          </div>
          <h3 className="font-bold text-slate-200">Game End</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
            event.isStreamerTeamWinner 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {event.isStreamerTeamWinner ? '🏆 Victory' : '💀 Defeat'}
          </span>
        </div>
      </div>
      
      <div className="bg-slate-900/20 p-3 rounded-lg border border-slate-500/20">
        <p className="text-sm text-slate-100 font-medium">
          Game completed - <span className="text-slate-200">{event.result}</span>
        </p>
      </div>
    </div>
  );
};

export default GameEndEventComponent;
