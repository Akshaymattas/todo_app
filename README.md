# Taskflow

A full-stack task planner: a React (Vite) frontend and an Express REST API.

## Features

- **Tasks with details:** title, notes, date, time slot (start–end, with 15m/30m/1h/2h shortcuts), meeting link and priority (low / medium / high).
- **Meeting links:** a one-click **Join** button that recognises Google Meet, Zoom, Teams and Webex. It turns green and pulses while the meeting's time slot is running.
- **Views:** Today (including overdue tasks), Upcoming, Calendar, All tasks and Completed, each with a count in the sidebar.
- **Calendar:** month grid with colour-coded tasks per day and a side panel for the selected day. Double-click a day to add a task on it.
- **Quick add:** type a title and press Enter, or use **Add details** for the full form.
- Search, today's progress bar, undo after delete, and light/dark mode.
- Responsive layout that works on phones.

Tasks are saved to `backend/data/todos.json`.

## Getting started

Requires Node.js 18+. On Windows, double-click `start-app.cmd`. Otherwise:

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

Task fields: `title` (required), `notes`, `date` (`YYYY-MM-DD`), `startTime` / `endTime` (`HH:MM`, 24h), `meetingLink` (http/https URL), `priority` (`low` | `medium` | `high`), `completed` (boolean). Send `null` to clear an optional field.

| Method | Endpoint                    | Body                     | Description           |
| ------ | --------------------------- | ------------------------ | --------------------- |
| GET    | `/api/todos`                |                          | List all tasks        |
| POST   | `/api/todos`                | task fields              | Create a task         |
| PATCH  | `/api/todos/:id`            | any subset of the fields | Edit / toggle a task  |
| DELETE | `/api/todos/:id`            |                          | Delete a task         |
| DELETE | `/api/todos?completed=true` |                          | Clear completed tasks |
| GET    | `/api/health`               |                          | Health check          |

A time slot needs a date, an end time needs a start time, and the end must be after the start.

## Project structure

```
backend/
  src/server.js       Express routes
  src/validate.js     Input validation
  src/store.js        JSON-file persistence
frontend/
  src/App.jsx         State, views and API calls
  src/api.js          Fetch wrapper
  src/utils/date.js   Date/time helpers
  src/components/     Sidebar, TaskList, TaskItem, TaskForm, CalendarView, Modal, Icon
  src/index.css       Styles and theme tokens
```
