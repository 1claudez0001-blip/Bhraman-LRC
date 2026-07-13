export const todayStr = () => new Date().toISOString().slice(0, 10);

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateLong(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatSlot(slot) {
  if (!slot) return '';
  const [date, time] = slot.split(' ');
  const [hh, mm] = (time || '').split(':');
  const h = parseInt(hh, 10);
  const hour12 = isNaN(h) ? '' : h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${formatDate(date)} · ${hour12}:${mm} ${ampm}`;
}