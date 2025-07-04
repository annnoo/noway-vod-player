import React, { useEffect, useRef, useState } from 'react';
import type { VodEvent } from '../../../lib/types';
import { VodEventType } from '../../../lib/types';
import { currentTimeStore, autoScrollStore, autoScrollEnabledStore, twitchEventBus } from '../../../lib/store';
import GameEventComponent from './GameEvent';
import SongEventComponent from './SongEvent';
import ChampionKillEventComponent from './ChampionKillEvent';
import ChampionDeathEventComponent from './ChampionDeathEvent';
import ChampionAssistEventComponent from './ChampionAssistEvent';
import ChampionSpecialKillEventComponent from './ChampionSpecialKillEvent';
import EliteMonsterKillEventComponent from './EliteMonsterKillEvent';
import BuildingKillEventComponent from './BuildingKillEvent';
import GameEndEventComponent from './GameEndEvent';

interface EventTimelineProps {
  events: VodEvent[];
}

const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const eventsContainerRef = useRef<HTMLDivElement>(null);
  const lastScrolledEventId = useRef<string>('');
  
  // Sort events by timestamp
  const sortedEvents = [...events].sort((a, b) => a.offsetSeconds - b.offsetSeconds);

  const formatTimestamp = (offsetSeconds: number): string => {
    const hours = Math.floor(offsetSeconds / 3600);
    const minutes = Math.floor((offsetSeconds % 3600) / 60);
    const seconds = Math.floor(offsetSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const findLatestEvent = (currentTime: number): VodEvent | null => {
    // Find the most recent event that has already occurred (with a small buffer)
    const eventsBeforeCurrentTime = sortedEvents.filter(event => event.offsetSeconds <= currentTime + 2);
    const latestEvent = eventsBeforeCurrentTime.length > 0 ? eventsBeforeCurrentTime[eventsBeforeCurrentTime.length - 1] : null;
    
    console.log('Current time:', currentTime);
    console.log('Events before current time:', eventsBeforeCurrentTime.length);
    console.log('Latest event:', latestEvent?.title, latestEvent?.id, 'at', latestEvent?.offsetSeconds);
    
    return latestEvent;
  };

  const scrollToEvent = (eventId: string) => {
    const eventElement = eventsContainerRef.current?.querySelector(`[data-event-id="${eventId}"]`);
    
    console.log('Found event element:', eventElement, 'for ID:', eventId);
    
    if (eventElement) {
      console.log('Scrolling to event:', eventId);
      // If the event is not in the view, but was the previous event - scroll again
      if (eventId === lastScrolledEventId.current) {
        console.log("Check positioning");
        // If the element is visible, do not scroll again
        const rect = eventElement.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          console.log('Event element is already in view, skipping scroll');
          return;
        }
      }

      eventElement.scrollIntoView({
        behavior: 'smooth',
      });
      setTimeout(() => {
        // Ensure the event is fully visible after scroll
        eventElement.scrollIntoView({ behavior: 'smooth' });
      }, 100); // Small delay to ensure scroll completes
      lastScrolledEventId.current = eventId;
    } else {
      console.warn('Could not find event element with ID:', eventId);
    }
  };

  const seekToTs = (event: VodEvent) => {
    twitchEventBus.emit(event.offsetSeconds);
  };

  const handleAutoScrollToggle = () => {
    setAutoScrollEnabled(!autoScrollEnabled);
    autoScrollEnabledStore.set(!autoScrollEnabled);
  };

  useEffect(() => {
    // Subscribe to auto-scroll enabled state
    const unsubscribeAutoScrollEnabled = autoScrollEnabledStore.subscribe((enabled) => {
      setAutoScrollEnabled(enabled);
    });

    return () => {
      unsubscribeAutoScrollEnabled();
    };
  }, []);

  useEffect(() => {
    // Listen to current time updates and auto-scroll
    const unsubscribeCurrentTime = currentTimeStore.subscribe((currentTime) => {
      if (currentTime > 0 && autoScrollEnabled) {
        const latestEvent = findLatestEvent(currentTime);
        if (latestEvent && latestEvent.id) {
          scrollToEvent(latestEvent.id);
        }
      }
    });

    return () => {
      unsubscribeCurrentTime();
    };
  }, [autoScrollEnabled]);

  useEffect(() => {
    // Listen to manual scroll requests
    const unsubscribeAutoScroll = autoScrollStore.subscribe((eventId) => {
      if (eventId) {
        scrollToEvent(eventId);
      }
    });

    return () => {
      unsubscribeAutoScroll();
    };
  }, []);

  const renderEventComponent = (event: VodEvent) => {
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
          <div className="text-sm">
            <h3 className="font-semibold text-gray-300">{JSON.stringify(event)}</h3>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="sticky p-5 top-0 bg-gray-900/90 backdrop-blur-sm z-10 border-b pb-4 -mb-1 rounded-t-xl border-transparent">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ⚡ Event Timeline
          </h2>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer group">
              <input 
                type="checkbox" 
                checked={autoScrollEnabled}
                onChange={handleAutoScrollToggle}
                className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-2 transition-all"
              />
              <span className="select-none text-gray-300 group-hover:text-white transition-colors">
                🎯 Auto-scroll
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Scrollable Events Container */}
      <div ref={eventsContainerRef} className="flex-1 space-y-4 overflow-y-auto p-4 bg-gray-900/90">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📭</span>
            </div>
            <p className="text-gray-400 text-lg">No events found for this VOD.</p>
          </div>
        ) : (
          sortedEvents.map((event) => (
            <div 
              key={event.id}
              data-event-id={event.id}
              className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800/60 hover:border-gray-600/50 transition-all duration-300 scroll-mt-4 shadow-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <button 
                  type="button"
                  className="text-sm hover:underline hover:cursor-pointer font-mono font-medium text-purple-400 hover:text-purple-300 bg-purple-900/20 hover:bg-purple-900/40 px-3 py-1 rounded-lg transition-all duration-200 transform hover:scale-105"
                  onClick={() => seekToTs(event)}
                >
                  {formatTimestamp(event.offsetSeconds)}
                </button>
                <span className="text-xs text-gray-500 capitalize bg-gray-900/50 px-2 py-1 rounded-full">
                  {event.type.replace('_', ' ').toLowerCase()}
                </span> 
              </div>
              
              {renderEventComponent(event)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventTimeline;
