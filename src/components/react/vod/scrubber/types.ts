import type { VodEvent } from '../../../../lib/types';
import { VodEventType } from '../../../../lib/types';

export interface ViewportState {
  viewStart: number;
  viewEnd: number;
}

export interface TrackConfig {
  id: string;
  label: string;
  visible: boolean;
  alwaysVisible?: boolean;
  defaultVisible?: boolean;
  height: number;
  eventFilter: (event: VodEvent) => boolean;
  renderMode: 'span' | 'marker';
}

export const toPercent = (t: number, viewport: ViewportState): number => {
  const windowSize = viewport.viewEnd - viewport.viewStart;
  if (windowSize <= 0) return 0;
  return ((t - viewport.viewStart) / windowSize) * 100;
};

export const isVisible = (start: number, end: number, viewport: ViewportState): boolean => {
  return end > viewport.viewStart && start < viewport.viewEnd;
};

export const DEFAULT_TRACKS: TrackConfig[] = [
  {
    id: 'games',
    label: 'Games',
    visible: true,
    alwaysVisible: true,
    defaultVisible: true,
    height: 100,
    eventFilter: (e) => e.type === VodEventType.GAME,
    renderMode: 'span',
  },
  {
    id: 'songs',
    label: 'Songs',
    visible: false,
    defaultVisible: false,
    height: 80,
    eventFilter: (e) => e.type === VodEventType.SONG,
    renderMode: 'span',
  },
  {
    id: 'events',
    label: 'In-Game Events',
    visible: false,
    defaultVisible: false,
    height: 80, // Maintain enlarged height
    eventFilter: (e) => [
      VodEventType.CHAMPION_KILL,
      VodEventType.CHAMPION_DEATH,
      VodEventType.CHAMPION_ASSIST,
      VodEventType.CHAMPION_SPECIAL_KILL,
      VodEventType.ELITE_MONSTER_KILL,
      VodEventType.BUILDING_KILL,
      VodEventType.GAME_END,
    ].includes(e.type),
    renderMode: 'marker', // Reset to marker mode
  },
];
