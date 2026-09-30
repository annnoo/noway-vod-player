import React from 'react';
import type { ViewportState, TrackConfig } from './types';
import type { VodEvent, GameEvent, SongEvent } from '../../../../lib/types';
import { VodEventType } from '../../../../lib/types';
import SpanBlock from './SpanBlock';
import { twitchEventBus } from '../../../../lib/store';

interface ScrubberTrackProps {
  config: TrackConfig;
  events: VodEvent[];
  viewport: ViewportState;
  activeEventId?: string;
  onEventClick: (event: VodEvent) => void;
  onZoomToTimeframe?: (start: number, end: number) => void;
}

const ScrubberTrack: React.FC<ScrubberTrackProps> = ({
  config,
  events,
  viewport,
  activeEventId,
  onEventClick,
  onZoomToTimeframe,
}) => {
  if (!config.visible) return null;

  // Filter events for this track
  const filteredEvents = events.filter(config.eventFilter);

  const formatTimestamp = (offsetSeconds: number): string => {
    const hours = Math.floor(offsetSeconds / 3600);
    const minutes = Math.floor((offsetSeconds % 3600) / 60);
    const seconds = Math.floor(offsetSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEventSpanStyle = (event: VodEvent) => {
    switch (event.type) {
      case VodEventType.CHAMPION_KILL: {
        const ev = event as any;
        return {
          label: `⚔️ Kill: ${ev.victimChampionName || 'Enemy'}`,
          color: 'bg-rose-950/50 border-rose-500/50 text-rose-200',
        };
      }
      case VodEventType.CHAMPION_DEATH: {
        const ev = event as any;
        return {
          label: `💀 Death: ${ev.killerChampionName || 'Enemy'}`,
          color: 'bg-red-950/50 border-red-500/50 text-red-200',
        };
      }
      case VodEventType.CHAMPION_ASSIST: {
        const ev = event as any;
        return {
          label: `🛡️ Assist: ${ev.victimChampionName || 'Enemy'}`,
          color: 'bg-sky-950/50 border-sky-500/50 text-sky-200',
        };
      }
      case VodEventType.CHAMPION_SPECIAL_KILL: {
        const ev = event as any;
        const typeStr = ev.killType === 'KILL_FIRST_BLOOD' ? 'First Blood' : ev.killType?.replace('KILL_', '') || 'Special';
        return {
          label: `🔥 ${typeStr}`,
          color: 'bg-purple-950/50 border-purple-500/50 text-purple-200',
        };
      }
      case VodEventType.ELITE_MONSTER_KILL: {
        const ev = event as any;
        const icon = ev.monsterType === 'BARON' ? '👾' : '🐉';
        return {
          label: `${icon} Slain: ${ev.monsterName || 'Monster'}`,
          color: 'bg-yellow-950/50 border-yellow-500/50 text-yellow-200',
        };
      }
      case VodEventType.BUILDING_KILL: {
        const ev = event as any;
        const bType = ev.buildingType === 'TOWER_BUILDING' ? 'Tower' : 'Inhib';
        const lane = ev.laneType?.replace('_LANE', '') || '';
        return {
          label: `🏰 ${lane} ${bType}`,
          color: 'bg-blue-950/50 border-blue-500/50 text-blue-200',
        };
      }
      case VodEventType.GAME_END: {
        return {
          label: `🏁 Game End`,
          color: 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200',
        };
      }
      default:
        return {
          label: event.title || 'Event',
          color: 'bg-slate-900/50 border-white/10 text-slate-200',
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

    if (config.id === 'events') {
      // 3. Event Clustering Logic
      const sortedPointEvents = [...filteredEvents].sort((a, b) => a.offsetSeconds - b.offsetSeconds);
      
      // Calculate clustering threshold: group items if they are closer than 2% of the visible time window
      const viewportSize = viewport.viewEnd - viewport.viewStart;
      const thresholdSeconds = Math.max(1, viewportSize * 0.02);

      const clusters: VodEvent[][] = [];
      let currentCluster: VodEvent[] = [];

      for (const ev of sortedPointEvents) {
        if (currentCluster.length === 0) {
          currentCluster.push(ev);
        } else {
          const lastAdded = currentCluster[currentCluster.length - 1];
          if (ev.offsetSeconds - lastAdded.offsetSeconds < thresholdSeconds) {
            currentCluster.push(ev);
          } else {
            clusters.push(currentCluster);
            currentCluster = [ev];
          }
        }
      }
      if (currentCluster.length > 0) {
        clusters.push(currentCluster);
      }

      return clusters.map((cluster, cIndex) => {
        if (cluster.length === 1) {
          const event = cluster[0];
          const start = event.offsetSeconds;
          const end = start + 25; 
          const { label, color } = getEventSpanStyle(event);
          const isSelected = activeEventId === event.id;
          const tooltip = `[${event.type.replace(/_/g, ' ')}] ${event.title} | Click to seek`;

          return (
            <SpanBlock
              key={event.id}
              startSeconds={start}
              endSeconds={end}
              viewport={viewport}
              label={label}
              sublabel=""
              color={`${color} ${isSelected ? 'ring-2 ring-pink-500 z-10 scale-[1.01]' : ''}`}
              onClick={() => onEventClick(event)}
              tooltip={tooltip}
            />
          );
        } else {
          // Multiple events clustered
          const firstEvent = cluster[0];
          const lastEvent = cluster[cluster.length - 1];
          const start = firstEvent.offsetSeconds;
          const end = lastEvent.offsetSeconds + 25;
          
          const label = `💥 Teamfight/Skirmish: ${cluster.length} Events`;
          const sublabel = "Click to expand match details";
          const color = "bg-indigo-950/50 border-indigo-500/50 text-indigo-200 hover:border-indigo-400/80";
          
          const tooltipList = cluster.map(e => `• [${formatTimestamp(e.offsetSeconds)}] ${e.title}`).join('\n');
          const tooltip = `Combat Cluster (${cluster.length} events):\n${tooltipList}\n\nClick to seek & zoom into timeline recap`;

          return (
            <SpanBlock
              key={`cluster-${cIndex}-${start}`}
              startSeconds={start}
              endSeconds={end}
              viewport={viewport}
              label={label}
              sublabel={sublabel}
              color={color}
              onClick={() => {
                // Seek to start of teamfight
                twitchEventBus.emit(start);
                
                // Zoom in timelines slightly wider than the cluster limits
                if (onZoomToTimeframe) {
                  onZoomToTimeframe(Math.max(0, start - 30), end + 30);
                }
              }}
              tooltip={tooltip}
            />
          );
        }
      });
    }

    return null;
  };

  return (
    <div 
      className="relative flex items-center border-b border-white/5 bg-slate-950/20"
      style={{ height: `${config.height}px` }}
    >
      {/* Left fixed track label - hidden on mobile, visible on desktop */}
      <div className="hidden md:flex absolute left-0 top-0 bottom-0 w-36 items-center pl-3 border-r border-white/5 bg-slate-950/90 z-15 select-none">
        <span className="text-xs md:text-sm font-extrabold text-gray-300 tracking-wider uppercase truncate">
          {config.label}
        </span>
      </div>

      {/* Floating track label overlay badge - visible on mobile screen sizes only */}
      <div className="md:hidden absolute left-2 top-2 z-15 bg-slate-950/80 px-2 py-0.5 rounded border border-white/10 text-[9px] font-extrabold text-gray-300 tracking-wider uppercase backdrop-blur-sm pointer-events-none select-none">
        {config.label}
      </div>

      {/* Content track wrapper - fills 100% width on mobile (ml-0), offsets on desktop (ml-36) */}
      <div className="relative flex-grow h-full ml-0 md:ml-36">
        {renderSpans()}
      </div>
    </div>
  );
};

export default ScrubberTrack;
