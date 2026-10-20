import Icon from './Icon.jsx';

export const NAV = [
  { id: 'today', label: 'Today', icon: 'today' },
  { id: 'upcoming', label: 'Upcoming', icon: 'upcoming' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'all', label: 'All tasks', icon: 'inbox' },
  { id: 'completed', label: 'Completed', icon: 'done' },
];

export default function Sidebar({ view, onView, counts, progress, onNewTask, theme, onToggleTheme }) {
  const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <Icon name="done" size={20} />
        </span>
        <span className="brand-name">Taskflow</span>
        <button
          className="icon-btn theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title="Toggle theme"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </div>

      <button className="btn btn-primary new-task" onClick={onNewTask}>
        <Icon name="plus" /> <span>New task</span>
      </button>

      <nav className="nav" aria-label="Views">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-item${view === item.id ? ' active' : ''}`}
            onClick={() => onView(item.id)}
            aria-current={view === item.id ? 'page' : undefined}
          >
            <Icon name={item.icon} />
            <span className="nav-label">{item.label}</span>
            {counts[item.id] > 0 && <span className="nav-count">{counts[item.id]}</span>}
          </button>
        ))}
      </nav>

      <div className="progress-card">
        <div className="progress-head">
          <span>Today's progress</span>
          <strong>{percent}%</strong>
        </div>
        <div className="progress-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="muted small">
          {progress.total === 0
            ? 'Nothing scheduled today'
            : `${progress.done} of ${progress.total} tasks done`}
        </p>
      </div>
    </aside>
  );
}
