import type { APIRoute } from 'astro';
import type { ExtendedVodResponse, GameEvent } from '../../../../../lib/types';
import { pickMatch, toMatchDetails, type MatchEntry } from '../../../../../lib/vodMatch';

const BACKEND = (import.meta.env.BACKEND_API_URL || 'http://website-backend.noway.gg').replace(/\/$/, '');

export const GET: APIRoute = async ({ params }) => {
  const { vodId, gameId } = params;
  if (!vodId || !/^\d{5,25}$/.test(vodId) || !gameId || !/^[\w-]{3,70}$/.test(gameId)) {
    return new Response(JSON.stringify({ error: 'Ungültige Match-ID' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const vodResponse = await fetch(`${BACKEND}/vod/${encodeURIComponent(vodId)}/events`, { signal: AbortSignal.timeout(10000) });
    if (!vodResponse.ok) throw new Error(`VOD ${vodResponse.status}`);
    const vod = await vodResponse.json() as ExtendedVodResponse;
    const game = vod.events.find((event): event is GameEvent => event.type === 'GAME' && event.gameId === gameId);
    if (!game) return new Response(JSON.stringify({ error: 'Match nicht gefunden' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

    const start = new Date(game.timestamp);
    if (Number.isNaN(start.getTime())) throw new Error('Ungültiger Match-Zeitpunkt');
    const url = new URL(`${BACKEND}/matches/search`);
    url.searchParams.set('dateFrom', new Date(start.getTime() - 10 * 60_000).toISOString());
    url.searchParams.set('dateTo', new Date(start.getTime() + (Math.max(0, game.duration) + 15 * 60) * 1000).toISOString());
    url.searchParams.set('limit', '100');
    url.searchParams.set('includeLpGains', 'true');

    const candidates: MatchEntry[] = [];
    for (let page = 0; page < 3; page++) {
      url.searchParams.set('offset', String(page * 100));
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`Matchsuche ${response.status}`);
      const pageEntries = await response.json();
      if (!Array.isArray(pageEntries)) throw new Error('Ungültige Matchantwort');
      candidates.push(...pageEntries);
      if (pageEntries.length < 100) break;
    }

    const match = pickMatch(candidates, gameId, vodId);
    if (!match) return new Response(JSON.stringify({ error: 'Keine erweiterten Matchdaten verfügbar' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify(toMatchDetails(match)), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=120' } });
  } catch (error) {
    console.error('Match enrichment failed:', error);
    return new Response(JSON.stringify({ error: 'Matchdaten derzeit nicht verfügbar' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
};
