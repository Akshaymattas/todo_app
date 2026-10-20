import TaskItem from './TaskItem.jsx';
import { dayLabel, isOverdue } from '../utils/date.js';

function groupTasks(tasks) {
  const groups = new Map();
  for (const task of tasks) {
    const key = isOverdue(task) ? 'overdue' : task.date ?? 'none';
    if (!groups.has(key)) {
      const label = key === 'overdue' ? 'Overdue' : key === 'none' ? 'No date' : dayLabel(key);
      groups.set(key, { key, label, tasks: [] });
    }
    groups.get(key).tasks.push(task);
  }
  return [...groups.values()];
}

export default function TaskList({ tasks, emptyTitle, emptyText, ...handlers }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-art" aria-hidden="true">
          ✓
        </div>
        <h3>{emptyTitle}</h3>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="groups">
      {groupTasks(tasks).map((group) => (
        <section key={group.key} className="group">
          <h3 className={`group-title${group.key === 'overdue' ? ' overdue' : ''}`}>
            {group.label}
            <span className="count">{group.tasks.length}</span>
          </h3>
          <ul className="task-list">
            {group.tasks.map((task) => (
              <TaskItem key={task.id} task={task} showDate={group.key === 'overdue'} {...handlers} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
