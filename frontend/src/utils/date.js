const pad = (n) => String(n).padStart(2, '0');

/** Date -> 'YYYY-MM-DD' in local time. */
export const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const todayKey = () => toKey(new Date());

export function addDays(key, days) {
  const date = fromKey(key);
  date.setDate(date.getDate() + days);
  return toKey(date);
}

export const nowTime = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function formatTime(time) {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function formatSlot(start, end) {
  if (!start) return '';
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start);
}

export function dayLabel(key) {
  const today = todayKey();
  if (key === today) return 'Today';
  if (key === addDays(today, 1)) return 'Tomorrow';
  if (key === addDays(today, -1)) return 'Yesterday';
  const date = fromKey(key);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export const longDate = (key) =>
  fromKey(key).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

export const isOverdue = (task) => !task.completed && !!task.date && task.date < todayKey();

/** True while today's time slot is running. */
export function isHappeningNow(task) {
  if (task.completed || task.date !== todayKey() || !task.startTime) return false;
  const now = nowTime();
  const end = task.endTime || addMinutes(task.startTime, 30);
  return now >= task.startTime && now < end;
}

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

/** Dated tasks first (by date, then start time), undated last. */
export function compareTasks(a, b) {
  if (a.date !== b.date) {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date < b.date ? -1 : 1;
  }
  if (a.startTime !== b.startTime) {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime < b.startTime ? -1 : 1;
  }
  if (a.priority !== b.priority) return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  return a.createdAt < b.createdAt ? -1 : 1;
}

/** Friendly name for common meeting providers. */
export function meetingProvider(link) {
  try {
    const host = new URL(link).hostname;
    if (host.includes('meet.google')) return 'Google Meet';
    if (host.includes('zoom.')) return 'Zoom';
    if (host.includes('teams.microsoft') || host.includes('teams.live')) return 'Teams';
    if (host.includes('webex')) return 'Webex';
    return 'Meeting';
  } catch {
    return 'Meeting';
  }
}
