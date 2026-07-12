import React from 'react';
import type { ViewportState, TrackConfig } from './types';
import type { VodEvent, GameEvent, SongEvent } from '../../../../lib/types';
import { VodEventType } from '../../../../lib/types';
import SpanBlock from './SpanBlock';
import EventMarker from './EventMarker';

interface ScrubberTrackProps {
  config: TrackConfig;
  events: VodEvent[];
  viewport: ViewportState;
  activeEventId?: string;
  onEventClick: (event: VodEvent) => void;
}

const ScrubberTrack: React.FC<ScrubberTrackProps> = ({
  config,
  events,
  viewport,
  activeEventId,
  onEventClick,
}) => {
  if (!config.visible) return null;

  // Filter events for this track
  const filteredEvents = events.filter(config.eventFilter);

  const getEventSpanStyle = (event: VodEvent) => {
    switch (event.type) {
      case VodEventType.CHAMPION_KILL: {
        const ev = event as any;
        return {
          label: `⚔️ Kill: ${ev.victimChampionName || 'Enemy'}`,
          color: 'bg-rose-950/50 border-rose-500/50 text-rose-200',
          imageUrl: ev.championId ? `https://cdn.nowaycdn.com/images/champions/square/16x/${ev.championId}.png` : undefined,
        };
      }
      case VodEventType.CHAMPION_DEATH: {
        const ev = event as any;
        return {
          label: `💀 Death: ${ev.killerChampionName || 'Enemy'}`,
          color: 'bg-red-950/50 border-red-500/50 text-red-200',
          imageUrl: ev.championId ? `https://cdn.nowaycdn.com/images/champions/square/16x/${ev.championId}.png` : undefined,
        };
      }
      case VodEventType.CHAMPION_ASSIST: {
        const ev = event as any;
        return {
          label: `🛡️ Assist: ${ev.victimChampionName || 'Enemy'}`,
          color: 'bg-sky-950/50 border-sky-500/50 text-sky-200',
          imageUrl: ev.championId ? `https://cdn.nowaycdn.com/images/champions/square/16x/${ev.championId}.png` : undefined,
        };
      }
      case VodEventType.CHAMPION_SPECIAL_KILL: {
        const ev = event as any;
        const typeStr = ev.killType === 'KILL_FIRST_BLOOD' ? 'First Blood' : ev.killType?.replace('KILL_', '') || 'Special';
        return {
          label: `🔥 ${typeStr}`,
          color: 'bg-purple-950/50 border-purple-500/50 text-purple-200',
          imageUrl: ev.championId ? `https://cdn.nowaycdn.com/images/champions/square/16x/${ev.championId}.png` : undefined,
        };
      }
      case VodEventType.ELITE_MONSTER_KILL: {
        const ev = event as any;
        const icon = ev.monsterType === 'BARON' ? '👾' : '🐉';
        return {
          label: `${icon} Slain: ${ev.monsterName || 'Monster'}`,
          color: 'bg-yellow-950/50 border-yellow-500/50 text-yellow-200',
          imageUrl: undefined,
        };
      }
      case VodEventType.BUILDING_KILL: {
        const ev = event as any;
        const bType = ev.buildingType === 'TOWER_BUILDING' ? 'Tower' : 'Inhib';
        const lane = ev.laneType?.replace('_LANE', '') || '';
        return {
          label: `🏰 ${lane} ${bType}`,
          color: 'bg-blue-950/50 border-blue-500/50 text-blue-200',
          imageUrl: undefined,
        };
      }
      case VodEventType.GAME_END: {
        return {
          label: `🏁 Game End`,
          color: 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200',
          imageUrl: undefined,
        };
      }
      default:
        return {
          label: event.title || 'Event',
          color: 'bg-slate-900/50 border-white/10 text-slate-200',
          imageUrl: undefined,
        };
    }
  };

  const renderSpans = () => {
    if (config.id === 'games') {
      return (filteredEvents as GameEvent[]).map((game) => {
        const start = game.offsetSeconds;
        const end = game.offsetSeconds + game.duration;
        const isWin = game.won;
        
        const label = `Game: ${game.championName}`;
        let sublabel = '';
        if (game.kills !== undefined && game.deaths !== undefined && game.assists !== undefined) {
          sublabel = `${game.kills}/${game.deaths}/${game.assists}`;
        }
        
        const color = isWin 
          ? 'bg-emerald-600/30 border-emerald-500/40 text-emerald-200' 
          : 'bg-red-900/30 border-red-500/40 text-red-200';
          
        const tooltip = `${game.title} | Result: ${isWin ? 'Victory' : 'Defeat'} | Click to seek & zoom`;
        const imageUrl = game.championId 
          ? `https://cdn.nowaycdn.com/images/champions/square/16x/${game.championId}.png` 
          : undefined;

        return (
          <SpanBlock
            key={game.id}
            startSeconds={start}
            endSeconds={end}
            viewport={viewport}
            label={label}
            sublabel={sublabel}
            color={color}
            onClick={() => onEventClick(game)}
            tooltip={tooltip}
            imageUrl={imageUrl}
          />
        );
      });
    }

    if (config.id === 'songs') {
      const sortedSongs = (filteredEvents as SongEvent[]).sort((a, b) => a.offsetSeconds - b.offsetSeconds);
      
      return sortedSongs.map((song, index) => {
        const start = song.offsetSeconds;
        
        let duration = song.duration;
        if (!duration) {
          const nextSong = sortedSongs[index + 1];
          if (nextSong) {
            duration = Math.min(nextSong.offsetSeconds - song.offsetSeconds, 1200);
          } else {
            duration = 1200; // default cap
          }
        }
        
        const end = start + duration;
        const tooltip = `🎵 ${song.title} - ${song.artist} | Click to seek`;

        return (
          <SpanBlock
            key={song.id}
            startSeconds={start}
            endSeconds={end}
            viewport={viewport}
            label={song.title}
            sublabel={song.artist}
            color="bg-purple-900/30 border-purple-500/30 text-purple-200"
            onClick={() => onEventClick(song)}
            tooltip={tooltip}
          />
        );
      });
    }

    return null;
  };

  const renderMarkers = () => {
    return filteredEvents.map((event) => {
      const isSelected = activeEventId === event.id;
      const tooltip = `[${event.type.replace(/_/g, ' ')}] ${event.title} | Click to seek`;

      return (
        <EventMarker
          key={event.id}
          offsetSeconds={event.offsetSeconds}
          viewport={viewport}
          isActive={isSelected}
          onClick={() => onEventClick(event)}
          tooltip={tooltip}
          event={event}
        />
      );
    });
  };

  return (
    <div 
      className="relative flex items-center border-b border-white/5 bg-slate-950/20"
      style={{ height: `${config.height}px` }}
    >
      {/* Left fixed track label */}
      <div className="absolute left-0 top-0 bottom-0 w-36 flex items-center pl-3 border-r border-white/5 bg-slate-950/90 z-15 select-none">
        <span className="text-xs md:text-sm font-extrabold text-gray-300 tracking-wider uppercase truncate">
          {config.label}
        </span>
      </div>

      {/* Outer wrapper offset by w-36 (ml-36) */}
      <div className="relative flex-1 h-full ml-36">
        {config.renderMode === 'span' ? renderSpans() : renderMarkers()}
      </div>
    </div>
  );
};

export default ScrubberTrack;
