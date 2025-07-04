import type { APIRoute } from 'astro';
import { ApiClient as TwitchApi } from "@twurple/api";
import { AppTokenAuthProvider, StaticAuthProvider } from "@twurple/auth";
export const GET: APIRoute = async ({ request, url }) => {
  const username = url.searchParams.get('username');
  const limit = url.searchParams.get('limit') || '20';
  
  if (!username) {
    return new Response(JSON.stringify({ error: 'Username is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const TWITCH_CLIENT_ID = import.meta.env.TWITCH_CLIENT_ID;
  const TWITCH_ACCESS_TOKEN = import.meta.env.TWITCH_ACCESS_TOKEN;
const authProvider = new AppTokenAuthProvider(TWITCH_CLIENT_ID, TWITCH_ACCESS_TOKEN);
                const api = new TwitchApi({ authProvider });
  if (!TWITCH_CLIENT_ID || !TWITCH_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: 'Twitch API credentials not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // First, get the user ID
    const userResponse = await api.users.getUserByName(username);


   const userId = userResponse?.id;

   const videos = await api.videos.getVideosByUser(userResponse?.id!, {
      type: 'archive'
    });

    const videosData = videos.data;
    const videoResponse = videosData.map(it => {
        return {
            id: it.id,
            title: it.title,
            description: it.description,
            createdAt: it.creationDate,
            thumbnailUrl: it.thumbnailUrl,
            url: it.url,
            duration: it.duration,
            viewCount: it.views,
            userId: it.userId,
            userName: it.userName
        };
    });
    
    return new Response(JSON.stringify({videos: videoResponse}), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error('Error fetching Twitch data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch videos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
