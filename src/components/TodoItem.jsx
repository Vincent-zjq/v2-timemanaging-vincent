import React from 'react';
import { format } from 'date-fns';
import './TodoItem.css';

function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const getPriorityConfig = (priority) => {
    const configs = {
      high: { label: '高', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
      medium: { label: '中', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
      low: { label: '低', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' }
    };
    return configs[priority] || configs.medium;
  };

  const getDeadlineText = () => {
    if (!todo.deadline) return null;

    const deadline = new Date(todo.deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="deadline overdue">已逾期 {Math.abs(diffDays)} 天</span>;
    } else if (diffDays === 0) {
      return <span className="deadline today">今天截止</span>;
    } else if (diffDays === 1) {
      return <span className="deadline tomorrow">明天截止</span>;
    } else if (diffDays <= 7) {
      return <span className="deadline week">还有 {diffDays} 天</span>;
    } else {
      return <span className="deadline normal">{format(deadline, 'yyyy-MM-dd')}</span>;
    }
  };

  const priorityConfig = getPriorityConfig(todo.priority);

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-item-left">
        <button
          className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={() => onToggle(todo.id)}
          aria-label={todo.completed ? '标记为未完成' : '标记为完成'}
        >
          {todo.completed && <span className="check-icon">✓</span>}
        </button>

        <div className="todo-item-content">
          <div className="todo-item-header">
            <h3 className="todo-title">{todo.title}</h3>
            <span
              className="priority-badge"
              style={{
                color: priorityConfig.color,
                backgroundColor: priorityConfig.bgColor
              }}
            >
              {priorityConfig.label}
            </span>
          </div>

          {todo.description && (
            <p className="todo-description">{todo.description}</p>
          )}

          <div className="todo-item-meta">
            {getDeadlineText()}
            {todo.createdAt && (
              <span className="created-at">
                创建于 {format(new Date(todo.createdAt), 'MM-dd HH:mm')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="todo-item-actions">
        <button
          className="todo-action-btn edit"
          onClick={() => onEdit(todo)}
          title="编辑"
        >
          ✏️
        </button>
        <button
          className="todo-action-btn delete"
          onClick={() => onDelete(todo.id)}
          title="删除"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default TodoItem;