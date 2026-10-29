import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daysBetween, nearestDate, events, games, dateKey, parseDate } from './calendar.ts';
test('daily range includes leap days and year boundaries', () => {
  assert.deepEqual(daysBetween('2024-02-28', '2024-03-01'), [
    '2024-02-28',
    '2024-02-29',
    '2024-03-01',
  ]);
  assert.deepEqual(daysBetween('2025-12-31', '2026-01-01'), ['2025-12-31', '2026-01-01']);
  assert.equal(dateKey(parseDate('2026-10-28')), '2026-10-28');
});
test('jump handles dates outside recorded range', () => {
  const dates = ['2020-09-28', '2026-11-04'];
  assert.equal(nearestDate(dates, '2019-01-01'), dates[0]);
  assert.equal(nearestDate(dates, '2026-10-28'), dates[1]);
  assert.equal(nearestDate(dates, '2030-01-01'), dates[1]);
  assert.equal(nearestDate([], '2026-10-28'), undefined);
});
test('configured records have valid dates, games and image paths', () => {
  for (const event of events) {
    assert.equal(dateKey(parseDate(event.date)), event.date);
    assert.ok(games.includes(event.game));
    if (event.image) assert.match(event.image, /^images\/[\w/. -]+\.avif$/);
  }
});
