import React, { useState, useEffect } from 'react';
import { Tooltip } from '../ui/tooltip';
import { TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import '../../styles/global.css';

interface TwitchVideo {
  thumbnailUrl: string;
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  createdAt: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  viewCount: number;
  language: string;
  type: string;
  duration: string;
}

interface VodGridProps {
  username: string;
  limit?: number;
}

const VodGrid: React.FC<VodGridProps> = ({ 
  username, 
  limit = 20
}) => {
  const [videos, setVideos] = useState<TwitchVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
    
    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const getThumbnailUrl = (url: string): string => {
    return url.replace('%{width}', '320').replace('%{height}', '180');
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/twitch/videos?username=${username}`);
      const videosData = await response.json();
      setVideos(videosData.videos);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  function getUrl(id: string): string {
    const host = window.location.host;
    const protocol = window.location.protocol;
    return `${protocol}//${host}/vod/${id}`;
  }

  useEffect(() => {
    fetchVideos();
  }, [username, limit]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand shadow-[0_0_10px_var(--color-brand-glow)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-650 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <span className="text-red-200 text-2xl">⚠️</span>
        </div>
        <p className="text-red-400 text-lg mb-4 font-bold">{error}</p>
        <button 
          onClick={fetchVideos}
          className="bg-brand text-slate-950 font-black uppercase tracking-widest px-6 py-2.5 rounded-xl hover:brightness-110 transition-all cursor-pointer italic skew-x-[-12deg] shadow-[0_0_10px_var(--color-brand-glow)]"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-gray-400 text-2xl">📺</span>
        </div>
        <p className="text-gray-400 text-lg font-bold">No VODs found for {username}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2 italic skew-x-[-12deg]">
          📺 <span className="text-brand drop-shadow-[0_0_12px_var(--color-brand-glow)]">{username}&apos;s VODs</span>
        </h1>
        <p className="text-white/40 font-bold uppercase tracking-wider text-xs italic ml-1">
          {videos.length} recent stream{videos.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div 
            key={video.id}
            className="bg-[#0c0c0c] border border-white/10 rounded-[28px] overflow-hidden hover:border-brand/40 shadow-xl transition-all duration-300 transform-gpu hover:scale-[1.02] group flex flex-col justify-between"
          >
            <div className="relative overflow-hidden aspect-video bg-black">
              <a href={getUrl(video.id)}>
                <img 
                  src={getThumbnailUrl(video.thumbnailUrl)} 
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                  loading="lazy"
                />
              </a>
              {/* Duration overlay */}
              <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm border border-white/10 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                {formatDuration(video.duration)}
              </div>
              
              {/* View count overlay */}
              <div className="absolute top-2.5 left-2.5 bg-[#0a0a0a]/80 backdrop-blur-sm border border-white/10 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>👁️</span>
                <span>{video.viewCount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="p-5 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="font-bold text-white text-sm mb-2.5 line-clamp-2 leading-tight group-hover:text-brand transition-colors">
                  {video.title}
                </h3>
                
                <div className="flex items-center justify-between text-[11px] text-white/40 font-extrabold uppercase italic tracking-wider mb-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="hover:text-white cursor-help">{formatDate(video.createdAt)}</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border border-white/10 p-2 rounded-lg shadow-xl text-xs text-white">
                      <p>{new Date(video.createdAt).toLocaleDateString()}</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{video.type}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <a 
                  href={`/vod/${video.id}`}
                  className="flex-1 bg-brand text-slate-950 font-black uppercase tracking-wider text-xs px-4 py-2.5 rounded-xl transition-all duration-300 hover:brightness-110 text-center shadow-md shadow-brand-glow italic skew-x-[-12deg]"
                >
                  View Timeline
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VodGrid;
