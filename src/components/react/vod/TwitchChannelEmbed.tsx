import React, { useEffect, useRef } from 'react';
import { twitchEventBus, currentTimeStore } from '../../../lib/store';

// Extend the window object to include Twitch
declare global {
  interface Window {
    Twitch: typeof Twitch;
  }
}

interface TwitchChannelEmbedProps {
  channel?: string;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  muted?: boolean;
  id?: string;
  video?: string;
}

const TwitchChannelEmbed: React.FC<TwitchChannelEmbedProps> = ({
  channel,
  width = '100%',
  height = '100%',
  autoplay,
  muted,
  id,
  video
}) => {
  const playerRef = useRef<any>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerId = id || 'default';

  useEffect(() => {
    // Initialize Twitch Player
    if (window.Twitch) {
      playerRef.current = new window.Twitch.Player(`twitch-embed-${playerId}`, {
        video,
        width,
        height,
        autoplay,
        muted,
        parent: []
      });

      // Start tracking current time every 4 seconds
      timeIntervalRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const currentTime = playerRef.current.getCurrentTime();
            console.log('Current player time:', currentTime);
            currentTimeStore.update(currentTime);
          } catch (error) {
            console.warn('Could not get current time from Twitch player:', error);
          }
        } else {
          console.warn('Player not ready or getCurrentTime not available');
        }
      }, 4000);
    }

    // Subscribe to event bus for seeking
    const unsubscribe = twitchEventBus.subscribe((event) => {
      if (event && playerRef.current) {
        playerRef.current.seek(event);
      }
    });

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
      unsubscribe();
    };
  }, [playerId, video, width, height, autoplay, muted]);

  return (
    <div 
      id={`twitch-embed-${playerId}`} 
      className="twitch-embed"
      style={{ aspectRatio: '16/9', position: 'relative' }}
    />
  );
};

export default TwitchChannelEmbed;
