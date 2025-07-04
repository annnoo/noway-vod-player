import React from 'react';
import type { SongEvent } from '../../../lib/types';
import { twitchEventBus } from '../../../lib/store';
import Spotify from '../Spotify';

interface SongEventComponentProps {
  event: SongEvent;
}

const SongEventComponent: React.FC<SongEventComponentProps> = ({ event }) => {
  const spotifyUrlForEmbed = event.spotifyUrl?.split('https://open.spotify.com/')[1];
  
  const jumpToTimestamp = () => {
    twitchEventBus.emit(event.offsetSeconds);
  };

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🎵</span>
          </div>
          <h3 className="font-bold text-green-200">{event.title}</h3>
        </div>
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </div>
      
      <p className="text-sm text-green-100 mb-2 bg-green-900/20 p-2 rounded-lg">by {event.artist}</p>
      
      {event.album && (
        <p className="text-xs text-green-300 mb-3 opacity-75">Album: {event.album}</p>
      )}
      
      <div className="flex flex-col gap-3 mt-3">
        {event.spotifyUrl && (
          <>
            <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/20">
              <Spotify spotifyLink={spotifyUrlForEmbed} />
            </div>
            <a 
              href={event.spotifyUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <span>🎧</span>
              <span>Listen on Spotify</span>
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default SongEventComponent;
