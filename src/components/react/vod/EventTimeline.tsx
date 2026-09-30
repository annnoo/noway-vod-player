import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowUpRight, Crosshair, Flame, ListFilter, Music2, Play, Search, Swords, Target, Trophy, X } from 'lucide-react';
import type { GameEvent, SongEvent, VodEvent } from '../../../lib/types';
import { VodEventType } from '../../../lib/types';
import { currentTimeStore, twitchEventBus } from '../../../lib/store';
import { VList } from 'virtua';
import ChampionMiniIcon from './ChampionMiniIcon';
import SelectedMatchCard from './SelectedMatchCard';

type Filter = 'all' | 'combat' | 'objectives' | 'music';

const formatTime = (value: number) => {
  const seconds = Math.max(0, Math.floor(value));
  return `${Math.floor(seconds / 3600).toString().padStart(2, '0')}:${Math.floor(seconds % 3600 / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
};

const eventLabel = (event: VodEvent) => {
  switch (event.type) {
    case VodEventType.GAME: return 'Matchstart';
    case VodEventType.GAME_END: return 'Matchende';
    case VodEventType.SONG: return 'Musik';
    case VodEventType.CHAMPION_KILL: return 'Kill';
    case VodEventType.CHAMPION_SPECIAL_KILL: return 'Highlight';
    case VodEventType.CHAMPION_DEATH: return 'Tod';
    case VodEventType.CHAMPION_ASSIST: return 'Assist';
    case VodEventType.ELITE_MONSTER_KILL: return 'Monster';
    case VodEventType.BUILDING_KILL: return 'Gebäude';
    default: return 'Ereignis';
  }
};

const eventIcon = (event: VodEvent) => {
  if (event.type === VodEventType.SONG) return Music2;
  if (event.type === VodEventType.GAME || event.type === VodEventType.GAME_END) return Trophy;
  if (event.type === VodEventType.ELITE_MONSTER_KILL || event.type === VodEventType.BUILDING_KILL) return Target;
  if (event.type === VodEventType.CHAMPION_DEATH) return Crosshair;
  if (event.type === VodEventType.CHAMPION_SPECIAL_KILL) return Flame;
  return Swords;
};

const EventTimeline: React.FC<{ events: VodEvent[]; vodDuration: number; vodId: string }> = ({ events, vodDuration, vodId }) => {
  const duration = Math.max(1, vodDuration);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<VodEvent | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const markerRailRef = useRef<HTMLDivElement>(null);
  const [markerRailWidth, setMarkerRailWidth] = useState(600);

  useEffect(() => currentTimeStore.subscribe(setCurrentTime), []);
  useEffect(() => {
    const rail = markerRailRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(entries => setMarkerRailWidth(entries[0].contentRect.width));
    observer.observe(rail);
    return () => observer.disconnect();
  }, [selectedGame]);

  const sorted = useMemo(() => [...events].sort((a, b) => a.offsetSeconds - b.offsetSeconds), [events]);
  const games = useMemo(() => sorted.filter((event): event is GameEvent => event.type === VodEventType.GAME), [sorted]);
  const selectedMatch = games.find(game => game.id === selectedGame);
  const activeMatch = games.find(game => currentTime >= game.offsetSeconds && currentTime < game.offsetSeconds + game.duration);
  const gameForEvent = (event: VodEvent): GameEvent | undefined => {
    if (event.type === VodEventType.SONG) return undefined;
    if (event.type === VodEventType.GAME) return event;
    return games.find(game => game.gameId === event.gameId) ?? games.find(game => event.offsetSeconds >= game.offsetSeconds && event.offsetSeconds <= game.offsetSeconds + game.duration);
  };
  const championForEvent = (event: VodEvent) => {
    if (event.type === VodEventType.SONG) return undefined;
    if ('championId' in event && event.championId > 0) return { id: event.championId, name: event.championName };
    const game = gameForEvent(event);
    return game && { id: game.championId, name: game.championName };
  };
  const wins = games.filter(game => game.won).length;

  // Fixed-size buckets describe activity without making hundreds of overlapping markers.
  const activity = useMemo(() => {
    const buckets = Array.from({ length: 100 }, () => 0);
    sorted.filter(event => event.type !== VodEventType.GAME && event.type !== VodEventType.SONG).forEach(event => {
      const index = Math.min(99, Math.max(0, Math.floor(event.offsetSeconds / duration * 100)));
      buckets[index] += 1;
    });
    return buckets;
  }, [sorted, duration]);
  const maxActivity = Math.max(1, ...activity);

  const matchEvents = useMemo(() => selectedMatch ? sorted.filter(event =>
    event.type !== VodEventType.GAME && event.type !== VodEventType.SONG &&
    event.offsetSeconds >= selectedMatch.offsetSeconds &&
    event.offsetSeconds <= selectedMatch.offsetSeconds + selectedMatch.duration
  ) : [], [sorted, selectedMatch]);
  const matchSongs = useMemo(() => selectedMatch ? sorted.filter((event): event is SongEvent =>
    event.type === VodEventType.SONG && event.offsetSeconds < selectedMatch.offsetSeconds + selectedMatch.duration &&
    event.offsetSeconds + (event.duration || 180) > selectedMatch.offsetSeconds
  ) : [], [sorted, selectedMatch]);
  const markerGroups = useMemo(() => {
    if (!selectedMatch) return [];
    const groupCount = Math.max(1, Math.floor(markerRailWidth / 44));
    const groups = new Map<number, VodEvent[]>();
    matchEvents.forEach(event => {
      const index = Math.min(groupCount - 1, Math.max(0, Math.floor((event.offsetSeconds - selectedMatch.offsetSeconds) / Math.max(1, selectedMatch.duration) * groupCount)));
      groups.set(index, [...(groups.get(index) || []), event]);
    });
    return [...groups.entries()].map(([index, items]) => ({ index, items, percent: (index + .5) / groupCount * 100 }));
  }, [matchEvents, selectedMatch, markerRailWidth]);

  const visibleEvents = useMemo(() => sorted.filter(event => {
    if (selectedMatch && (event.offsetSeconds < selectedMatch.offsetSeconds || event.offsetSeconds > selectedMatch.offsetSeconds + selectedMatch.duration)) return false;
    if (filter === 'combat' && ![VodEventType.CHAMPION_KILL, VodEventType.CHAMPION_SPECIAL_KILL, VodEventType.CHAMPION_DEATH, VodEventType.CHAMPION_ASSIST].includes(event.type)) return false;
    if (filter === 'objectives' && ![VodEventType.ELITE_MONSTER_KILL, VodEventType.BUILDING_KILL, VodEventType.GAME_END].includes(event.type)) return false;
    if (filter === 'music' && event.type !== VodEventType.SONG) return false;
    const text = [event.title, event.description, 'championName' in event ? event.championName : '', 'artist' in event ? event.artist : '', eventLabel(event)].join(' ').toLocaleLowerCase('de');
    return text.includes(query.trim().toLocaleLowerCase('de'));
  }), [sorted, selectedMatch, filter, query]);

  const seek = (time: number) => {
    const next = Math.max(0, Math.min(duration, Math.floor(time)));
    setCurrentTime(next);
    twitchEventBus.emit(next);
  };

  const chooseEvent = (event: VodEvent) => {
    setSelectedEvent(event);
    if (event.type === VodEventType.GAME) setSelectedGame(event.id);
    seek(event.offsetSeconds);
  };

  const selected = selectedEvent && Math.abs(selectedEvent.offsetSeconds - currentTime) < 3 ? selectedEvent : [...sorted].reverse().find(event => event.offsetSeconds <= currentTime) || null;
  const SelectedIcon = selected ? eventIcon(selected) : Activity;
  const selectedChampion = selected && championForEvent(selected);

  return (
    <section className="viewer-timeline" aria-label="Interaktive VOD-Timeline">
      <div className="section-heading">
        <div>
          <span className="eyebrow"><Activity size={14} /> DEIN STREAM, AUF EINEN BLICK</span>
          <h2>Die Timeline<span className="mint-dot">.</span></h2>
        </div>
        <div className="timeline-total"><span>GESAMTLAUFZEIT</span><strong>{formatTime(duration)}</strong></div>
      </div>

      <div className="timeline-panel">
        <div className="timeline-panel-top"><span><span className="pulse-dot" /> STREAM-ÜBERSICHT</span><span>{games.length} Matches <i /> {events.length} Ereignisse</span></div>
        <div className="scrub-content">
          <div className="scrub-times"><span>00:00:00</span><span>STREAM-VERLAUF</span><span>{formatTime(duration)}</span></div>
          <div className="activity-rail" aria-hidden="true">
            {activity.map((count, index) => <span key={index} style={{ height: `${Math.max(12, count / maxActivity * 100)}%`, opacity: count ? 0.5 + count / maxActivity * 0.5 : 0.16 }} />)}
          </div>
          <div className="seek-zone">
            <div className="seek-fill" style={{ width: `${Math.min(100, currentTime / duration * 100)}%` }} />
            <div className="seek-head" style={{ left: `${Math.min(100, currentTime / duration * 100)}%` }} aria-hidden="true" />
            <input type="range" min="0" max={duration} step="1" value={Math.min(duration, Math.max(0, currentTime))} onChange={event => seek(Number(event.target.value))} aria-label="Wiedergabeposition im Stream" aria-valuetext={formatTime(currentTime)} />
          </div>
          <div className="scrub-status"><span><span className="status-square" /> AKTUELLE POSITION <strong>{formatTime(currentTime)}</strong></span><span>Ziehe den Regler, um im Video zu springen</span></div>
        </div>
        <div className="chapter-heading"><span>MATCH-KAPITEL</span><span>Auswählen & vergrößern <ArrowUpRight size={13} /></span></div>
        <div className="chapters">
          {games.length === 0 && <p className="empty-chapters">Für diesen Stream sind keine Matches erfasst. Die Suchleiste und die Timeline bleiben verfügbar.</p>}
          {games.map((game, index) => {
            const isActive = (selectedGame ? selectedGame === game.id : activeMatch?.id === game.id);
            return <button type="button" key={game.id} className={`chapter ${isActive ? 'is-active' : ''}`} onClick={() => { setSelectedGame(game.id); chooseEvent(game); }} aria-pressed={selectedGame === game.id}>
              <span className="chapter-index">{String(index + 1).padStart(2, '0')}</span>
              <ChampionMiniIcon id={game.championId} name={game.championName} />
              <span className="chapter-name">{game.championName || 'Match'}<small>{formatTime(game.offsetSeconds)} · {formatTime(game.duration)}</small></span>
              <span className={`chapter-result ${game.won ? 'won' : 'lost'}`}>{game.won ? 'SIEG' : 'NIEDERLAGE'}</span>
            </button>;
          })}
        </div>
        {selectedMatch && <div className="match-focus" aria-label={`Vergrößerte Timeline für ${selectedMatch.championName}`}>
          <div className="match-focus-heading"><div><span className="eyebrow">MATCH IM FOKUS <span className="focus-separator">/</span> {formatTime(selectedMatch.offsetSeconds)} – {formatTime(selectedMatch.offsetSeconds + selectedMatch.duration)}</span><h3><ChampionMiniIcon id={selectedMatch.championId} name={selectedMatch.championName} />{selectedMatch.championName || 'Match'} <span>· {matchEvents.length} Ereignisse</span></h3></div><button type="button" onClick={() => setSelectedGame(null)} aria-label="Matchansicht schließen">Gesamten Stream anzeigen <X size={15} /></button></div>
          <div className="focus-ruler"><span>{formatTime(selectedMatch.offsetSeconds)}</span><span>EREIGNISSE <span className="focus-separator">/</span> MUSIK</span><span>{formatTime(selectedMatch.offsetSeconds + selectedMatch.duration)}</span></div>
          <div className="focus-markers" ref={markerRailRef}>
            <div className="focus-baseline" aria-hidden="true" />
            {markerGroups.map(group => { const first = group.items[0]; const hasDeath = group.items.some(event => event.type === VodEventType.CHAMPION_DEATH); const Icon = hasDeath ? Crosshair : eventIcon(first); return <button type="button" className={`focus-marker ${hasDeath ? 'is-death' : ''} ${selected?.id === first.id ? 'active' : ''}`} key={group.index} style={{ left: `${group.percent}%` }} onClick={() => chooseEvent(first)} title={group.items.map(event => `${formatTime(event.offsetSeconds)} ${event.title}`).join('\n')} aria-label={group.items.length === 1 ? `${eventLabel(first)}: ${first.title}, ${formatTime(first.offsetSeconds)}` : `${group.items.length} Ereignisse ab ${formatTime(first.offsetSeconds)}${hasDeath ? ', darunter Tode' : ''}. Zum ersten springen; alle Ereignisse stehen unten in der Liste.`}><Icon size={15} strokeWidth={2} />{group.items.length > 1 && <span className="marker-count">{group.items.length}</span>}</button>; })}
            {currentTime >= selectedMatch.offsetSeconds && currentTime <= selectedMatch.offsetSeconds + selectedMatch.duration && <div className="focus-playhead" style={{ left: `${(currentTime - selectedMatch.offsetSeconds) / Math.max(1, selectedMatch.duration) * 100}%` }} aria-hidden="true" />}
          </div>
          <div className="focus-songs"><Music2 size={13} aria-hidden="true" /><div className="song-lane">{matchSongs.map(song => { const start = Math.max(song.offsetSeconds, selectedMatch.offsetSeconds); const end = Math.min(song.offsetSeconds + (song.duration || 180), selectedMatch.offsetSeconds + selectedMatch.duration); const left = (start - selectedMatch.offsetSeconds) / Math.max(1, selectedMatch.duration) * 100; const width = (end - start) / Math.max(1, selectedMatch.duration) * 100; return <button type="button" key={song.id} className="song-span" style={{ left: `${left}%`, width: `${width}%` }} title={`${song.title} – ${song.artist} · ${formatTime(song.offsetSeconds)}`} aria-label={`Song ${song.title} von ${song.artist}, ab ${formatTime(song.offsetSeconds)} abspielen`} onClick={() => chooseEvent(song)} />; })}</div></div>
          <div className="focus-seek"><span>IM MATCH SPRINGEN</span><input type="range" min={selectedMatch.offsetSeconds} max={selectedMatch.offsetSeconds + selectedMatch.duration} step="1" value={Math.max(selectedMatch.offsetSeconds, Math.min(selectedMatch.offsetSeconds + selectedMatch.duration, currentTime))} onChange={event => seek(Number(event.target.value))} aria-label={`Wiedergabeposition im Match ${selectedMatch.championName}`} aria-valuetext={formatTime(currentTime)} /><time>{formatTime(currentTime)}</time></div>
        </div>}
      </div>

      {selectedMatch && <div className="focus-match-area"><div className="focus-area-heading"><Crosshair size={15} /> IM FOKUS <span>/</span> MATCH {games.indexOf(selectedMatch) + 1}</div><SelectedMatchCard key={selectedMatch.id} game={selectedMatch} vodId={vodId} /></div>}
      <div className="details-grid">
        <section className="detail-card" aria-label="Aktueller Moment">
          <div className="panel-kicker"><span><Crosshair size={15} /> {selectedMatch ? 'AKTUELLER MOMENT' : 'IM FOKUS'}</span><span className="live-time">{formatTime(selected?.offsetSeconds ?? currentTime)}</span></div>
          <div className={`detail-main ${selected?.type === VodEventType.CHAMPION_DEATH ? 'is-death' : ''}`}><div className="detail-icon">{selectedChampion ? <ChampionMiniIcon id={selectedChampion.id} name={selectedChampion.name} /> : <SelectedIcon size={26} strokeWidth={1.7} />}</div><span className="eyebrow">{selected ? eventLabel(selected).toUpperCase() : 'STREAM'}</span><h3>{selected?.title || 'Wähle einen Moment aus'}</h3><p>{selected?.description || 'Nutze die Timeline oder die Ereignisliste, um direkt zu einer Stelle im Stream zu springen.'}</p></div>
          {selected && <button type="button" className="detail-action" onClick={() => seek(selected.offsetSeconds)}><Play size={15} fill="currentColor" /> Ab {formatTime(selected.offsetSeconds)} ansehen <ArrowUpRight size={16} /></button>}
          <div className="session-strip"><span><Trophy size={15} /> {games.length} Matches</span><span><Flame size={15} /> {wins} Siege</span><span><Activity size={15} /> {events.length} Events</span></div>
        </section>

        <section className="event-panel" aria-label="Ereignisse im Stream">
          <div className="panel-kicker"><span><ListFilter size={15} /> EREIGNISSE</span><span className="result-count">{visibleEvents.length} Treffer</span></div>
          <div className="events-toolbar">
            <label className="event-search"><Search size={17} /><span className="sr-only">Ereignisse durchsuchen</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Champion, Song oder Ereignis suchen ..." /></label>
            {selectedGame && <button type="button" className="clear-match" onClick={() => setSelectedGame(null)}>Matchfilter entfernen <X size={13} /></button>}
            <div className="event-filters" aria-label="Ereignisse filtern">{([['all', 'Alle'], ['combat', 'Kämpfe'], ['objectives', 'Ziele'], ['music', 'Musik']] as const).map(([id, label]) => <button key={id} type="button" aria-pressed={filter === id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div>
          </div>
          <div className="event-list">
            {visibleEvents.length === 0 ? <div className="events-empty">Keine Ereignisse gefunden. Passe deine Suche oder Filter an.</div> : <VList style={{ height: 352 }}>
              {visibleEvents.map(event => { const Icon = eventIcon(event); const champion = championForEvent(event); return <button type="button" key={event.id} className={`event-row ${event.type === VodEventType.CHAMPION_DEATH ? 'is-death' : ''} ${selected?.id === event.id ? 'active' : ''}`} onClick={() => chooseEvent(event)}><span className="event-row-icon">{champion ? <ChampionMiniIcon id={champion.id} name={champion.name} /> : <Icon size={17} />}</span><span className="event-row-text"><strong>{event.title}</strong><small>{eventLabel(event)}{event.type === VodEventType.SONG ? ` · ${(event as SongEvent).artist}` : ''}</small></span><time>{formatTime(event.offsetSeconds)}</time><ArrowUpRight size={15} className="row-arrow" /></button>; })}
            </VList>}
          </div>
        </section>
      </div>
    </section>
  );
};

export default EventTimeline;
