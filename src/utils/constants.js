// 数据存储键名
const STORAGE_KEYS = {
  SCHEDULES: 'timeApp_schedules',
  TODOS: 'timeApp_todos',
  COURSES: 'timeApp_courses'
};

// 日程类型配置
const SCHEDULE_TYPES = {
  STUDY: {
    id: 'study',
    name: '学习类',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    icon: '📚'
  },
  SPORT: {
    id: 'sport',
    name: '运动类',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: '🏃'
  },
  ENTERTAINMENT: {
    id: 'entertainment',
    name: '娱乐类',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    icon: '🎮'
  },
  TASK: {
    id: 'task',
    name: '事务类',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    icon: '📋'
  },
  COURSE: {
    id: 'course',
    name: '课程',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    icon: '🎓'
  }
};

// 星期配置
const WEEK_DAYS = [
  { id: 0, name: '周一', short: '一' },
  { id: 1, name: '周二', short: '二' },
  { id: 2, name: '周三', short: '三' },
  { id: 3, name: '周四', short: '四' },
  { id: 4, name: '周五', short: '五' },
  { id: 5, name: '周六', short: '六' },
  { id: 6, name: '周日', short: '日' }
];

// 时间段配置（每小时一个单位，从8:00到23:00）
const TIME_SLOTS = [];
for (let hour = 8; hour <= 23; hour++) {
  TIME_SLOTS.push({ hour, minute: 0, label: `${hour}:00` });
}

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 本地存储工具
const storage = {
  get(key, defaultValue = []) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }
};

// 导出数据为JSON
const exportData = () => {
  const data = {
    schedules: storage.get(STORAGE_KEYS.SCHEDULES),
    todos: storage.get(STORAGE_KEYS.TODOS),
    courses: storage.get(STORAGE_KEYS.COURSES),
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `time-managing-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 导入数据
const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.schedules) storage.set(STORAGE_KEYS.SCHEDULES, data.schedules);
        if (data.todos) storage.set(STORAGE_KEYS.TODOS, data.todos);
        if (data.courses) storage.set(STORAGE_KEYS.COURSES, data.courses);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export {
  STORAGE_KEYS,
  SCHEDULE_TYPES,
  WEEK_DAYS,
  TIME_SLOTS,
  generateId,
  storage,
  exportData,
  importData
};