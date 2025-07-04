# VOD Grid Component Documentation

## Overview

The VOD Grid component displays a responsive grid of Twitch VOD streams for a specified user. It fetches data from the Twitch API via a server-side proxy and displays each stream with thumbnail, title, duration, view count, and date information.

## Features

### 🎯 **Core Features**
- **Responsive Grid Layout**: Automatically adjusts columns based on screen size
- **Server-Side API Proxy**: Avoids CORS issues by routing through `/api/twitch/videos`
- **Rich Stream Information**: Shows thumbnail, title, duration, view count, and date
- **Modern UI**: Glass morphism effects, hover animations, and gradient styling
- **Error Handling**: Graceful error states with retry functionality
- **Loading States**: Smooth loading animations
- **Caching**: API responses cached for 5 minutes to reduce API calls

### 📱 **Responsive Design**
- **Mobile (sm)**: 1 column
- **Tablet (md)**: 2 columns  
- **Desktop (lg)**: 3 columns
- **Large Desktop (xl)**: 4 columns

### 🎨 **Visual Elements**
- **Thumbnails**: High-quality stream thumbnails with hover zoom effects
- **Duration Overlay**: Shows stream duration in bottom-right corner
- **View Count**: Eye icon with formatted view count in top-left
- **Date Formatting**: Intelligent relative date display (e.g., "2 days ago", "Yesterday")
- **Action Buttons**: 
  - "Watch on Twitch" - Opens stream on Twitch
  - "View Timeline" - Opens in your VOD player with event timeline

## Files Structure

```
src/
├── components/react/
│   └── VodGrid.tsx                    # Main grid component
├── pages/
│   ├── api/twitch/
│   │   └── videos.ts                  # API proxy endpoint
│   └── vod/
│       ├── index.astro                # VOD list page
│       └── [vodId]/
│           └── index.astro            # Individual VOD player page
└── .env.example                       # Environment variables template
```

## API Integration

### Server-Side Proxy (`/api/twitch/videos`)

The component uses a server-side API route to avoid CORS issues:

**Endpoint**: `GET /api/twitch/videos`

**Parameters**:
- `username` (required): Twitch username
- `limit` (optional): Number of videos to fetch (default: 20)

**Response**:
```json
{
  "data": [
    {
      "id": "video_id",
      "title": "Stream Title",
      "thumbnail_url": "https://...",
      "duration": "PT2H30M15S",
      "view_count": 1234,
      "created_at": "2024-01-01T12:00:00Z",
      "url": "https://twitch.tv/videos/...",
      // ... other Twitch video properties
    }
  ],
  "pagination": {
    "cursor": "..."
  }
}
```

### Twitch API Requirements

You need to set up Twitch API credentials:

1. **Create Twitch App**: Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. **Get Client ID**: Copy from your app settings
3. **Get Access Token**: Generate using OAuth flow or App Access Token

**Environment Variables** (`.env`):
```bash
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_ACCESS_TOKEN=your_access_token_here
```

## Usage

### Basic Usage
```astro
---
import VodGrid from '../components/react/VodGrid';
---

<VodGrid 
  username="noway4u" 
  limit={20}
  client:load
/>
```

### Advanced Usage with Error Handling
```astro
---
import Layout from '../layouts/Layout.astro';
import VodGrid from '../components/react/VodGrid';
---

<Layout title="Stream Archive">
  <main class="min-h-screen bg-gray-900">
    <VodGrid 
      username="noway4u" 
      limit={30}
      client:load
    />
  </main>
</Layout>
```

## Component Props

### `VodGridProps`
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `username` | `string` | - | ✅ | Twitch username to fetch VODs for |
| `limit` | `number` | `20` | ❌ | Maximum number of VODs to fetch |

## API Response Types

### `TwitchVideo`
```typescript
interface TwitchVideo {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: string;
  duration: string; // ISO 8601 duration format (PT2H30M15S)
}
```

### `TwitchVideosResponse`
```typescript
interface TwitchVideosResponse {
  data: TwitchVideo[];
  pagination?: {
    cursor?: string;
  };
}
```

## Helper Functions

### `formatDuration(duration: string)`
Converts ISO 8601 duration format to readable format:
- `PT2H30M15S` → `2h 30m`
- `PT45M30S` → `45m 30s`
- `PT30S` → `30s`

### `formatDate(dateString: string)`
Converts timestamps to relative dates:
- Same day: "Today"
- Previous day: "Yesterday"
- Within week: "3 days ago"
- Within month: "2 weeks ago"
- Older: "Jan 15, 2024"

### `getThumbnailUrl(url: string)`
Replaces Twitch thumbnail placeholders with actual dimensions:
- `%{width}` → `320`
- `%{height}` → `180`

## Error Handling

The component handles various error states:

1. **Network Errors**: Connection issues, API timeouts
2. **API Errors**: Invalid credentials, user not found
3. **Empty Results**: No VODs found for user
4. **Rate Limiting**: Too many requests to Twitch API

All errors display user-friendly messages with retry functionality.

## Performance Optimizations

### Caching Strategy
- **API Level**: Server responses cached for 5 minutes
- **Browser Level**: Thumbnail lazy loading
- **Network Level**: CDN-optimized thumbnail URLs

### Loading Strategy
- **Progressive Loading**: Show skeleton while fetching
- **Lazy Images**: Thumbnails load when visible
- **Debounced Requests**: Prevents spam clicking

## Styling

### Tailwind Classes Used
- **Layout**: `grid`, `grid-cols-*`, `gap-*`
- **Cards**: `bg-gray-800/40`, `backdrop-blur-sm`, `rounded-xl`
- **Hover Effects**: `hover:scale-105`, `hover:bg-gray-800/60`
- **Gradients**: `bg-gradient-to-br`, `from-*`, `to-*`
- **Animations**: `animate-spin`, `animate-pulse`

### Custom CSS
```css
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

## Integration with VOD Player

The grid seamlessly integrates with your existing VOD player:

1. **"View Timeline" Button**: Links to `/vod/[vodId]`
2. **Event Timeline**: Uses existing React components
3. **Twitch Embed**: Plays VOD with synchronized events

## Troubleshooting

### Common Issues

1. **"Missing Twitch API credentials"**
   - Solution: Set `TWITCH_CLIENT_ID` and `TWITCH_ACCESS_TOKEN` in `.env`

2. **"User not found"**
   - Solution: Verify username spelling and that user exists

3. **"Failed to fetch videos"**
   - Solution: Check API credentials and internet connection

4. **Empty grid**
   - Solution: User may have no archived VODs

### Debug Mode
Add console logs to API route for debugging:
```typescript
console.log('Fetching videos for:', username);
console.log('API Response:', videosData);
```

## Future Enhancements

Potential improvements:
- **Pagination**: Load more VODs on scroll
- **Filtering**: Filter by date, duration, or view count
- **Search**: Search within VOD titles
- **Categories**: Group by game or date
- **Favorites**: Save favorite VODs
- **Thumbnails**: Generate custom thumbnails with game info

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Features Used**: Fetch API, CSS Grid, Intersection Observer
- **Fallbacks**: Graceful degradation for older browsers
