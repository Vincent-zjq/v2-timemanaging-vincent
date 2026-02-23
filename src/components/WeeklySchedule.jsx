import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ScheduleItem from './ScheduleItem';
import ScheduleModal from './ScheduleModal';
import CourseImportModal from './CourseImportModal';
import {
  WEEK_DAYS,
  TIME_SLOTS,
  SCHEDULE_TYPES,
  STORAGE_KEYS,
  generateId,
  storage
} from '../utils/constants';
import './WeeklySchedule.css';

function WeeklySchedule() {
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  useEffect(() => {
    const savedSchedules = storage.get(STORAGE_KEYS.SCHEDULES);
    const savedCourses = storage.get(STORAGE_KEYS.COURSES);
    setSchedules(savedSchedules);
    setCourses(savedCourses);
  }, []);

  useEffect(() => {
    storage.set(STORAGE_KEYS.SCHEDULES, schedules);
  }, [schedules]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.COURSES, courses);
  }, [courses]);

  const handleAddSchedule = (dayId, hour, minute) => {
    setEditingSchedule(null);
    setSelectedSchedule({ dayId, hour, minute });
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setSelectedSchedule(null);
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = (scheduleData) => {
    if (editingSchedule) {
      setSchedules(schedules.map(s =>
        s.id === editingSchedule.id ? { ...scheduleData, id: editingSchedule.id } : s
      ));
    } else {
      const newSchedule = {
        id: generateId(),
        ...scheduleData
      };
      setSchedules([...schedules, newSchedule]);
    }
    setShowScheduleModal(false);
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = (scheduleId) => {
    if (window.confirm('确定要删除这个日程吗？')) {
      setSchedules(schedules.filter(s => s.id !== scheduleId));
    }
  };

  const handleMoveSchedule = (scheduleId, newDayId, newHour, newMinute) => {
    setSchedules(schedules.map(s =>
      s.id === scheduleId ? { ...s, dayId: newDayId, hour: newHour, minute: newMinute } : s
    ));
  };

  const handleImportCourses = (importedCourses) => {
    setCourses([...courses, ...importedCourses]);
    setShowCourseModal(false);
  };

  const handlePreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getSchedulesForSlot = (dayId, hour, minute) => {
    const weekDates = getWeekDates();
    const targetDate = weekDates[dayId];
    const dateString = targetDate.toISOString().split('T')[0];
    
    return [...schedules, ...courses].filter(s =>
      s.dayId === dayId &&
      s.hour === hour &&
      s.minute === minute &&
      (!s.date || s.date === dateString)
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="weekly-schedule">
        <div className="schedule-header">
          <h2>📅 周日程表</h2>
          <div className="week-navigation">
            <button className="btn-secondary" onClick={handlePreviousWeek}>
              ← 上一周
            </button>
            <button className="btn-secondary" onClick={handleToday}>
              今天
            </button>
            <button className="btn-secondary" onClick={handleNextWeek}>
              下一周 →
            </button>
          </div>
          <div className="schedule-actions">
            <button className="btn-primary" onClick={() => {
              setEditingSchedule(null);
              setSelectedSchedule(null);
              setShowScheduleModal(true);
            }}>
              ➕ 添加日程
            </button>
            <button className="btn-secondary" onClick={() => setShowCourseModal(true)}>
              📚 导入课表
            </button>
          </div>
        </div>

        <div className="week-info">
          {formatDate(currentWeekStart)} - {formatDate(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000))}
        </div>

        <div className="schedule-container">
          <div className="schedule-header-row">
            <div className="time-column-header">时间</div>
            {WEEK_DAYS.map((day, index) => {
              const weekDates = getWeekDates();
              const date = weekDates[index];
              return (
                <div key={day.id} className={`day-column-header ${isToday(date) ? 'today' : ''}`}>
                  <div>{day.name}</div>
                  <div className="day-date">{formatDate(date)}</div>
                </div>
              );
            })}
          </div>

          <div className="schedule-body">
            {TIME_SLOTS.map(slot => (
              <div key={`${slot.hour}-${slot.minute}`} className="time-row">
                <div className="time-cell">
                  {slot.label}
                </div>
                {WEEK_DAYS.map(day => {
                  const slotSchedules = getSchedulesForSlot(day.id, slot.hour, slot.minute);
                  return (
                    <div
                      key={`${day.id}-${slot.hour}-${slot.minute}`}
                      className={`schedule-cell ${slotSchedules.length > 0 ? 'has-schedule' : 'empty'}`}
                      onClick={() => handleAddSchedule(day.id, slot.hour, slot.minute)}
                    >
                      {slotSchedules.map(schedule => (
                        <ScheduleItem
                          key={schedule.id}
                          schedule={schedule}
                          onEdit={handleEditSchedule}
                          onDelete={handleDeleteSchedule}
                          onMove={handleMoveSchedule}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="schedule-legend">
          <h3>图例说明</h3>
          <div className="legend-items">
            {Object.values(SCHEDULE_TYPES).map(type => (
              <div key={type.id} className="legend-item">
                <span className="legend-icon">{type.icon}</span>
                <span className="legend-name">{type.name}</span>
              </div>
            ))}
          </div>
        </div>

        {showScheduleModal && (
        <ScheduleModal
          schedule={editingSchedule}
          initialDay={selectedSchedule?.dayId}
          initialTime={selectedSchedule ? { hour: selectedSchedule.hour, minute: selectedSchedule.minute } : undefined}
          onSave={handleSaveSchedule}
          onClose={() => {
            setShowScheduleModal(false);
            setEditingSchedule(null);
            setSelectedSchedule(null);
          }}
          currentDate={currentWeekStart.toISOString().split('T')[0]}
        />
      )}

        {showCourseModal && (
          <CourseImportModal
            onImport={handleImportCourses}
            onClose={() => setShowCourseModal(false)}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default WeeklySchedule;