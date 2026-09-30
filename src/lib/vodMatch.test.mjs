import test from 'node:test';
import assert from 'node:assert/strict';
import { pickMatch, toMatchDetails } from './vodMatch.ts';

const entry = (id, vod, extras = {}) => ({ lolGameId: id, TwitchVodLink: vod ? { twitchVod: vod } : null, ...extras });

test('selects exact game ID and VOD link even if other accounts share the game', () => {
  const matches = [entry('EUW_123', 'other'), entry('EUW_123', 'vod-1'), entry('EUW_999', 'vod-1')];
  assert.equal(pickMatch(matches, 'EUW_123', 'vod-1'), matches[1]);
});

test('does not return data linked to a different VOD or an ambiguous unlinked match', () => {
  assert.equal(pickMatch([entry('EUW_123', 'other')], 'EUW_123', 'vod-1'), null);
  assert.equal(pickMatch([entry('EUW_123', null), entry('EUW_123', null)], 'EUW_123', 'vod-1'), null);
  assert.equal(pickMatch([entry('EUW_123', null)], 'EUW_123', 'vod-1')?.lolGameId, 'EUW_123');
});

test('projects matchup, team rosters and player stats without leaking upstream fields', () => {
  const player = { puuid: 'streamer', teamId: 100, teamPosition: 'MIDDLE', championId: 143, championName: 'Zyra', summonerName: 'Noway', kills: 7, deaths: 2, assists: 9, item0: 1058, item1: 0, totalDamageDealtToChampions: 20000, goldEarned: 14000, totalMinionsKilled: 130, neutralMinionsKilled: 12, visionScore: 25, champLevel: 15, summoner1Id: 4, summoner2Id: 12 };
  const opponent = { puuid: 'enemy', teamId: 200, teamPosition: 'MIDDLE', championId: 103, championName: 'Ahri', summonerName: 'Opponent', kills: 3, deaths: 4, assists: 5 };
  const result = toMatchDetails(entry('EUW_123', 'vod-1', { participant: player, lpGains: { lpChange: 18 }, LolGameFilteredView: [{ modified_game_data: { info: { participants: [player, opponent], queueId: 420 } } }], secret: 'never expose' }));
  assert.equal(result.opponent?.championName, 'Ahri');
  assert.deepEqual(result.player.items, [1058]);
  assert.equal(result.teams.length, 2);
  assert.equal(result.lpChange, 18);
  assert.equal(result.player.cs, 142);
  assert.equal(result.player.vision, 25);
  assert.deepEqual(result.player.spells, [4, 12]);
  assert.equal('secret' in result, false);
  assert.equal('puuid' in result.player, false);
  assert.equal(result.teams[0].players[0].isMainPlayer, true);
});

test('handles missing or malformed upstream fields without inventing values', () => {
  const result = toMatchDetails(entry('EUW_123', null, { participant: null, LolGameFilteredView: [] }));
  assert.equal(result.opponent, null);
  assert.equal(result.player, null);
  assert.deepEqual(result.teams, []);
  assert.equal(result.lpChange, null);
});
