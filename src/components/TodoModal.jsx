import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './TodoModal.css';

function TodoModal({ todo, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: ''
  });

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        description: todo.description || '',
        priority: todo.priority || 'medium',
        deadline: todo.deadline || ''
      });
    }
  }, [todo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('请输入待办事项标题');
      return;
    }
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{todo ? '编辑待办事项' : '添加待办事项'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>标题 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="请输入待办事项标题"
              required
            />
          </div>

          <div className="form-group">
            <label>描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="请输入详细描述（可选）"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>优先级</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="high">🔴 高优先级</option>
                <option value="medium">🟡 中优先级</option>
                <option value="low">🟢 低优先级</option>
              </select>
            </div>

            <div className="form-group">
              <label>截止时间</label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              {todo ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TodoModal;