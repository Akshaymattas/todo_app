import { useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import TodoForm from './components/TodoForm.jsx';
import TodoList from './components/TodoList.jsx';
import FilterBar from './components/FilterBar.jsx';

const FILTERS = {
  all: () => true,
  active: (t) => !t.completed,
  completed: (t) => t.completed,
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .list()
      .then(setTodos)
      .catch(() => setError('Could not reach the server. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const run = async (fn) => {
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    }
  };

  const addTodo = (title) =>
    run(async () => {
      const todo = await api.create(title);
      setTodos((prev) => [todo, ...prev]);
    });

  const updateTodo = (id, changes) =>
    run(async () => {
      const updated = await api.update(id, changes);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    });

  const deleteTodo = (id) =>
    run(async () => {
      await api.remove(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    });

  const clearCompleted = () =>
    run(async () => {
      await api.clearCompleted();
      setTodos((prev) => prev.filter((t) => !t.completed));
    });

  const visible = useMemo(() => todos.filter(FILTERS[filter]), [todos, filter]);
  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.length - activeCount;

  return (
    <main className="app">
      <header className="app-header">
        <h1>My Tasks</h1>
        <p className="subtitle">
          {todos.length === 0
            ? 'Nothing here yet. Add your first task.'
            : `${activeCount} remaining · ${completedCount} done`}
        </p>
      </header>

      <section className="card">
        <TodoForm onAdd={addTodo} />
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <FilterBar
          filter={filter}
          onChange={setFilter}
          completedCount={completedCount}
          onClearCompleted={clearCompleted}
        />
        {loading ? (
          <p className="empty">Loading…</p>
        ) : (
          <TodoList todos={visible} filter={filter} onUpdate={updateTodo} onDelete={deleteTodo} />
        )}
      </section>
    </main>
  );
}
