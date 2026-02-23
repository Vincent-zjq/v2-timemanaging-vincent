import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import TodoModal from './TodoModal';
import { STORAGE_KEYS, generateId, storage } from '../utils/constants';
import './TodoList.css';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  useEffect(() => {
    const savedTodos = storage.get(STORAGE_KEYS.TODOS);
    setTodos(savedTodos);
  }, []);

  useEffect(() => {
    storage.set(STORAGE_KEYS.TODOS, todos);
  }, [todos]);

  const handleAddTodo = () => {
    setEditingTodo(null);
    setShowModal(true);
  };

  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    setShowModal(true);
  };

  const handleSaveTodo = (todoData) => {
    if (editingTodo) {
      setTodos(todos.map(t =>
        t.id === editingTodo.id ? { ...todoData, id: editingTodo.id } : t
      ));
    } else {
      const newTodo = {
        id: generateId(),
        completed: false,
        createdAt: new Date().toISOString(),
        ...todoData
      };
      setTodos([...todos, newTodo]);
    }
    setShowModal(false);
    setEditingTodo(null);
  };

  const handleToggleComplete = (todoId) => {
    setTodos(todos.map(t =>
      t.id === todoId ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleDeleteTodo = (todoId) => {
    if (window.confirm('确定要删除这个待办事项吗？')) {
      setTodos(todos.filter(t => t.id !== todoId));
    }
  };

  const getFilteredTodos = () => {
    let filtered = [...todos];

    // 按状态筛选
    if (filter === 'active') {
      filtered = filtered.filter(t => !t.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    }

    // 排序
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (sortBy === 'created') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    return filtered;
  };

  const getStats = () => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    return { total, completed, active };
  };

  const stats = getStats();
  const filteredTodos = getFilteredTodos();

  return (
    <div className="todo-list">
      <div className="todo-header">
        <h2>✅ 待办事项</h2>
        <div className="todo-stats">
          <span className="stat-item">
            <span className="stat-label">总计</span>
            <span className="stat-value">{stats.total}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">已完成</span>
            <span className="stat-value completed">{stats.completed}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">进行中</span>
            <span className="stat-value active">{stats.active}</span>
          </span>
        </div>
      </div>

      <div className="todo-controls">
        <div className="filter-group">
          <label>筛选：</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              全部
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              进行中
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              已完成
            </button>
          </div>
        </div>

        <div className="sort-group">
          <label>排序：</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priority">按优先级</option>
            <option value="deadline">按截止时间</option>
            <option value="created">按创建时间</option>
          </select>
        </div>

        <button className="btn-primary" onClick={handleAddTodo}>
          ➕ 添加待办
        </button>
      </div>

      <div className="todo-items">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>暂无待办事项</p>
            <p className="empty-hint">点击"添加待办"按钮创建新的待办事项</p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggleComplete}
              onEdit={handleEditTodo}
              onDelete={handleDeleteTodo}
            />
          ))
        )}
      </div>

      {showModal && (
        <TodoModal
          todo={editingTodo}
          onSave={handleSaveTodo}
          onClose={() => {
            setShowModal(false);
            setEditingTodo(null);
          }}
        />
      )}
    </div>
  );
}

export default TodoList;