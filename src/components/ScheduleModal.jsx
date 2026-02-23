import React, { useState, useEffect } from 'react';
import { SCHEDULE_TYPES, WEEK_DAYS, TIME_SLOTS } from '../utils/constants';
import './ScheduleModal.css';

function ScheduleModal({ schedule, initialDay, initialTime, onSave, onClose, currentDate }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'task',
    dayId: 0,
    hour: 8,
    minute: 0,
    duration: 1,
    location: '',
    description: '',
    date: ''
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        title: schedule.title,
        type: schedule.type,
        dayId: schedule.dayId,
        hour: schedule.hour,
        minute: schedule.minute,
        duration: schedule.duration || 1,
        location: schedule.location || '',
        description: schedule.description || '',
        date: schedule.date || ''
      });
    } else if (initialDay !== undefined && initialTime) {
      setFormData(prev => ({
        ...prev,
        dayId: initialDay,
        hour: initialTime.hour,
        minute: initialTime.minute,
        date: currentDate || ''
      }));
    }
  }, [schedule, initialDay, initialTime, currentDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('请输入日程标题');
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
        <h2>{schedule ? '编辑日程' : '添加日程'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>标题 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="请输入日程标题"
              required
            />
          </div>

          <div className="form-group">
            <label>类型</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              {Object.values(SCHEDULE_TYPES).filter(t => t.id !== 'course').map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>星期</label>
              <select name="dayId" value={formData.dayId} onChange={handleChange}>
                {WEEK_DAYS.map(day => (
                  <option key={day.id} value={day.id}>
                    {day.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>时间</label>
              <select
                name="time"
                value={`${formData.hour}:${formData.minute === 0 ? '00' : '30'}`}
                onChange={(e) => {
                  const [hour, minute] = e.target.value.split(':').map(Number);
                  setFormData(prev => ({ ...prev, hour, minute }));
                }}
              >
                {TIME_SLOTS.map(slot => (
                  <option key={slot.label} value={slot.label}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>日期（可选，留空则每周重复）</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="选择具体日期"
            />
            <small className="form-hint">留空表示该日程每周重复，选择日期则只在指定日期显示</small>
          </div>

          <div className="form-group">
            <label>时长（小时）</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="0.5"
              max="12"
              step="0.5"
            />
          </div>

          <div className="form-group">
            <label>地点</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="请输入地点（可选）"
            />
          </div>

          <div className="form-group">
            <label>描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="请输入描述（可选）"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              {schedule ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleModal;