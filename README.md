# Todo App

A full-stack to-do list app: a React (Vite) frontend and an Express REST API.

Features: add, edit (double-click or the pencil icon), delete, mark complete, filter (All / Active / Completed), clear completed. Tasks are saved to `backend/data/todos.json`. The UI follows your system's light/dark mode.

## Getting started

Requires Node.js 18+.

```bash
# Terminal 1 – API on http://localhost:5000
cd backend
npm install
npm run dev

# Terminal 2 – UI on http://localhost:5173
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to the backend, so open http://localhost:5173.

## API

| Method | Endpoint                         | Body                                   | Description            |
| ------ | -------------------------------- | -------------------------------------- | ---------------------- |
| GET    | `/api/todos`                     |                                        | List all tasks         |
| POST   | `/api/todos`                     | `{ "title": "Buy milk" }`              | Create a task          |
| PATCH  | `/api/todos/:id`                 | `{ "title"?: string, "completed"?: bool }` | Edit / toggle a task |
| DELETE | `/api/todos/:id`                 |                                        | Delete a task          |
| DELETE | `/api/todos?completed=true`      |                                        | Clear completed tasks  |
| GET    | `/api/health`                    |                                        | Health check           |

## Project structure

```
backend/
  src/server.js     Express routes and validation
  src/store.js      JSON-file persistence
frontend/
  src/App.jsx       State and API calls
  src/api.js        Fetch wrapper
  src/components/   TodoForm, TodoList, TodoItem, FilterBar
  src/index.css     Styles
```
