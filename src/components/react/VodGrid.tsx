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

interface TwitchVideosResponse {
  data: TwitchVideo[];
  pagination?: {
    cursor?: string;
  };
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
    // Duration format: PT1H2M3S
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
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
    // Replace %{width} and %{height} with actual dimensions
    return url.replace('%{width}', '320').replace('%{height}', '180');
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/twitch/videos?username=${username}`);
      
    

      const videosData = await response.json();
      console.log('Fetched videos:', videosData);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-200 text-2xl">⚠️</span>
        </div>
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button 
          onClick={fetchVideos}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-gray-400 text-2xl">📺</span>
        </div>
        <p className="text-gray-400 text-lg">No VODs found for {username}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          📺 {username}'s VODs
        </h1>
        <p className="text-gray-400">
          {videos.length} recent stream{videos.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div 
            key={video.id}
            className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:bg-gray-800/60 hover:border-gray-600/50 transition-all duration-300 shadow-lg group"
          >
            <div className="relative">
              <img 
                src={getThumbnailUrl(video.thumbnailUrl)} 
                alt={video.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              
              {/* Duration overlay */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {formatDuration(video.duration)}
              </div>
              
              {/* View count overlay */}
              <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <span>👁️</span>
                <span>{video.viewCount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 leading-tight">
                {video.title}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <Tooltip >
                    <TooltipTrigger>

                        <span>{formatDate(video.createdAt)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-gray-200">{new Date(video.createdAt).toLocaleDateString()}</p>
                    </TooltipContent>
                     
                     
                                    </Tooltip>
                <span className="capitalize">{video.type}</span>
              </div>
              
              <div className="flex gap-2">
                <a 
                  href={`/vod/${video.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg transition-colors text-center"
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
