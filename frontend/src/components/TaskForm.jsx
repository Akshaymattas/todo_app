import { useState } from 'react';
import Modal from './Modal.jsx';
import Icon from './Icon.jsx';
import { addMinutes, todayKey, addDays } from '../utils/date.js';

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const DURATIONS = [
  { minutes: 15, label: '15m' },
  { minutes: 30, label: '30m' },
  { minutes: 60, label: '1h' },
  { minutes: 120, label: '2h' },
];

function initialState(task) {
  return {
    title: task?.title ?? '',
    notes: task?.notes ?? '',
    date: task?.date ?? '',
    startTime: task?.startTime ?? '',
    endTime: task?.endTime ?? '',
    meetingLink: task?.meetingLink ?? '',
    priority: task?.priority ?? 'medium',
  };
}

function validate(form) {
  if (!form.title.trim()) return 'Give your task a title';
  if ((form.startTime || form.endTime) && !form.date) return 'Pick a date for the time slot';
  if (form.endTime && !form.startTime) return 'Add a start time before the end time';
  if (form.startTime && form.endTime && form.endTime <= form.startTime) return 'End time must be after start time';
  if (form.meetingLink.trim()) {
    try {
      const url = new URL(form.meetingLink.trim());
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      return 'Meeting link must start with https://';
    }
  }
  return null;
}

/** Create/edit dialog. `task` has an id when editing; otherwise it holds prefilled defaults. */
export default function TaskForm({ task, onSave, onClose }) {
  const editing = Boolean(task?.id);
  const [form, setForm] = useState(() => initialState(task));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate(form);
    if (problem) return setError(problem);
    setSaving(true);
    setError('');
    try {
      await onSave({
        title: form.title.trim(),
        notes: form.notes.trim(),
        date: form.date || null,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        meetingLink: form.meetingLink.trim() || null,
        priority: form.priority,
      });
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const setDuration = (minutes) => {
    if (form.startTime) setForm((f) => ({ ...f, endTime: addMinutes(f.startTime, minutes) }));
  };

  const quickDates = [
    { label: 'Today', value: todayKey() },
    { label: 'Tomorrow', value: addDays(todayKey(), 1) },
    { label: 'Next week', value: addDays(todayKey(), 7) },
  ];

  return (
    <Modal title={editing ? 'Edit task' : 'New task'} onClose={onClose}>
      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <input
          className="title-input"
          value={form.title}
          onChange={set('title')}
          placeholder="Task name, e.g. Team standup"
          maxLength={200}
          aria-label="Title"
          autoFocus
        />

        <textarea
          value={form.notes}
          onChange={set('notes')}
          placeholder="Add notes or an agenda (optional)"
          rows={3}
          maxLength={2000}
          aria-label="Notes"
        />

        <fieldset className="field">
          <legend>
            <Icon name="calendar" size={16} /> Date
          </legend>
          <div className="row">
            <input type="date" value={form.date} onChange={set('date')} aria-label="Date" />
            <div className="chips">
              {quickDates.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  className={`chip-btn${form.date === q.value ? ' active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, date: q.value }))}
                >
                  {q.label}
                </button>
              ))}
              {form.date && (
                <button
                  type="button"
                  className="chip-btn ghost"
                  onClick={() => setForm((f) => ({ ...f, date: '', startTime: '', endTime: '' }))}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>
            <Icon name="clock" size={16} /> Time slot
          </legend>
          <div className="row">
            <div className="time-range">
              <input type="time" value={form.startTime} onChange={set('startTime')} aria-label="Start time" />
              <span className="muted">to</span>
              <input type="time" value={form.endTime} onChange={set('endTime')} aria-label="End time" />
            </div>
            <div className="chips">
              {DURATIONS.map((d) => (
                <button
                  key={d.minutes}
                  type="button"
                  className="chip-btn"
                  disabled={!form.startTime}
                  onClick={() => setDuration(d.minutes)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>
            <Icon name="video" size={16} /> Meeting link
          </legend>
          <input
            type="url"
            value={form.meetingLink}
            onChange={set('meetingLink')}
            placeholder="https://meet.google.com/… or Zoom / Teams link"
            aria-label="Meeting link"
          />
        </fieldset>

        <fieldset className="field">
          <legend>
            <Icon name="flag" size={16} /> Priority
          </legend>
          <div className="segmented" role="radiogroup" aria-label="Priority">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={form.priority === p.value}
                className={`seg seg-${p.value}${form.priority === p.value ? ' active' : ''}`}
                onClick={() => setForm((f) => ({ ...f, priority: p.value }))}
              >
                <span className="dot" /> {p.label}
              </button>
            ))}
          </div>
        </fieldset>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <footer className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create task'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
