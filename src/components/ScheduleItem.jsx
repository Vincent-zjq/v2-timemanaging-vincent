import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { SCHEDULE_TYPES, WEEK_DAYS } from '../utils/constants';
import './ScheduleItem.css';

function ScheduleItem({ schedule, onEdit, onDelete, onMove }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'SCHEDULE',
    item: { schedule },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const typeConfig = SCHEDULE_TYPES[schedule.type] || SCHEDULE_TYPES.TASK;

  const handleClick = (e) => {
    e.stopPropagation();
    onEdit(schedule);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(schedule.id);
  };

  return (
    <div
      ref={drag}
      className={`schedule-item ${isDragging ? 'dragging' : ''}`}
      style={{
        backgroundColor: typeConfig.bgColor,
        borderLeft: `4px solid ${typeConfig.color}`,
      }}
      onClick={handleClick}
    >
      <div className="schedule-item-header">
        <span className="schedule-item-icon">{typeConfig.icon}</span>
        <span className="schedule-item-title">{schedule.title}</span>
        <button
          className="schedule-item-delete"
          onClick={handleDelete}
          title="删除"
        >
          ✕
        </button>
      </div>
      {schedule.location && (
        <div className="schedule-item-location">📍 {schedule.location}</div>
      )}
      {schedule.description && (
        <div className="schedule-item-description">{schedule.description}</div>
      )}
    </div>
  );
}

export default ScheduleItem;