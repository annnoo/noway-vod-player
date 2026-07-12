import React, { useEffect, useState, useRef } from 'react';
import type { VodEvent, GameEvent, SongEvent } from '../../../lib/types';
import { VodEventType } from '../../../lib/types';
import { currentTimeStore, autoScrollEnabledStore, twitchEventBus } from '../../../lib/store';
import GameEventComponent from './GameEvent';
import SongEventComponent from './SongEvent';
import ChampionKillEventComponent from './ChampionKillEvent';
import ChampionDeathEventComponent from './ChampionDeathEvent';
import ChampionAssistEventComponent from './ChampionAssistEvent';
import ChampionSpecialKillEventComponent from './ChampionSpecialKillEvent';
import EliteMonsterKillEventComponent from './EliteMonsterKillEvent';
import BuildingKillEventComponent from './BuildingKillEvent';
import GameEndEventComponent from './GameEndEvent';
import EventScrubber from './scrubber/EventScrubber';
import type { ViewportState } from './scrubber/types';
import { VList } from "virtua";

interface EventTimelineProps {
  events: VodEvent[];
  vodDuration: number;
}

const EventTimeline: React.FC<EventTimelineProps> = ({ events, vodDuration }) => {
  const [currentPlayheadTime, setCurrentPlayheadTime] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<VodEvent | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'kills' | 'objectives' | 'songs' | 'game'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const searchableListRef = useRef<any>(null);

  // Controlled Scrubber Viewport state (Lifting state up)
  const [viewport, setViewport] = useState<ViewportState>({
    viewStart: 0,
    viewEnd: vodDuration,
  });

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => a.offsetSeconds - b.offsetSeconds);

  // Find the most recent event before current time
  const findLatestEvent = (currentTime: number): VodEvent | null => {
    const eventsBeforeCurrentTime = sortedEvents.filter(event => event.offsetSeconds <= currentTime + 1.5);
    return eventsBeforeCurrentTime.length > 0 ? eventsBeforeCurrentTime[eventsBeforeCurrentTime.length - 1] : null;
  };

  const activeEvent = selectedEvent || findLatestEvent(currentPlayheadTime) || sortedEvents[0];

  const seekToTime = (seconds: number) => {
    twitchEventBus.emit(seconds);
  };

  const handleEventClick = (event: VodEvent) => {
    seekToTime(event.offsetSeconds);
    setSelectedEvent(event);

    // Zoom into game timeframe when clicked
    if (event.type === VodEventType.GAME) {
      const game = event as GameEvent;
      setViewport({
        viewStart: game.offsetSeconds,
        viewEnd: game.offsetSeconds + game.duration,
      });
    }
  };

  // Subscribe to updates from twitch playhead
  useEffect(() => {
    const unsubscribeCurrentTime = currentTimeStore.subscribe((currentTime) => {
      setCurrentPlayheadTime(currentTime);
    });

    return () => {
      unsubscribeCurrentTime();
    };
  }, []);

  // Time formatter helper
  const formatTimestamp = (offsetSeconds: number): string => {
    const hours = Math.floor(offsetSeconds / 3600);
    const minutes = Math.floor((offsetSeconds % 3600) / 60);
    const seconds = Math.floor(offsetSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Full field-based search matching logic
  const matchesSearch = (event: VodEvent, query: string): boolean => {
    const q = query.toLowerCase().trim();
    if (!q) return true;

    const fields: string[] = [
      event.title || '',
      event.description || '',
      event.type || '',
    ];

    // Add type-specific details for search completeness
    if ('championName' in event && event.championName) {
      fields.push(event.championName);
    }
    if ('victimChampionName' in event && event.victimChampionName) {
      fields.push(event.victimChampionName);
    }
    if ('killerChampionName' in event && event.killerChampionName) {
      fields.push(event.killerChampionName);
    }
    if ('artist' in event && event.artist) {
      fields.push(event.artist);
    }
    if ('monsterName' in event && event.monsterName) {
      fields.push(event.monsterName);
    }
    if ('killType' in event && event.killType) {
      fields.push(event.killType);
    }
    if ('laneType' in event && event.laneType) {
      fields.push(event.laneType);
    }
    if ('buildingType' in event && event.buildingType) {
      fields.push(event.buildingType);
    }

    return fields.some(f => f.toLowerCase().includes(q));
  };

  // Filtering Logic
  const filteredEvents = sortedEvents.filter(event => {
    if (filterType === 'all') return true;
    if (filterType === 'kills') {
      return [VodEventType.CHAMPION_KILL, VodEventType.CHAMPION_DEATH, VodEventType.CHAMPION_SPECIAL_KILL].includes(event.type);
    }
    if (filterType === 'objectives') {
      return [VodEventType.ELITE_MONSTER_KILL, VodEventType.BUILDING_KILL].includes(event.type);
    }
    if (filterType === 'songs') {
      return event.type === VodEventType.SONG;
    }
    if (filterType === 'game') {
      return [VodEventType.GAME, VodEventType.GAME_END].includes(event.type);
    }
    return true;
  });

  const searchedEvents = filteredEvents.filter(event => matchesSearch(event, searchTerm));

  const renderEventComponent = (event: VodEvent | null) => {
    if (!event) return <div className="text-gray-500 text-center py-8">No event active</div>;
    
    switch (event.type) {
      case VodEventType.GAME:
        return <GameEventComponent event={event} />;
      case VodEventType.SONG:
        return <SongEventComponent event={event} />;
      case VodEventType.CHAMPION_KILL:
        return <ChampionKillEventComponent event={event} />;
      case VodEventType.CHAMPION_DEATH:
        return <ChampionDeathEventComponent event={event} />;
      case VodEventType.CHAMPION_ASSIST:
        return <ChampionAssistEventComponent event={event} />;
      case VodEventType.CHAMPION_SPECIAL_KILL:
        return <ChampionSpecialKillEventComponent event={event} />;
      case VodEventType.ELITE_MONSTER_KILL:
        return <EliteMonsterKillEventComponent event={event} />;
      case VodEventType.BUILDING_KILL:
        return <BuildingKillEventComponent event={event} />;
      case VodEventType.GAME_END:
        return <GameEndEventComponent event={event} />;
      default:
        return (
          <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
            <h3 className="font-semibold text-gray-300 truncate">{event.title}</h3>
            {event.description && <p className="text-xs text-gray-400 mt-1">{event.description}</p>}
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      {/* 1. Premiere-Style Scrubber Section */}
      <EventScrubber
        events={events}
        vodDuration={vodDuration}
        viewport={viewport}
        setViewport={setViewport}
        activeEventId={activeEvent?.id}
        onEventClick={handleEventClick}
      />

      {/* 2. Detail & Search Dashboard (Inline Side-by-Side) */}
      <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
        
        {/* Active Event Card details (Left) */}
        <div className="flex-1 lg:w-5/12 flex flex-col">
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-sm flex flex-col h-full justify-between">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <span className="text-sm font-semibold tracking-wide text-pink-400 uppercase">
                  📌 Active Event
                </span>
                {activeEvent && (
                  <button 
                    onClick={() => seekToTime(activeEvent.offsetSeconds)}
                    className="text-xs font-mono font-medium text-pink-400 hover:text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 px-3 py-1 rounded-lg border border-pink-500/20 transition-all cursor-pointer"
                  >
                    ⏱️ Play from {formatTimestamp(activeEvent.offsetSeconds)}
                  </button>
                )}
              </div>
              
              <div className="flex-grow flex flex-col gap-4">
                {renderEventComponent(activeEvent)}
                
                {/* Recap sub-events timeframe feed if activeEvent is a GAME */}
                {activeEvent?.type === VodEventType.GAME && (() => {
                  const game = activeEvent as GameEvent;
                  const subEvents = sortedEvents.filter(e => 
                    e.offsetSeconds >= game.offsetSeconds && 
                    e.offsetSeconds <= game.offsetSeconds + game.duration &&
                    e.id !== game.id
                  );
                  
                  return (
                    <div className="flex flex-col flex-grow mt-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>⚔️</span> Match Events Log ({subEvents.length})
                      </h4>
                      <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto p-2 bg-slate-950/50 rounded-xl border border-white/5 space-y-1.5 scrollbar-thin">
                        {subEvents.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-xs text-gray-500 font-mono">
                            No recorded events in this match.
                          </div>
                        ) : (
                          subEvents.map(subEv => {
                            const isSubSelected = selectedEvent?.id === subEv.id;
                            const relativeTime = subEv.offsetSeconds - game.offsetSeconds;
                            const evIcon = 
                              subEv.type === 'CHAMPION_KILL' || subEv.type === 'CHAMPION_SPECIAL_KILL' ? '⚔️' :
                              subEv.type === 'CHAMPION_DEATH' ? '💀' :
                              subEv.type === 'ELITE_MONSTER_KILL' ? '🐉' :
                              subEv.type === 'BUILDING_KILL' ? '🏰' :
                              subEv.type === 'SONG' ? '🎵' : '🏁';
                              
                            return (
                              <div
                                key={subEv.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(subEv);
                                }}
                                className={`flex items-center justify-between p-2 rounded-lg border transition-all text-xs cursor-pointer ${
                                  isSubSelected
                                    ? 'bg-pink-500/10 border-pink-500/30 text-white font-medium shadow-sm'
                                    : 'bg-slate-900/40 border-white/5 hover:border-white/10 text-gray-300 hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <span>{evIcon}</span>
                                  <span className="truncate">{subEv.title}</span>
                                </div>
                                <span className="text-[9px] font-mono text-gray-400 bg-slate-950 px-1.5 py-0.5 rounded border border-white/5">
                                  {formatTimestamp(relativeTime)}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            {activeEvent && (
              <div className="text-[10px] text-gray-500 font-mono mt-4 text-right">
                Offset: {activeEvent.offsetSeconds}s
              </div>
            )}
          </div>
        </div>

        {/* Searchable Events List (Right) */}
        <div className="flex-1 lg:w-7/12 flex flex-col">
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-sm flex flex-col h-full">
            <div className="border-b border-white/5 pb-3 mb-4">
              <h3 className="font-bold text-white text-base tracking-wide mb-3 flex items-center gap-2">
                <span>📋</span> All VOD Events ({searchedEvents.length})
              </h3>
              
              {/* Search Bar + Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <input
                  type="text"
                  placeholder="🔍 Search title, champ, song, drake..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-72 bg-slate-955 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all font-sans"
                />
                
                <div className="flex flex-wrap gap-1.5 select-none">
                  {(['all', 'kills', 'objectives', 'songs', 'game'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                        filterType === type 
                          ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/20' 
                          : 'bg-slate-950 border-white/5 text-gray-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      {type === 'all' && 'All'}
                      {type === 'kills' && '⚔️ Kills'}
                      {type === 'objectives' && '🐉 Obj'}
                      {type === 'songs' && '🎵 Songs'}
                      {type === 'game' && '🎮 Match'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Virtualized Event List */}
            <div className="flex-1 min-h-[300px] max-h-[400px] overflow-hidden p-1 bg-slate-950/40 rounded-xl border border-white/5">
              {searchedEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500 font-mono">
                  No events match your search query.
                </div>
              ) : (
                <VList 
                  style={{ height: '100%', maxHeight: '380px' }} 
                  ref={searchableListRef} 
                  className="overflow-y-auto pr-1 space-y-1.5"
                >
                  {searchedEvents.map((event) => {
                    const isSelected = activeEvent?.id === event.id;
                    const eventIcon = 
                      event.type === 'CHAMPION_KILL' || event.type === 'CHAMPION_SPECIAL_KILL' ? '⚔️' :
                      event.type === 'CHAMPION_DEATH' ? '💀' :
                      event.type === 'ELITE_MONSTER_KILL' ? '🐉' :
                      event.type === 'BUILDING_KILL' ? '🏰' :
                      event.type === 'SONG' ? '🎵' : '🎮';

                    // Include artist details inside Song titles for all VOD events
                    const displayTitle = event.type === VodEventType.SONG 
                      ? `${event.title} - ${(event as SongEvent).artist}` 
                      : event.title;

                    return (
                      <div 
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                          isSelected 
                            ? 'bg-pink-500/10 border-pink-500/40 text-white shadow-lg shadow-pink-500/5' 
                            : 'bg-slate-900/30 border-white/5 hover:border-white/10 hover:bg-slate-900/60 text-gray-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-sm select-none">{eventIcon}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate pr-2">{displayTitle}</div>
                            <div className="text-[9px] text-gray-500 capitalize">
                              {event.type.replace(/_/g, ' ').toLowerCase()}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-medium bg-slate-950 px-2 py-0.5 rounded border border-white/5 text-gray-400 whitespace-nowrap">
                          {formatTimestamp(event.offsetSeconds)}
                        </span>
                      </div>
                    );
                  })}
                </VList>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventTimeline;
