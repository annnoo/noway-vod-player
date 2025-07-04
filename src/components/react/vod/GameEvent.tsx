import React from 'react';
import type { GameEvent } from '../../../lib/types';
import { twitchEventBus } from '../../../lib/store';

interface GameEventComponentProps {
  event: GameEvent;
}

const GameEventComponent: React.FC<GameEventComponentProps> = ({ event }) => {
  const jumpToTimestamp = () => {
    twitchEventBus.emit(event.offsetSeconds);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">🎮</span>
          </div>
          <h3 className="font-bold text-blue-200">Game: {event.championName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
            event.won 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {event.won ? '🏆 Victory' : '💀 Defeat'}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-blue-100 mb-3 bg-blue-900/20 p-2 rounded-lg">{event.title}</p>
      
      <div className="flex flex-wrap gap-3 text-sm text-blue-200">
        <div className="flex items-center gap-1 bg-blue-900/30 px-2 py-1 rounded-lg">
          <span>⏱️</span>
          <span>Duration: {formatDuration(event.duration)}</span>
        </div>
        {event.kills !== undefined && event.deaths !== undefined && event.assists !== undefined && (
          <div className="flex items-center gap-1 bg-purple-900/30 px-2 py-1 rounded-lg">
            <span>⚔️</span>
            <span>KDA: {event.kills}/{event.deaths}/{event.assists}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameEventComponent;
