export interface MatchParticipant {
  championId: number;
  championName: string;
  summonerName: string;
  teamId: number;
  position: string;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  damage: number | null;
  gold: number | null;
  cs: number | null;
  vision: number | null;
  level: number | null;
  spells: number[];
  items: number[];
  isMainPlayer: boolean;
}

export interface MatchDetails {
  gameId: string;
  queueId: number | null;
  lpChange: number | null;
  player: MatchParticipant | null;
  opponent: MatchParticipant | null;
  teams: { teamId: number; players: MatchParticipant[] }[];
}

export interface MatchEntry {
  lolGameId?: unknown;
  TwitchVodLink?: { twitchVod?: unknown } | null;
  participant?: unknown;
  LolGameFilteredView?: unknown;
  lpGains?: { lpChange?: unknown } | null;
}

export function pickMatch<T extends MatchEntry>(entries: T[], gameId: string, vodId: string): T | null {
  const candidates = entries.filter(entry => entry.lolGameId === gameId);
  const linked = candidates.find(entry => entry.TwitchVodLink?.twitchVod === vodId);
  if (linked) return linked;
  if (candidates.some(entry => entry.TwitchVodLink?.twitchVod)) return null;
  return candidates.length === 1 ? candidates[0] : null;
}

const record = (value: unknown): Record<string, unknown> | null => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
const number = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
const string = (value: unknown): string => typeof value === 'string' ? value : '';

function participant(value: unknown, isMainPlayer = false): MatchParticipant | null {
  const data = record(value);
  if (!data || !number(data.championId)) return null;
  return {
    championId: number(data.championId)!,
    championName: string(data.championName),
    summonerName: string(data.riotIdGameName) || string(data.summonerName),
    teamId: number(data.teamId) ?? 0,
    position: string(data.teamPosition) || string(data.individualPosition),
    kills: number(data.kills),
    deaths: number(data.deaths),
    assists: number(data.assists),
    damage: number(data.totalDamageDealtToChampions),
    gold: number(data.goldEarned),
    cs: number(data.totalMinionsKilled) !== null || number(data.neutralMinionsKilled) !== null ? (number(data.totalMinionsKilled) ?? 0) + (number(data.neutralMinionsKilled) ?? 0) : null,
    vision: number(data.visionScore),
    level: number(data.champLevel),
    spells: [number(data.summoner1Id), number(data.summoner2Id)].filter((id): id is number => id !== null && id > 0),
    items: Array.from({ length: 7 }, (_, index) => number(data[`item${index}`])).filter((id): id is number => id !== null && id > 0),
    isMainPlayer,
  };
}

export function toMatchDetails(entry: MatchEntry): MatchDetails {
  const views = Array.isArray(entry.LolGameFilteredView) ? entry.LolGameFilteredView : [];
  const view = record(views[0]);
  const info = record(record(view?.modified_game_data)?.info);
  const mainId = string(record(entry.participant)?.puuid);
  const roster = Array.isArray(info?.participants) ? info.participants.map(value => participant(value, !!mainId && string(record(value)?.puuid) === mainId)).filter((p): p is MatchParticipant => p !== null) : [];
  const player = participant(entry.participant, true);
  const opponents = player?.position ? roster.filter(p => p.teamId !== player.teamId && p.position === player.position) : [];
  const teamIds = [...new Set(roster.map(p => p.teamId))].filter(id => id > 0).sort();
  return {
    gameId: string(entry.lolGameId),
    queueId: number(info?.queueId),
    lpChange: number(entry.lpGains?.lpChange),
    player,
    opponent: opponents.length === 1 ? opponents[0] : null,
    teams: teamIds.map(teamId => ({ teamId, players: roster.filter(p => p.teamId === teamId) })),
  };
}
