import React, { useState, useEffect, useRef } from 'react';
import type { ViewportState, TrackConfig } from './types';
import { DEFAULT_TRACKS } from './types';
import type { VodEvent } from '../../../../lib/types';
import { currentTimeStore, autoScrollEnabledStore, twitchEventBus } from '../../../../lib/store';
import ScrubberToolbar from './ScrubberToolbar';
import TimeRuler from './TimeRuler';
import Playhead from './Playhead';
import ScrubberTrack from './ScrubberTrack';

interface EventScrubberProps {
  events: VodEvent[];
  vodDuration: number;
  activeEventId?: string;
  onEventClick: (event: VodEvent) => void;
  viewport: ViewportState;
  setViewport: React.Dispatch<React.SetStateAction<ViewportState>>;
}

const EventScrubber: React.FC<EventScrubberProps> = ({
  events,
  vodDuration,
  activeEventId,
  onEventClick,
  viewport,
  setViewport,
}) => {
  const [tracks, setTracks] = useState<TrackConfig[]>(() => {
    return DEFAULT_TRACKS.map(track => ({
      ...track,
      visible: track.defaultVisible ?? false
    }));
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [autoFollow, setAutoFollow] = useState(true);

  // Drag Panning State Refs
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startViewStart = useRef(0);
  const startViewEnd = useRef(0);

  // Touch Pinch-to-Zoom State Refs
  const isPinching = useRef(false);
  const startPinchDist = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const windowSize = viewport.viewEnd - viewport.viewStart;
  const zoomLevelDisplay = vodDuration / Math.max(1, windowSize);

  // Helper to dynamically calculate label width offset depending on breakpoint
  const getLabelOffset = (): number => {
    if (containerRef.current && containerRef.current.clientWidth < 768) {
      return 0; // 0px offset on mobile
    }
    return 144; // 144px (w-36) offset on desktop
  };

  // Subscribe to current player time and auto-scroll state
  useEffect(() => {
    const unsubTime = currentTimeStore.subscribe((time) => {
      setCurrentTime(time);
    });

    const unsubScroll = autoScrollEnabledStore.subscribe((enabled) => {
      setAutoFollow(enabled);
    });

    return () => {
      unsubTime();
      unsubScroll();
    };
  }, []);

  // Sync viewport center with playhead when player time moves and autoFollow is active
  useEffect(() => {
    if (!autoFollow || isDragging.current || isPinching.current) return;

    const currentWindowSize = viewport.viewEnd - viewport.viewStart;
    
    // Position playhead in the middle 50% of screen. If outside, re-center viewport.
    const playheadRatio = (currentTime - viewport.viewStart) / currentWindowSize;
    if (playheadRatio < 0.2 || playheadRatio > 0.8) {
      let newStart = currentTime - currentWindowSize / 2;
      let newEnd = currentTime + currentWindowSize / 2;

      if (newStart < 0) {
        newStart = 0;
        newEnd = currentWindowSize;
      }
      if (newEnd > vodDuration) {
        newEnd = vodDuration;
        newStart = Math.max(0, vodDuration - currentWindowSize);
      }

      setViewport({ viewStart: newStart, viewEnd: newEnd });
    }
  }, [currentTime, autoFollow, vodDuration, viewport.viewStart, viewport.viewEnd, setViewport]);

  // Prevent default page scroll on wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelRaw = (e: WheelEvent) => {
      e.preventDefault(); // Stop page scrolling
      
      const rect = container.getBoundingClientRect();
      const offset = getLabelOffset();
      const x = e.clientX - rect.left - offset;
      const activeWidth = rect.width - offset;

      const hoverRatio = activeWidth > 0 ? Math.max(0, Math.min(1, x / activeWidth)) : 0.5;
      const zoomFactor = e.deltaY > 0 ? 1.25 : 1 / 1.25;

      const currentWindowSize = viewport.viewEnd - viewport.viewStart;
      const centerTime = viewport.viewStart + hoverRatio * currentWindowSize;
      let newWindowSize = currentWindowSize * zoomFactor;

      newWindowSize = Math.max(60, Math.min(vodDuration, newWindowSize));

      let newStart = centerTime - hoverRatio * newWindowSize;
      let newEnd = centerTime + (1 - hoverRatio) * newWindowSize;

      if (newStart < 0) {
        newStart = 0;
        newEnd = newWindowSize;
      }
      if (newEnd > vodDuration) {
        newEnd = vodDuration;
        newStart = Math.max(0, vodDuration - newWindowSize);
      }

      setViewport({ viewStart: newStart, viewEnd: newEnd });
    };

    container.addEventListener('wheel', handleWheelRaw, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheelRaw);
    };
  }, [viewport.viewStart, viewport.viewEnd, vodDuration, setViewport]);

  const handleToggleTrack = (trackId: string) => {
    setTracks(prev =>
      prev.map(t => (t.id === trackId ? { ...t, visible: !t.visible } : t))
    );
  };

  const adjustZoom = (factor: number, centerRatio: number = 0.5) => {
    const currentWindowSize = viewport.viewEnd - viewport.viewStart;
    const centerTime = viewport.viewStart + centerRatio * currentWindowSize;
    let newWindowSize = currentWindowSize * factor;

    newWindowSize = Math.max(60, Math.min(vodDuration, newWindowSize));

    let newStart = centerTime - centerRatio * newWindowSize;
    let newEnd = centerTime + (1 - centerRatio) * newWindowSize;

    if (newStart < 0) {
      newStart = 0;
      newEnd = newWindowSize;
    }
    if (newEnd > vodDuration) {
      newEnd = vodDuration;
      newStart = Math.max(0, vodDuration - newWindowSize);
    }

    setViewport({ viewStart: newStart, viewEnd: newEnd });
  };

  const handleZoomIn = () => adjustZoom(0.7);
  const handleZoomOut = adjustZoom.bind(null, 1.4, 0.5);
  const handleZoomReset = () => {
    setViewport({ viewStart: 0, viewEnd: vodDuration });
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.cursor-pointer') && target !== containerRef.current) {
      return;
    }

    isDragging.current = true;
    startX.current = e.clientX;
    startViewStart.current = viewport.viewStart;
    startViewEnd.current = viewport.viewEnd;
    
    if (autoFollow) {
      autoScrollEnabledStore.set(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !containerRef.current) return;

    const deltaX = e.clientX - startX.current;
    const offset = getLabelOffset();
    const activeWidth = containerRef.current.clientWidth - offset;
    if (activeWidth <= 0) return;

    const currentWindowSize = startViewEnd.current - startViewStart.current;
    const timeDelta = -(deltaX / activeWidth) * currentWindowSize;

    let newStart = startViewStart.current + timeDelta;
    let newEnd = startViewEnd.current + timeDelta;

    if (newStart < 0) {
      newStart = 0;
      newEnd = currentWindowSize;
    }
    if (newEnd > vodDuration) {
      newEnd = vodDuration;
      newStart = Math.max(0, vodDuration - currentWindowSize);
    }

    setViewport({ viewStart: newStart, viewEnd: newEnd });
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Touch Gesture Panning & Zoom handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.cursor-pointer') && target !== containerRef.current) {
      return;
    }

    if (e.touches.length === 1) {
      isDragging.current = true;
      isPinching.current = false;
      startX.current = e.touches[0].clientX;
      startViewStart.current = viewport.viewStart;
      startViewEnd.current = viewport.viewEnd;

      if (autoFollow) {
        autoScrollEnabledStore.set(false);
      }
    } else if (e.touches.length === 2) {
      isPinching.current = true;
      isDragging.current = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      startPinchDist.current = dist;
      startViewStart.current = viewport.viewStart;
      startViewEnd.current = viewport.viewEnd;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    if (e.touches.length === 1 && isDragging.current) {
      const deltaX = e.touches[0].clientX - startX.current;
      const offset = getLabelOffset();
      const activeWidth = containerRef.current.clientWidth - offset;
      if (activeWidth <= 0) return;

      const currentWindowSize = startViewEnd.current - startViewStart.current;
      const timeDelta = -(deltaX / activeWidth) * currentWindowSize;

      let newStart = startViewStart.current + timeDelta;
      let newEnd = startViewEnd.current + timeDelta;

      if (newStart < 0) {
        newStart = 0;
        newEnd = currentWindowSize;
      }
      if (newEnd > vodDuration) {
        newEnd = vodDuration;
        newStart = Math.max(0, vodDuration - currentWindowSize);
      }

      setViewport({ viewStart: newStart, viewEnd: newEnd });
    } else if (e.touches.length === 2 && isPinching.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (dist === 0) return;

      const scaleFactor = startPinchDist.current / dist;
      const currentWindowSize = startViewEnd.current - startViewStart.current;
      let newWindowSize = currentWindowSize * scaleFactor;

      newWindowSize = Math.max(60, Math.min(vodDuration, newWindowSize));

      const rect = containerRef.current.getBoundingClientRect();
      const offset = getLabelOffset();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left - offset;
      const activeWidth = rect.width - offset;
      const centerRatio = activeWidth > 0 ? Math.max(0, Math.min(1, midX / activeWidth)) : 0.5;

      const centerTime = startViewStart.current + centerRatio * currentWindowSize;
      let newStart = centerTime - centerRatio * newWindowSize;
      let newEnd = centerTime + (1 - centerRatio) * newWindowSize;

      if (newStart < 0) {
        newStart = 0;
        newEnd = newWindowSize;
      }
      if (newEnd > vodDuration) {
        newEnd = vodDuration;
        newStart = Math.max(0, vodDuration - newWindowSize);
      }

      setViewport({ viewStart: newStart, viewEnd: newEnd });
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    isPinching.current = false;
  };

  // Seek clicking on track space
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging.current || !containerRef.current) return;

    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.cursor-pointer') && target !== containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const offset = getLabelOffset();
    const x = e.clientX - rect.left - offset;
    const activeWidth = rect.width - offset;

    if (activeWidth > 0 && x >= 0) {
      const clickRatio = x / activeWidth;
      const targetTime = viewport.viewStart + clickRatio * (viewport.viewEnd - viewport.viewStart);
      twitchEventBus.emit(Math.floor(targetTime));
    }
  };

  const handleToggleAutoFollow = () => {
    autoScrollEnabledStore.set(!autoFollow);
  };

  const handleZoomToTimeframe = (start: number, end: number) => {
    setViewport({ viewStart: start, viewEnd: end });
  };

  return (
    <div className="w-full flex flex-col font-sans mb-6">
      {/* Toolbar dashboard controls */}
      <ScrubberToolbar
        tracks={tracks}
        onToggleTrack={handleToggleTrack}
        zoomLevel={zoomLevelDisplay}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        autoFollow={autoFollow}
        onToggleAutoFollow={handleToggleAutoFollow}
      />

      {/* Main interactive tracks scrubber */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleTimelineClick}
        className="relative w-full overflow-hidden bg-slate-950 border border-white/10 rounded-b-2xl shadow-2xl flex flex-col select-none cursor-grab active:cursor-grabbing"
      >
        {/* Dynamic Ruler at top with spacing for track labels */}
        <div className="flex w-full">
          <div className="hidden md:flex w-36 border-r border-white/10 bg-slate-950/90 z-15 items-center pl-3 h-8">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</span>
          </div>
          <div className="flex-1 relative">
            <TimeRuler viewport={viewport} vodDuration={vodDuration} />
          </div>
        </div>

        {/* Tracks List Wrapper */}
        <div className="relative w-full flex flex-col">
          {/* Vertical Playhead Cursor */}
          <div className="absolute top-0 bottom-0 left-0 md:left-36 right-0 pointer-events-none z-20 overflow-hidden">
            <div className="relative w-full h-full">
              <Playhead currentTime={currentTime} viewport={viewport} />
            </div>
          </div>

          {/* Individual Tracks */}
          {tracks.map((track) => (
            <ScrubberTrack
              key={track.id}
              config={track}
              events={events}
              viewport={viewport}
              activeEventId={activeEventId}
              onEventClick={onEventClick}
              onZoomToTimeframe={handleZoomToTimeframe}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventScrubber;
