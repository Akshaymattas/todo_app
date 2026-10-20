const PRIORITIES = ['low', 'medium', 'high'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function isRealDate(value) {
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Optional string fields: empty string or null clears the value.
function optional(value) {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Validates a task payload. With `partial`, only fields present in `body` are checked.
 * Returns { fields } on success or { error } on failure.
 */
export function parseTask(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object') return { error: 'Invalid request body' };
  const has = (key) => body[key] !== undefined;
  const fields = {};

  if (!partial || has('title')) {
    if (typeof body.title !== 'string' || !body.title.trim()) return { error: 'Title is required' };
    if (body.title.trim().length > 200) return { error: 'Title must be 200 characters or fewer' };
    fields.title = body.title.trim();
  }

  if (has('notes')) {
    const notes = optional(body.notes);
    if (notes === undefined) return { error: 'Notes must be text' };
    if (notes && notes.length > 2000) return { error: 'Notes must be 2000 characters or fewer' };
    fields.notes = notes ?? '';
  }

  if (has('date')) {
    const date = optional(body.date);
    if (date === undefined || (date && (!DATE_RE.test(date) || !isRealDate(date)))) {
      return { error: 'Date must be a valid date in YYYY-MM-DD format' };
    }
    fields.date = date;
  }

  for (const key of ['startTime', 'endTime']) {
    if (!has(key)) continue;
    const time = optional(body[key]);
    if (time === undefined || (time && !TIME_RE.test(time))) return { error: `${key} must be in HH:MM format` };
    fields[key] = time;
  }

  if (has('meetingLink')) {
    const link = optional(body.meetingLink);
    if (link === undefined || (link && (!isHttpUrl(link) || link.length > 500))) {
      return { error: 'Meeting link must be a valid http(s) URL' };
    }
    fields.meetingLink = link;
  }

  if (has('priority')) {
    if (!PRIORITIES.includes(body.priority)) return { error: 'Priority must be low, medium or high' };
    fields.priority = body.priority;
  }

  if (has('completed')) {
    if (typeof body.completed !== 'boolean') return { error: 'completed must be a boolean' };
    fields.completed = body.completed;
  }

  return { fields };
}

/** Checks rules that span several fields, on the task as it would be saved. */
export function checkTimeSlot(task) {
  if ((task.startTime || task.endTime) && !task.date) return 'Pick a date for the time slot';
  if (task.endTime && !task.startTime) return 'Add a start time before the end time';
  if (task.startTime && task.endTime && task.endTime <= task.startTime) return 'End time must be after start time';
  return null;
}
