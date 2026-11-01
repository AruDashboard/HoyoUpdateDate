import { scrollToInitialDate } from './initial-scroll';
import { games, events, daysBetween, dateKey, parseDate, nearestDate } from '../lib/calendar';
const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const tbody = $<HTMLTableSectionElement>('#calendar-body');
const availableImages = new Set<string>(JSON.parse($('#available-images').textContent || '[]'));
const today = dateKey(new Date());
const indexed = new Map<string, typeof events>();
for (const event of events) indexed.set(event.date, [...(indexed.get(event.date) ?? []), event]);
const defaultGame = document.documentElement.dataset.defaultGame;
const forced = defaultGame && games.includes(defaultGame) ? defaultGame : null;
const DEFAULT_GAMES = ['原神', '崩坏：星穹铁道', '绝区零'].filter((g) => games.includes(g));
const STORAGE_KEY = 'games';
function loadSelection(): Set<string> {
  if (forced) return new Set([forced]);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed.filter((g) => games.includes(g)));
    }
  } catch {}
  return new Set(DEFAULT_GAMES);
}
function saveSelection() {
  if (forced) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...selected]));
  } catch {}
}
let selected = loadSelection();
let updatesOnly = false;
let visible: string[] = [];
const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
const dialog = $<HTMLDialogElement>('#image-dialog');
function render() {
  const fragment = document.createDocumentFragment();
  const selectedEvents = events.filter((e) => selected.has(e.game));
  const start = [selectedEvents[0]?.date ?? today, today].sort()[0]!;
  const end = [selectedEvents.at(-1)?.date ?? today, today].sort().at(-1)!;
  const days = daysBetween(start, end);
  visible = days.filter(
    (day) => !updatesOnly || indexed.get(day)?.some((e) => selected.has(e.game)),
  );
  for (const day of visible) {
    const date = parseDate(day);
    const row = document.createElement('tr');
    row.dataset.date = day;
    row.classList.toggle('weekend', [0, 6].includes(date.getDay()));
    row.classList.toggle('today', day === today);
    row.classList.toggle('month-start', date.getDate() === 1);
    const first = row.insertCell();
    const number = document.createElement('div');
    number.className = 'date-number';
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const monthDay = date.getDate().toString().padStart(2, '0');
    number.textContent = `${date.getFullYear()}年${month}月${monthDay}日 · ${weekdays[date.getDay()]}`;
    if (day === today) {
      const tag = document.createElement('span');
      tag.className = 'today-tag';
      tag.textContent = '今天';
      number.append(tag);
    }
    first.append(number);
    for (const game of games) {
      const cell = row.insertCell();
      cell.dataset.column = game;
      cell.hidden = !selected.has(game);
      const items = (indexed.get(day) ?? []).filter((e) => e.game === game);
      if (!items.length) {
        const dash = document.createElement('span');
        dash.className = 'empty-cell';
        dash.textContent = '—';
        cell.append(dash);
      }
      for (const event of items) {
        const card = document.createElement('article');
        card.className = 'event-card';
        if (event.image && availableImages.has(event.image)) {
          const button = document.createElement('button');
          button.type = 'button';
          const image = document.createElement('img');
          image.src = `${import.meta.env.BASE_URL}${event.image}`;
          image.alt = event.text;
          image.loading = 'lazy';
          image.width = 640;
          image.height = 340;
          image.addEventListener('error', () => button.remove(), { once: true });
          button.append(image);
          card.append(button);
          button.addEventListener('click', () => {
            const full = $<HTMLImageElement>('#full-image');
            full.src = image.src;
            full.alt = image.alt;
            $('#image-title').textContent = `${event.game} · ${event.text}`;
            dialog.showModal();
          });
        }
        const copy = document.createElement('div');
        copy.className = 'event-copy';
        const [version, ...title] = event.text.split(' - ');
        const badge = document.createElement('div');
        badge.className = 'version';
        badge.textContent = `${version}`;
        const text = document.createElement('p');
        text.textContent = title.join(' - ') || event.text;
        copy.append(badge, text);
        card.append(copy);
        cell.append(card);
      }
    }
    fragment.append(row);
  }
  tbody.replaceChildren(fragment);
  document
    .querySelectorAll<HTMLElement>('thead [data-column]')
    .forEach((th) => (th.hidden = !selected.has(th.dataset.column!)));
  $('#range').textContent = `${visible[0] ?? '—'} — ${visible.at(-1) ?? '—'}`;
}
function jump(target: string, smooth = true) {
  const key = nearestDate(visible, target);
  const row = key ? tbody.querySelector<HTMLElement>(`tr[data-date="${key}"]`) : null;
  if (!row) return;
  const top = row.getBoundingClientRect().top + window.scrollY - $('thead').offsetHeight - 20;
  if (smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo({ top, behavior: 'smooth' });
  } else {
    window.scrollTo(window.scrollX, top);
  }
  $<HTMLSelectElement>('#year').value = key!.slice(0, 4);
}
function anchor() {
  const rows = [...tbody.rows];
  return (
    rows.find(
      (row) =>
        row.getBoundingClientRect().bottom >
        Math.max(0, $('#calendar').getBoundingClientRect().top) + $('thead').offsetHeight,
    )?.dataset.date ?? today
  );
}
const checkboxes = document.querySelectorAll<HTMLInputElement>('.game-check');
checkboxes.forEach((box) => {
  box.checked = selected.has(box.dataset.game!);
  box.addEventListener('change', () => {
    const target = anchor();
    if (box.checked) selected.add(box.dataset.game!);
    else selected.delete(box.dataset.game!);
    saveSelection();
    render();
    jump(target, false);
  });
});
$<HTMLInputElement>('#updates-only').addEventListener('change', (e) => {
  const target = anchor();
  updatesOnly = (e.target as HTMLInputElement).checked;
  render();
  jump(target, false);
});
$('#today').addEventListener('click', () => {
  jump(today);
});
$<HTMLSelectElement>('#year').addEventListener('change', (e) =>
  jump(`${(e.target as HTMLSelectElement).value}-01-01`),
);
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});

const toolbar = $('#toolbar');
function syncToolbarHeight() {
  document.documentElement.style.setProperty('--toolbar-h', `${toolbar.offsetHeight}px`);
}
syncToolbarHeight();
window.addEventListener('resize', syncToolbarHeight, { passive: true });
if ('ResizeObserver' in window) new ResizeObserver(syncToolbarHeight).observe(toolbar);

render();
scrollToInitialDate(() => jump(today, false), $('#calendar'));
