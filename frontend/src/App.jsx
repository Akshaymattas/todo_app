import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api.js';
import Sidebar, { NAV } from './components/Sidebar.jsx';
import TaskList from './components/TaskList.jsx';
import TaskForm from './components/TaskForm.jsx';
import CalendarView from './components/CalendarView.jsx';
import Icon from './components/Icon.jsx';
import { addDays, compareTasks, isOverdue, longDate, todayKey } from './utils/date.js';

const VIEWS = {
  today: {
    filter: (t, today) => t.date === today || isOverdue(t),
    subtitle: (today) => longDate(today),
    empty: ['All clear for today', 'Add a task or enjoy the free time.'],
    defaultDate: (today) => today,
  },
  upcoming: {
    filter: (t, today) => !t.completed && t.date && t.date > today,
    subtitle: () => 'Everything scheduled after today',
    empty: ['Nothing coming up', 'Plan ahead by giving tasks a future date.'],
    defaultDate: (today) => addDays(today, 1),
  },
  all: {
    filter: () => true,
    subtitle: () => 'Every task, grouped by date',
    empty: ['No tasks yet', 'Create your first task to get started.'],
    defaultDate: () => null,
  },
  completed: {
    filter: (t) => t.completed,
    subtitle: () => 'Nice work. Here is what you have finished.',
    empty: ['Nothing completed yet', 'Tick off a task and it will show up here.'],
    defaultDate: () => null,
  },
  calendar: {
    filter: () => true,
    subtitle: () => 'Plan your month. Double-click a day to add a task.',
    defaultDate: (today) => today,
  },
};

function readStored(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: preference just won't persist */
  }
}

const systemTheme = () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(() => (VIEWS[readStored('view')] ? readStored('view') : 'today'));
  const [search, setSearch] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [formTask, setFormTask] = useState(null);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() => readStored('theme', systemTheme()));
  const toastTimer = useRef();
  const today = todayKey();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    store('theme', theme);
  }, [theme]);

  useEffect(() => store('view', view), [view]);

  const showToast = useCallback((message, { action, tone = 'info' } = {}) => {
    clearTimeout(toastTimer.current);
    setToast({ message, action, tone });
    toastTimer.current = setTimeout(() => setToast(null), action ? 6000 : 4000);
  }, []);

  const loadTodos = useCallback(() => {
    setLoading(true);
    api
      .list()
      .then(setTodos)
      .catch((err) => showToast(err.message, { tone: 'error' }))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(loadTodos, [loadTodos]);

  const run = async (fn) => {
    try {
      await fn();
    } catch (err) {
      showToast(err.message, { tone: 'error' });
    }
  };

  const createTask = async (fields) => {
    const task = await api.create(fields);
    setTodos((prev) => [task, ...prev]);
    return task;
  };

  const saveTask = async (fields) => {
    if (formTask?.id) {
      const updated = await api.update(formTask.id, fields);
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      await createTask(fields);
    }
  };

  const toggleTask = (task) =>
    run(async () => {
      const updated = await api.update(task.id, { completed: !task.completed });
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    });

  const deleteTask = (task) =>
    run(async () => {
      await api.remove(task.id);
      setTodos((prev) => prev.filter((t) => t.id !== task.id));
      const { id, createdAt, updatedAt, ...fields } = task;
      showToast(`Deleted "${task.title}"`, {
        action: { label: 'Undo', onClick: () => run(() => createTask(fields)) },
      });
    });

  const clearCompleted = () =>
    run(async () => {
      const { removed } = await api.clearCompleted();
      setTodos((prev) => prev.filter((t) => !t.completed));
      showToast(`Cleared ${removed} completed task${removed === 1 ? '' : 's'}`);
    });

  const quickAdd = (e) => {
    e.preventDefault();
    const title = quickTitle.trim();
    if (!title) return;
    run(async () => {
      await createTask({ title, date: VIEWS[view].defaultDate(today) });
      setQuickTitle('');
    });
  };

  const openNew = (defaults = {}) => setFormTask({ date: VIEWS[view].defaultDate(today), ...defaults });

  const counts = useMemo(
    () => ({
      today: todos.filter((t) => !t.completed && (t.date === today || isOverdue(t))).length,
      upcoming: todos.filter((t) => VIEWS.upcoming.filter(t, today)).length,
      all: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    }),
    [todos, today]
  );

  const progress = useMemo(() => {
    const todays = todos.filter((t) => t.date === today);
    return { total: todays.length, done: todays.filter((t) => t.completed).length };
  }, [todos, today]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return todos
      .filter((t) => VIEWS[view].filter(t, today))
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q))
      .sort(compareTasks);
  }, [todos, view, search, today]);

  const config = VIEWS[view];
  const title = NAV.find((n) => n.id === view).label;
  const handlers = { onToggle: toggleTask, onEdit: setFormTask, onDelete: deleteTask };

  return (
    <div className="layout">
      <Sidebar
        view={view}
        onView={setView}
        counts={counts}
        progress={progress}
        onNewTask={() => openNew()}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      <main className="main">
        <header className="page-header">
          <div>
            <h1>{title}</h1>
            <p className="muted">{config.subtitle(today)}</p>
          </div>
          {view !== 'calendar' && (
            <label className="search">
              <Icon name="search" size={16} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks"
                aria-label="Search tasks"
              />
            </label>
          )}
        </header>

        {view === 'calendar' ? (
          <CalendarView tasks={todos} onAddForDate={(date) => openNew({ date })} {...handlers} />
        ) : (
          <div className="card list-card">
            {view !== 'completed' && (
              <form className="quick-add" onSubmit={quickAdd}>
                <Icon name="plus" className="quick-add-icon" />
                <input
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder={`Add a task${view === 'today' ? ' for today' : view === 'upcoming' ? ' for tomorrow' : ''}, then press Enter`}
                  maxLength={200}
                  aria-label="Quick add task"
                />
                <button
                  type="button"
                  className="btn btn-ghost small"
                  onClick={() => {
                    openNew({ title: quickTitle.trim() });
                    setQuickTitle('');
                  }}
                >
                  Add details
                </button>
              </form>
            )}

            {view === 'completed' && counts.completed > 0 && (
              <div className="list-toolbar">
                <button className="btn btn-ghost small danger" onClick={clearCompleted}>
                  <Icon name="trash" size={16} /> Clear all completed
                </button>
              </div>
            )}

            {loading ? (
              <div className="skeleton-list" aria-label="Loading">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton" />
                ))}
              </div>
            ) : (
              <TaskList
                tasks={visible}
                emptyTitle={search ? 'No matches' : config.empty[0]}
                emptyText={search ? `Nothing matches "${search}".` : config.empty[1]}
                {...handlers}
              />
            )}
          </div>
        )}
      </main>

      <button className="fab" onClick={() => openNew()} aria-label="New task">
        <Icon name="plus" size={24} />
      </button>

      {formTask && <TaskForm task={formTask} onSave={saveTask} onClose={() => setFormTask(null)} />}

      {toast && (
        <div className={`toast toast-${toast.tone}`} role="status">
          <span>{toast.message}</span>
          {toast.action && (
            <button
              className="toast-action"
              onClick={() => {
                toast.action.onClick();
                setToast(null);
              }}
            >
              {toast.action.label}
            </button>
          )}
          <button className="icon-btn" onClick={() => setToast(null)} aria-label="Dismiss">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
