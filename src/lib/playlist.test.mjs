import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchStreamPlaylist } from './playlist.ts';

const response = (body, status = 200) => new Response(body, { status });

test('an empty successful playlist response means this VOD has no playlist', async () => {
  const playlist = await fetchStreamPlaylist('123', async () => response(''));
  assert.equal(playlist, null);
});

test('a playlist response still provides its Spotify URL', async () => {
  const url = 'https://open.spotify.com/playlist/abc';
  const playlist = await fetchStreamPlaylist('123', async () => response(JSON.stringify({ spotifyUrl: url })));
  assert.equal(playlist?.spotifyUrl, url);
});

test('an upstream failure is not treated as a missing playlist', async () => {
  await assert.rejects(fetchStreamPlaylist('123', async () => response('Unavailable', 503)), /503/);
});
