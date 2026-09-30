import React, { useEffect, useState } from 'react';
import { ChevronDown, Clock3, Crosshair, Swords, Trophy } from 'lucide-react';
import type { GameEvent } from '../../../lib/types';
import type { MatchDetails, MatchParticipant } from '../../../lib/vodMatch';

interface Props { game: GameEvent; vodId: string }

function ChampionPortrait({ id, name, size = '64x' }: { id: number; name: string; size?: '32x' | '64x' }) {
  return <span className="match-portrait"><span>{(name || '?').slice(0, 1)}</span>{id > 0 && <img src={`https://cdn.nowaycdn.com/images/champions/square/${size}/${id}.png`} alt="" loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} />}</span>;
}

const stat = (value: number | null | undefined) => typeof value === 'number' ? value.toLocaleString('de-DE') : '–';

function RosterPlayer({ player }: { player: MatchParticipant }) {
  return <div className={`match-roster-player ${player.isMainPlayer ? 'is-noway' : ''}`}>
    <ChampionPortrait id={player.championId} name={player.championName} size="32x" />
    <span className="match-roster-name"><strong>{player.summonerName || player.championName}</strong><small>{player.championName}</small></span>
    <span className="match-roster-kda">{stat(player.kills)}/{stat(player.deaths)}/{stat(player.assists)}</span>
    <span className="match-roster-damage" title="Schaden an Champions">{player.damage != null ? stat(player.damage) : '–'}</span>
    <span className="match-roster-build">{player.items.map((item, index) => <img key={`${item}-${index}`} src={`https://cdn.nowaycdn.com/images/items/square/32x/${item}.png`} alt={`Gegenstand ${item}`} loading="lazy" />)}</span>
  </div>;
}

export default function SelectedMatchCard({ game, vodId }: Props) {
  const [details, setDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setDetails(null);
    setLoading(true);
    setExpanded(false);
    fetch(`/api/vod/${encodeURIComponent(vodId)}/matches/${encodeURIComponent(game.gameId)}`, { signal: controller.signal })
      .then(response => response.ok ? response.json() as Promise<MatchDetails> : null)
      .then(data => { if (!controller.signal.aborted) setDetails(data); })
      .catch(() => { if (!controller.signal.aborted) setDetails(null); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [vodId, game.gameId]);

  const player = details?.player;
  const opponent = details?.opponent;
  const kills = player?.kills ?? game.kills;
  const deaths = player?.deaths ?? game.deaths;
  const assists = player?.assists ?? game.assists;
  const duration = Math.max(0, Math.floor(game.duration / 60));
  const team = details?.teams.find(item => item.teamId === player?.teamId);
  const teamKills = team?.players.reduce((total, member) => total + (member.kills ?? 0), 0) ?? 0;
  const participation = player?.kills != null && player.assists != null && teamKills > 0 ? Math.min(100, Math.round((player.kills + player.assists) / teamKills * 100)) : null;

  return <section className={`selected-match ${game.won ? 'is-win' : 'is-loss'}`} aria-label={`Matchkarte für ${game.championName}`}>
    <div className="selected-match-top"><span className="eyebrow">AUSGEWÄHLTES MATCH</span><span className={game.won ? 'alt-win' : 'alt-loss'}>{game.won ? 'SIEG' : 'NIEDERLAGE'}</span></div>
    <div className="selected-match-summary">
      <div className="selected-match-primary"><ChampionPortrait id={game.championId} name={game.championName} /><div><h3>{game.championName}</h3><span>Noway4u · {duration} Min.</span></div></div>
      <div className="selected-match-metrics"><div><span>K / T / A</span><strong>{stat(kills)} / {stat(deaths)} / {stat(assists)}</strong></div>{typeof details?.lpChange === 'number' && <div><span>LP</span><strong className="lp-value">{details.lpChange > 0 ? '+' : ''}{details.lpChange}</strong></div>}</div>
      <div className="selected-match-versus"><span>MATCHUP</span><div><ChampionPortrait id={game.championId} name={game.championName} size="32x" /><span className="versus-divider">VS</span>{opponent ? <><ChampionPortrait id={opponent.championId} name={opponent.championName} size="32x" /><strong>{opponent.championName}</strong></> : <span className="match-muted">{loading ? 'Wird geladen …' : 'Nicht erfasst'}</span>}</div></div>
    </div>
    <button type="button" className="match-expand" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}><span>{expanded ? 'Match-Details schließen' : 'Match-Details anzeigen'}</span><ChevronDown size={17} className={expanded ? 'rotated' : ''} /></button>
    {expanded && <div className="match-expanded">
      {loading ? <p className="match-empty">Matchdaten werden geladen …</p> : details && details.teams.length ? <>
        <div className="match-extra-stats"><span><Trophy size={15} /> {game.won ? 'Sieg' : 'Niederlage'}</span>{player?.damage != null && <span><Swords size={15} /> {stat(player.damage)} Schaden</span>}{player?.gold != null && <span><Crosshair size={15} /> {stat(player.gold)} Gold</span>}{player?.cs != null && <span>{stat(player.cs)} CS</span>}{player?.vision != null && <span>{stat(player.vision)} Vision</span>}{participation != null && <span>{participation}% Kill-Beteiligung</span>}{player?.level != null && <span>Stufe {player.level}</span>}{details.queueId != null && <span><Clock3 size={15} /> Queue {details.queueId}</span>}</div>
        {player && <div className="match-player-build"><span>BUILD & BESCHWÖRERZAUBER</span><div>{player.spells.map((spell, index) => <img key={`spell-${index}`} src={`https://cdn.nowaycdn.com/images/spells/32x/${spell}.png`} alt={`Beschwörerzauber ${spell}`} loading="lazy" />)}{player.items.map((item, index) => <img key={`item-${index}`} src={`https://cdn.nowaycdn.com/images/items/square/32x/${item}.png`} alt={`Gegenstand ${item}`} loading="lazy" />)}</div></div>}
        <div className="match-teams">{details.teams.map(team => <div key={team.teamId} className="match-team"><h4>{team.teamId === 100 ? 'BLAUES TEAM' : team.teamId === 200 ? 'ROTES TEAM' : `TEAM ${team.teamId}`}</h4>{team.players.map((member, index) => <RosterPlayer key={`${team.teamId}-${index}`} player={member} />)}</div>)}</div>
      </> : <p className="match-empty">Für dieses Match liegen keine erweiterten Spieler- und Build-Daten vor. Ergebnis und KDA stammen aus der VOD-Aufzeichnung.</p>}
    </div>}
  </section>;
}
