import express from 'express';
import cors from 'cors';
import { listTodos, createTodo, updateTodo, deleteTodo, clearCompleted } from './store.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function validateTitle(title) {
  if (typeof title !== 'string' || !title.trim()) return 'Title is required';
  if (title.trim().length > 200) return 'Title must be 200 characters or fewer';
  return null;
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/todos', async (req, res, next) => {
  try {
    res.json(await listTodos());
  } catch (err) {
    next(err);
  }
});

app.post('/api/todos', async (req, res, next) => {
  try {
    const error = validateTitle(req.body?.title);
    if (error) return res.status(400).json({ error });
    res.status(201).json(await createTodo(req.body.title.trim()));
  } catch (err) {
    next(err);
  }
});

app.patch('/api/todos/:id', async (req, res, next) => {
  try {
    const { title, completed } = req.body ?? {};
    const changes = {};
    if (title !== undefined) {
      const error = validateTitle(title);
      if (error) return res.status(400).json({ error });
      changes.title = title.trim();
    }
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') return res.status(400).json({ error: 'completed must be a boolean' });
      changes.completed = completed;
    }
    const todo = await updateTodo(req.params.id, changes);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/todos/:id', async (req, res, next) => {
  try {
    const deleted = await deleteTodo(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Todo not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.delete('/api/todos', async (req, res, next) => {
  try {
    if (req.query.completed !== 'true') return res.status(400).json({ error: 'Use ?completed=true' });
    res.json({ removed: await clearCompleted() });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
