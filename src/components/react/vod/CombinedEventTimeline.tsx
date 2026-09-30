import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Crosshair, Flame, Music2, Swords, Target, Trophy } from 'lucide-react';
import type { GameEvent, SongEvent, VodEvent } from '../../../lib/types';
import { VodEventType } from '../../../lib/types';
import { clipSongSpan, getEventGroups } from '../../../lib/vodOverview';

interface Props {
  events: VodEvent[];
  vodDuration: number;
  selectedGameId: string | null;
  onSelectGame: (gameId: string | null) => void;
  onSeek: (seconds: number) => void;
  currentTime: number;
}

const stamp = (seconds: number) => {
  const time = Math.max(0, Math.floor(seconds));
  return `${Math.floor(time / 3600).toString().padStart(2, '0')}:${Math.floor(time % 3600 / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`;
};

const markerIcon = (event: VodEvent) => {
  if (event.type === VodEventType.CHAMPION_DEATH) return Crosshair;
  if (event.type === VodEventType.CHAMPION_SPECIAL_KILL) return Flame;
  if (event.type === VodEventType.ELITE_MONSTER_KILL || event.type === VodEventType.BUILDING_KILL) return Target;
  if (event.type === VodEventType.GAME_END) return Trophy;
  return Swords;
};

export default function CombinedEventTimeline({ events, vodDuration, selectedGameId, onSelectGame, onSeek, currentTime }: Props) {
  const games = useMemo(() => events.filter((event): event is GameEvent => event.type === VodEventType.GAME).sort((a, b) => a.offsetSeconds - b.offsetSeconds), [events]);
  const selected = games.find(game => game.id === selectedGameId);
  const [width, setWidth] = useState(900);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const laneRef = useRef<HTMLDivElement>(null);
  const viewStart = selected?.offsetSeconds ?? 0;
  const viewEnd = selected ? Math.min(vodDuration, selected.offsetSeconds + selected.duration) : Math.max(vodDuration, 1);
  const viewDuration = Math.max(1, viewEnd - viewStart);

  useEffect(() => {
    const lane = laneRef.current;
    if (!lane) return;
    const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    observer.observe(lane);
    return () => observer.disconnect();
  }, []);
  useEffect(() => setOpenGroup(null), [selectedGameId]);

  const markerEvents = events.filter(event => event.type !== VodEventType.GAME && event.type !== VodEventType.SONG && event.type !== VodEventType.CHAMPION_ASSIST);
  const groups = getEventGroups(markerEvents, viewStart, viewEnd, width);
  const expandedGroup = groups.find(group => group.events[0].id === openGroup);
  const songSpans = events.filter((event): event is SongEvent => event.type === VodEventType.SONG).map(song => ({ song, span: clipSongSpan(song.offsetSeconds, song.duration || 180, viewStart, viewEnd) })).filter((item): item is { song: SongEvent; span: { left: number; width: number } } => item.span !== null);
  const inView = currentTime >= viewStart && currentTime <= viewEnd;

  return <section className="alt-timeline" aria-label="Alternative Stream-Timeline">
    <div className="alt-heading"><div><span className="eyebrow">ALTERNATIVE ANSICHT / 02</span><h2>Stream in einer Linie<span className="mint-dot">.</span></h2></div><span className="alt-count">{games.length} MATCHES · {markerEvents.length} MARKER</span></div>
    <div className="alt-surface">
      <div className="alt-topline"><span>{selected ? `MATCH ${games.indexOf(selected) + 1} / ${games.length} · ${selected.championName}` : 'GESAMTER STREAM'}</span>{selected && <button type="button" onClick={() => onSelectGame(null)}><ArrowLeft size={15} /> Gesamtansicht</button>}</div>
      <div className="alt-time"><time>{stamp(viewStart)}</time><span>{selected ? 'MATCH-DETAIL' : 'STREAM-ÜBERSICHT'}</span><time>{stamp(viewEnd)}</time></div>
      {!selected && <div className="alt-games" aria-label="Matches auswählen">
        {games.map((game, index) => {
          const left = Math.max(0, game.offsetSeconds / Math.max(1, vodDuration) * 100);
          const right = Math.min(100, (game.offsetSeconds + game.duration) / Math.max(1, vodDuration) * 100);
          return <button type="button" key={game.id} className={`alt-game ${game.won ? 'win' : 'loss'}`} style={{ left: `${left}%`, width: `${Math.max(0, right - left)}%` }} onClick={() => onSelectGame(game.id)} aria-label={`Match ${index + 1}: ${game.championName}, ${game.won ? 'Sieg' : 'Niederlage'}, auswählen`} title={`${game.championName} · ${stamp(game.offsetSeconds)} – ${stamp(game.offsetSeconds + game.duration)}`}><span className="alt-champ"><span>{(game.championName || '?').slice(0, 1)}</span>{game.championId > 0 && <img src={`https://cdn.nowaycdn.com/images/champions/square/64x/${game.championId}.png`} alt="" loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} />}</span><span className="alt-game-label">{game.championName}</span></button>;
        })}
      </div>}
      {selected && <div className="alt-match-caption"><span className="alt-champ"><span>{selected.championName.slice(0, 1)}</span><img src={`https://cdn.nowaycdn.com/images/champions/square/64x/${selected.championId}.png`} alt="" onError={event => { event.currentTarget.style.display = 'none'; }} /></span><strong>{selected.championName}</strong><span className={selected.won ? 'alt-win' : 'alt-loss'}>{selected.won ? 'SIEG' : 'NIEDERLAGE'}</span><span>· {stamp(selected.duration)}</span></div>}
      <div className="alt-flag-label"><span>EREIGNISSE</span><span>{selected ? `${groups.reduce((sum, group) => sum + group.events.length, 0)} IM MATCH` : 'KLICKEN ZUM SPRINGEN'}</span></div>
      <div className="alt-flags" ref={laneRef}>
        <div className="alt-flag-axis" aria-hidden="true" />
        {groups.map(group => {
          const first = group.events[0];
          const Icon = markerIcon(first);
          return <button key={first.id} type="button" className={`alt-flag ${openGroup === first.id ? 'active' : ''}`} style={{ left: `${group.percent}%` }} onClick={() => group.events.length > 1 ? setOpenGroup(openGroup === first.id ? null : first.id) : (setOpenGroup(null), onSeek(first.offsetSeconds))} aria-label={group.events.length > 1 ? `${group.events.length} Ereignisse ab ${stamp(first.offsetSeconds)} öffnen` : `${first.title}, ab ${stamp(first.offsetSeconds)} ansehen`} aria-expanded={group.events.length > 1 ? openGroup === first.id : undefined} title={group.events.length === 1 ? `${stamp(first.offsetSeconds)} · ${first.title}` : `${group.events.length} Ereignisse`}><span className="alt-flag-top"><Icon size={14} strokeWidth={2} />{group.events.length > 1 && <small>{group.events.length}</small>}</span><span className="alt-flag-stem" /></button>;
        })}
        {inView && <div className="alt-cursor" style={{ left: `${(currentTime - viewStart) / viewDuration * 100}%` }} aria-hidden="true" />}
      </div>
      {expandedGroup && <div className="alt-cluster"><span>EREIGNISSE AN DIESER STELLE</span><div>{expandedGroup.events.map(event => <button type="button" key={event.id} onClick={() => { onSeek(event.offsetSeconds); setOpenGroup(null); }}>{event.title}<time>{stamp(event.offsetSeconds)}</time></button>)}</div></div>}
      <div className="alt-music"><span><Music2 size={14} /> MUSIK</span><div className="alt-music-lane">{songSpans.map(({ song, span }) => <button type="button" key={song.id} style={{ left: `${span.left}%`, width: `${span.width}%` }} title={`${song.title} · ${song.artist}`} aria-label={`${song.title} von ${song.artist} ab ${stamp(song.offsetSeconds)} ansehen`} onClick={() => onSeek(song.offsetSeconds)} />)}</div></div>
      <div className="alt-seek"><span>POSITION</span><input type="range" min={viewStart} max={viewEnd} step="1" value={Math.max(viewStart, Math.min(viewEnd, currentTime))} onChange={event => onSeek(Number(event.target.value))} aria-label="Position in der alternativen Timeline" aria-valuetext={inView ? stamp(currentTime) : `Aktuelle Position außerhalb des Matches: ${stamp(currentTime)}`} /><time>{inView ? stamp(currentTime) : `${stamp(currentTime)} · außerhalb`}</time></div>
    </div>
  </section>;
}
