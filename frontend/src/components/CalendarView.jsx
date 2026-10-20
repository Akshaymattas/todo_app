import { useMemo, useState } from 'react';
import Icon from './Icon.jsx';
import TaskItem from './TaskItem.jsx';
import { compareTasks, formatTime, longDate, toKey, todayKey } from '../utils/date.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_CHIPS = 3;

function monthCells(year, month) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((first.getDay() + daysInMonth) / 7);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { key: toKey(date), day: date.getDate(), inMonth: date.getMonth() === month };
  });
}

export default function CalendarView({ tasks, onAddForDate, ...handlers }) {
  const today = todayKey();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState(today);

  const byDate = useMemo(() => {
    const map = new Map();
    for (const task of [...tasks].sort(compareTasks)) {
      if (!task.date) continue;
      if (!map.has(task.date)) map.set(task.date, []);
      map.get(task.date).push(task);
    }
    return map;
  }, [tasks]);

  const cells = monthCells(cursor.year, cursor.month);
  const monthName = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const shiftMonth = (delta) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const goToday = () => {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setSelected(today);
  };

  const selectedTasks = byDate.get(selected) ?? [];

  return (
    <div className="calendar-layout">
      <section className="calendar card">
        <header className="calendar-header">
          <h2>{monthName}</h2>
          <div className="calendar-nav">
            <button className="btn btn-ghost small" onClick={goToday}>
              Today
            </button>
            <button className="icon-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              <Icon name="left" />
            </button>
            <button className="icon-btn" onClick={() => shiftMonth(1)} aria-label="Next month">
              <Icon name="right" />
            </button>
          </div>
        </header>

        <div className="calendar-grid" role="grid">
          {WEEKDAYS.map((d) => (
            <div key={d} className="weekday" role="columnheader">
              {d}
            </div>
          ))}
          {cells.map((cell) => {
            const dayTasks = byDate.get(cell.key) ?? [];
            const classes = [
              'day',
              !cell.inMonth && 'outside',
              cell.key === today && 'today',
              cell.key === selected && 'selected',
              cell.key < today && 'past',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button
                key={cell.key}
                className={classes}
                onClick={() => setSelected(cell.key)}
                onDoubleClick={() => onAddForDate(cell.key)}
                aria-label={`${longDate(cell.key)}, ${dayTasks.length} tasks`}
                aria-pressed={cell.key === selected}
              >
                <span className="day-num">{cell.day}</span>
                <span className="day-chips">
                  {dayTasks.slice(0, MAX_CHIPS).map((t) => (
                    <span key={t.id} className={`day-chip p-${t.priority}${t.completed ? ' done' : ''}`}>
                      {t.startTime && <b>{formatTime(t.startTime).replace(':00', '')}</b>} {t.title}
                    </span>
                  ))}
                  {dayTasks.length > MAX_CHIPS && (
                    <span className="day-more">+{dayTasks.length - MAX_CHIPS} more</span>
                  )}
                </span>
                {dayTasks.length > 0 && (
                  <span className="day-dots" aria-hidden="true">
                    {dayTasks.slice(0, 4).map((t) => (
                      <i key={t.id} className={`p-${t.priority}${t.completed ? ' done' : ''}`} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="day-panel card">
        <header className="day-panel-header">
          <div>
            <h2>{longDate(selected)}</h2>
            <p className="muted small">
              {selectedTasks.length === 0
                ? 'Nothing planned'
                : `${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button className="btn btn-primary small" onClick={() => onAddForDate(selected)}>
            <Icon name="plus" size={16} /> Add
          </button>
        </header>
        {selectedTasks.length === 0 ? (
          <p className="day-empty">Free day. Double-click any date on the calendar to plan something.</p>
        ) : (
          <ul className="task-list">
            {selectedTasks.map((t) => (
              <TaskItem key={t.id} task={t} showDate={false} {...handlers} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
