import React from 'react';
import type { BuildingKillVodEvent } from '../../../lib/types';
import { twitchEventBus } from '../../../lib/store';

interface BuildingKillEventComponentProps {
  event: BuildingKillVodEvent;
}

const BuildingKillEventComponent: React.FC<BuildingKillEventComponentProps> = ({ event }) => {
  const jumpToTimestamp = () => {
    twitchEventBus.emit(event.offsetSeconds);
  };

  const getBuildingDisplay = (): string => {
    if (event.buildingType === 'TOWER_BUILDING' && event.towerType) {
      return `${event.towerType.replace('_', ' ')} (${event.laneType.replace('_', ' ')})`;
    }
    return `${event.buildingType.replace('_', ' ')} (${event.laneType.replace('_', ' ')})`;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🏰</span>
          </div>
          <h3 className="font-bold text-indigo-200">Building Destroyed</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            event.isStreamerTeam 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {event.isStreamerTeam ? '🛡️ Allied' : '⚔️ Enemy'}
          </span>
        </div>
      </div>
      
      <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/20 mb-3">
        <p className="text-sm text-indigo-100 font-medium">
          {getBuildingDisplay()} has been destroyed
        </p>
        
        {event.bounty > 0 && (
          <div className="flex items-center gap-2 mt-2 bg-yellow-900/20 p-2 rounded-lg">
            <span className="text-yellow-400">💰</span>
            <span className="text-xs text-yellow-200 font-medium">
              Bounty: {event.bounty} gold
            </span>
          </div>
        )}
      </div>
      
      <button 
        onClick={jumpToTimestamp}
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        🎯 Jump to Moment
      </button>
    </div>
  );
};

export default BuildingKillEventComponent;
