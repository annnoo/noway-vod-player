export enum VodEventType {
  GAME = 'GAME',
  SONG = 'SONG',
  CHAT_HIGHLIGHT = 'CHAT_HIGHLIGHT',
  DONATION = 'DONATION',
  SUBSCRIPTION = 'SUBSCRIPTION',
  INGAME_EVENT = 'INGAME_EVENT',
  // Champion events
  CHAMPION_KILL = 'CHAMPION_KILL',
  CHAMPION_DEATH = 'CHAMPION_DEATH',
  CHAMPION_ASSIST = 'CHAMPION_ASSIST',
  CHAMPION_SPECIAL_KILL = 'CHAMPION_SPECIAL_KILL',
  // Global events
  DRAGON_SOUL_GIVEN = 'DRAGON_SOUL_GIVEN',
  ELITE_MONSTER_KILL = 'ELITE_MONSTER_KILL',
  BUILDING_KILL = 'BUILDING_KILL',
  GAME_END = 'GAME_END',
  // Add more event types as needed
}
export interface VodEventBase {
  id: string;
  type: VodEventType;
  timestamp: Date;
  offsetSeconds: number; // Offset from VOD start
  duration?: number; // Event duration in seconds
  title: string;
  description?: string;
}

export interface GameEvent extends VodEventBase {
  type: VodEventType.GAME;
  gameId: string;
  championName: string;
  championId: number;
  won: boolean;
  duration: number;
  kills?: number;
  deaths?: number;
  assists?: number;
}

export interface SongEvent extends VodEventBase {
  type: VodEventType.SONG;
  songId: string;
  artist: string;
  title: string;
  album?: string;
  duration?: number;
  spotifyUrl?: string;
  lastfmUrl?: string;
}

// Champion Events - Participant Relevant
export interface ChampionKillVodEvent extends VodEventBase {
  type: VodEventType.CHAMPION_KILL;
  gameId: string;
  // Your champion info
  championName: string;
  championId: number;
  // Victim champion info
  victimChampionName: string;
  victimChampionId: number;
  victimParticipantId: number;
  killStreakLength: number;
}

export interface ChampionDeathVodEvent extends VodEventBase {
  type: VodEventType.CHAMPION_DEATH;
  gameId: string;
  // Your champion info (the one who died)
  championName: string;
  championId: number;
  // Killer champion info
  killerChampionName: string;
  killerChampionId: number;
  killerParticipantId: number;
}

export interface ChampionAssistVodEvent extends VodEventBase {
  type: VodEventType.CHAMPION_ASSIST;
  gameId: string;
  // Your champion info (the one who assisted)
  championName: string;
  championId: number;
  // Killer champion info
  killerChampionName: string;
  killerChampionId: number;
  killerParticipantId: number;
  // Victim champion info
  victimChampionName: string;
  victimChampionId: number;
  victimParticipantId: number;
}

export interface ChampionSpecialKillVodEvent extends VodEventBase {
  type: VodEventType.CHAMPION_SPECIAL_KILL;
  gameId: string;
  // Your champion info (the one who got the special kill)
  championName: string;
  championId: number;
  killType: string; // KILL_MULTI, KILL_ACE, KILL_FIRST_BLOOD
  multiKillLength?: number;
  position: { x: number; y: number };
}

export interface EliteMonsterKillVodEvent extends VodEventBase {
  type: VodEventType.ELITE_MONSTER_KILL;
  gameId: string;
  monsterName: string; // Fire Dragon, Baron, etc.
  monsterType: string; // DRAGON, BARON, etc.
  killerTeamId: number;
  isStreamerTeam: boolean; // Flag indicating if the killer team is the streamer's team
  bounty: number;
  position: { x: number; y: number };
}

export interface BuildingKillVodEvent extends VodEventBase {
  type: VodEventType.BUILDING_KILL;
  gameId: string;
  buildingType: string; // TOWER_BUILDING, INHIBITOR_BUILDING
  towerType?: string; // OUTER_TURRET, INNER_TURRET, etc.
  laneType: string; // TOP_LANE, MID_LANE, BOT_LANE
  killerTeamId: number;
  isStreamerTeam: boolean; // Flag indicating if the killer team is the streamer's team
  isEnemyBuilding: boolean; // Flag indicating if the destroyed building belonged to the enemy team
  bounty: number;
  position: { x: number; y: number };
}

export interface GameEndVodEvent extends VodEventBase {
  type: VodEventType.GAME_END;
  gameId: string;
  winningTeamId: number;
  isStreamerTeamWinner: boolean; // Flag indicating if the streamer's team won
  result: string; // GameComplete
}

export type VodEvent =
  | GameEvent
  | SongEvent
  | ChampionKillVodEvent
  | ChampionDeathVodEvent
  | ChampionAssistVodEvent
  | ChampionSpecialKillVodEvent
  | EliteMonsterKillVodEvent
  | BuildingKillVodEvent
  | GameEndVodEvent;

export interface ExtendedVodResponse {
  vodId: string;
  vodDuration: number;
  events: VodEvent[];
  totalEvents: number;
}

// Generic interface for event loaders
export interface VodEventLoader<T extends VodEventBase> {
  getEventType(): VodEventType;
  loadEventsForTimeframe(startTime: Date, endTime: Date, vodStartTime: Date): Promise<T[]>;
}
