import express from 'express';
import cors from 'cors';
import { listTodos, getTodo, createTodo, updateTodo, deleteTodo, clearCompleted } from './store.js';
import { parseTask, checkTimeSlot } from './validate.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
    const { fields, error } = parseTask(req.body);
    if (error) return res.status(400).json({ error });
    const slotError = checkTimeSlot(fields);
    if (slotError) return res.status(400).json({ error: slotError });
    res.status(201).json(await createTodo(fields));
  } catch (err) {
    next(err);
  }
});

app.patch('/api/todos/:id', async (req, res, next) => {
  try {
    const { fields, error } = parseTask(req.body, { partial: true });
    if (error) return res.status(400).json({ error });
    const existing = await getTodo(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Todo not found' });
    const slotError = checkTimeSlot({ ...existing, ...fields });
    if (slotError) return res.status(400).json({ error: slotError });
    res.json(await updateTodo(req.params.id, fields));
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
