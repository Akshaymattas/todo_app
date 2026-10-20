const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  list: () => request('/todos'),
  create: (title) => request('/todos', { method: 'POST', body: JSON.stringify({ title }) }),
  update: (id, changes) => request(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
  remove: (id) => request(`/todos/${id}`, { method: 'DELETE' }),
  clearCompleted: () => request('/todos?completed=true', { method: 'DELETE' }),
};
