import config, { type UpdateEvent } from '../data/updates.ts';
export type { UpdateEvent } from '../data/updates.ts';
export const games: string[] = config.games;
export const events: UpdateEvent[] = [...config.events].sort((a, b) =>
  a.date.localeCompare(b.date),
);
export const dateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseDate = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export function daysBetween(start: string, end: string): string[] {
  const result: string[] = [];
  for (const day = parseDate(start); dateKey(day) <= end; day.setDate(day.getDate() + 1))
    result.push(dateKey(day));
  return result;
}
export function nearestDate(dates: string[], target: string): string | undefined {
  return dates.find((d) => d >= target) ?? dates.at(-1);
}
export const years = [...new Set(events.map((e) => e.date.slice(0, 4)))];
