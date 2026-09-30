import test from 'node:test';
import assert from 'node:assert/strict';
import { getEventGroups, clipSongSpan } from './vodOverview.ts';

const event = (id, offsetSeconds) => ({ id, offsetSeconds });

test('nearby events share a flag instead of overlapping on a narrow rail', () => {
  const groups = getEventGroups([event('a', 10), event('b', 11), event('c', 12)], 0, 120, 280);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].events.map(e => e.id), ['a', 'b', 'c']);
});

test('separated events remain individually selectable', () => {
  const groups = getEventGroups([event('late', 90), event('early', 10)], 0, 120, 600);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups.map(g => g.events[0].id), ['early', 'late']);
  assert.ok(groups[0].percent < groups[1].percent);
});

test('invalid view range and out-of-range events cannot create invalid flag positions', () => {
  assert.deepEqual(getEventGroups([event('a', 10)], 0, 0, 300), []);
  assert.deepEqual(getEventGroups([event('a', -1), event('b', 101)], 0, 100, 300), []);
});

test('a song extending across the focus edge is clipped to the visible interval', () => {
  assert.deepEqual(clipSongSpan(20, 50, 40, 100), { left: 0, width: 50 });
  assert.equal(clipSongSpan(120, 10, 40, 100), null);
  assert.equal(clipSongSpan(Number.NaN, 10, 40, 100), null);
});
