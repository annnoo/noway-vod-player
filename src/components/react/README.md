# React VOD Event Components

This directory contains React components converted from Svelte equivalents for use in the VOD player application.

## Components Overview

### Event Components (`/vod/`)

All event components follow a similar pattern with TypeScript interfaces for props and consistent styling using Tailwind CSS.

#### `GameEvent.tsx`
- **Props**: `{ event: GameEvent }`
- **Description**: Displays game session information including champion, win/loss status, duration, and KDA
- **Features**: 
  - Conditional victory/defeat styling
  - Duration formatting
  - Optional KDA display

#### `SongEvent.tsx`
- **Props**: `{ event: SongEvent }`
- **Description**: Displays song information with optional Spotify integration
- **Features**:
  - Spotify embed integration
  - External Spotify link
  - Album information display
  - Uses `Spotify` component for embedded player

#### `ChampionKillEvent.tsx`
- **Props**: `{ event: ChampionKillVodEvent }`
- **Description**: Shows champion kill information with killer and victim details
- **Features**:
  - Champion images from CDN
  - Kill streak display
  - Killer/victim relationship visualization

#### `ChampionDeathEvent.tsx`
- **Props**: `{ event: ChampionDeathVodEvent }`
- **Description**: Displays champion death information
- **Features**:
  - Champion images using `getChampionImageUrl` utility
  - Death relationship visualization

#### `ChampionAssistEvent.tsx`
- **Props**: `{ event: ChampionAssistVodEvent }`
- **Description**: Shows champion assist information
- **Features**:
  - Three-way relationship display (assister, killer, victim)
  - Descriptive text layout

#### `ChampionSpecialKillEvent.tsx`
- **Props**: `{ event: ChampionSpecialKillVodEvent }`
- **Description**: Displays special kill achievements (multi-kills, ace, first blood)
- **Features**:
  - Kill type formatting function
  - Special achievement badges
  - Jump to highlight button

#### `EliteMonsterKillEvent.tsx`
- **Props**: `{ event: EliteMonsterKillVodEvent }`
- **Description**: Shows elite monster kill information (dragons, baron, etc.)
- **Features**:
  - Team affiliation display
  - Bounty information
  - Monster type identification

#### `BuildingKillEvent.tsx`
- **Props**: `{ event: BuildingKillVodEvent }`
- **Description**: Displays building destruction information
- **Features**:
  - Building type and lane information
  - Team affiliation
  - Bounty rewards
  - Jump to timestamp functionality

#### `GameEndEvent.tsx`
- **Props**: `{ event: GameEndVodEvent }`
- **Description**: Shows game completion information
- **Features**:
  - Victory/defeat status
  - Game result display

#### `EventTimeline.tsx`
- **Props**: `{ events: VodEvent[] }`
- **Description**: Main timeline component that renders all events chronologically
- **Features**:
  - Auto-scrolling functionality
  - Event filtering and sorting
  - Timestamp navigation
  - Responsive event type rendering
  - Store integration for current time tracking

#### `TwitchChannelEmbed.tsx`
- **Props**: `{ channel?, width?, height?, autoplay?, muted?, id?, video? }`
- **Description**: Embeds Twitch player with VOD controls
- **Features**:
  - Twitch Player API integration
  - Current time tracking
  - Seek functionality via event bus
  - Auto-cleanup on unmount

#### `TimestampText.tsx`
- **Props**: `{ offsetSeconds: number }`
- **Description**: Utility component for consistent timestamp formatting
- **Features**:
  - Hours:minutes:seconds format
  - Automatic hour display when needed

### Utility Components

#### `GeneralObserver.tsx`
- **Props**: `{ threshold?, disableObserver?, children }`
- **Description**: Intersection Observer wrapper for lazy loading
- **Features**:
  - Configurable intersection threshold
  - Fade-in animation
  - Optional observer disabling

#### `Spotify.tsx`
- **Props**: `{ spotifyLink?, width?, height?, disableObserver?, iframeStyles? }`
- **Description**: Spotify embed component with lazy loading
- **Features**:
  - Intersection Observer integration
  - Customizable styling
  - Responsive iframe

## Usage Examples

### Basic Event Component Usage

```tsx
import { GameEvent } from '../components/react/vod';

function MyComponent() {
  const gameEvent = {
    id: '1',
    type: VodEventType.GAME,
    championName: 'Jinx',
    won: true,
    // ... other event properties
  };

  return <GameEvent event={gameEvent} />;
}
```

### Event Timeline Usage

```tsx
import { EventTimeline } from '../components/react/vod';

function VODPlayer({ events }) {
  return (
    <div className="vod-player">
      <EventTimeline events={events} />
    </div>
  );
}
```

### Twitch Embed Usage

```tsx
import { TwitchChannelEmbed } from '../components/react/vod';

function Player() {
  return (
    <TwitchChannelEmbed
      video="your-video-id"
      width="100%"
      height="500px"
      autoplay={false}
      muted={true}
    />
  );
}
```

## Dependencies

- **React**: ^18.3.1
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **Svelte Stores**: For state management (shared with existing codebase)

## Store Integration

The React components integrate with the existing Svelte stores:

- `twitchEventBus`: For timestamp seeking
- `currentTimeStore`: For current playback time
- `autoScrollStore`: For manual event scrolling  
- `autoScrollEnabledStore`: For auto-scroll toggle

## Type Safety

All components use TypeScript interfaces from `../../../lib/types.ts`:

- `VodEvent` (union type)
- `GameEvent`
- `SongEvent`  
- `ChampionKillVodEvent`
- `ChampionDeathVodEvent`
- `ChampionAssistVodEvent`
- `ChampionSpecialKillVodEvent`
- `EliteMonsterKillVodEvent`
- `BuildingKillVodEvent`
- `GameEndVodEvent`

## Styling

All components use Tailwind CSS classes for consistent styling:

- Gradient backgrounds with transparency
- Backdrop blur effects
- Hover animations and transitions
- Color-coded event types
- Responsive layouts

## Migration Notes

Key differences from Svelte versions:

1. **Props**: Svelte `$props()` → React `props` interface
2. **State**: Svelte `$state()` → React `useState()`
3. **Effects**: Svelte `$effect()` → React `useEffect()`
4. **Refs**: Svelte `bind:this` → React `useRef()`
5. **Conditionals**: Svelte `{#if}` → React `{condition && <Component />}`
6. **Loops**: Svelte `{#each}` → React `array.map()`
7. **Event Handlers**: Svelte `onclick` → React `onClick`
8. **Class Binding**: Svelte `class:` → React template literals with conditionals

All functionality has been preserved while adapting to React patterns and conventions.
