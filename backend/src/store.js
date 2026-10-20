import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'todos.json');

const DEFAULTS = {
  notes: '',
  date: null,
  startTime: null,
  endTime: null,
  meetingLink: null,
  priority: 'medium',
  completed: false,
};

let todos = null;

async function load() {
  if (todos) return todos;
  try {
    // Fill in fields added after a task was first saved.
    todos = JSON.parse(await fs.readFile(DATA_FILE, 'utf8')).map((t) => ({ ...DEFAULTS, ...t }));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    todos = [];
  }
  return todos;
}

async function save() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
}

export async function listTodos() {
  return load();
}

export async function getTodo(id) {
  await load();
  return todos.find((t) => t.id === id) ?? null;
}

export async function createTodo(fields) {
  await load();
  const now = new Date().toISOString();
  const todo = { id: randomUUID(), ...DEFAULTS, ...fields, createdAt: now, updatedAt: now };
  todos.unshift(todo);
  await save();
  return todo;
}

export async function updateTodo(id, changes) {
  await load();
  const todo = todos.find((t) => t.id === id);
  if (!todo) return null;
  Object.assign(todo, changes, { updatedAt: new Date().toISOString() });
  await save();
  return todo;
}

export async function deleteTodo(id) {
  await load();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return false;
  todos.splice(index, 1);
  await save();
  return true;
}

export async function clearCompleted() {
  await load();
  const before = todos.length;
  todos = todos.filter((t) => !t.completed);
  await save();
  return before - todos.length;
}
