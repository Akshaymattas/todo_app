import Icon from './Icon.jsx';
import { dayLabel, formatSlot, isHappeningNow, isOverdue, meetingProvider } from '../utils/date.js';

export default function TaskItem({ task, onToggle, onEdit, onDelete, showDate = true }) {
  const overdue = isOverdue(task);
  const live = isHappeningNow(task);
  const slot = formatSlot(task.startTime, task.endTime);

  return (
    <li className={`task p-${task.priority}${task.completed ? ' done' : ''}${live ? ' live' : ''}`}>
      <label className="check">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'not done' : 'done'}`}
        />
        <span className="check-box" aria-hidden="true" />
      </label>

      <div className="task-body" onDoubleClick={() => onEdit(task)}>
        <div className="task-title">{task.title}</div>
        {task.notes && <p className="task-notes">{task.notes}</p>}
        <div className="task-meta">
          {live && <span className="badge badge-live">● Now</span>}
          {showDate && task.date && (
            <span className={`meta${overdue ? ' overdue' : ''}`}>
              <Icon name="calendar" size={14} />
              {overdue ? `Overdue · ${dayLabel(task.date)}` : dayLabel(task.date)}
            </span>
          )}
          {slot && (
            <span className="meta">
              <Icon name="clock" size={14} />
              {slot}
            </span>
          )}
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        </div>
      </div>

      <div className="task-actions">
        {task.meetingLink && !task.completed && (
          <a
            className={`join-btn${live ? ' pulse' : ''}`}
            href={task.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            title={task.meetingLink}
          >
            <Icon name="video" size={16} />
            <span>Join {meetingProvider(task.meetingLink)}</span>
          </a>
        )}
        <button className="icon-btn" onClick={() => onEdit(task)} aria-label="Edit task" title="Edit">
          <Icon name="edit" size={16} />
        </button>
        <button className="icon-btn danger" onClick={() => onDelete(task)} aria-label="Delete task" title="Delete">
          <Icon name="trash" size={16} />
        </button>
      </div>
    </li>
  );
}
