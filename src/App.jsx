import React, { useState, useEffect } from 'react';
import WeeklySchedule from './components/WeeklySchedule';
import TodoList from './components/TodoList';
import { storage, exportData, importData, STORAGE_KEYS } from './utils/constants';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [showImportModal, setShowImportModal] = useState(false);

  const handleExport = () => {
    exportData();
    alert('数据导出成功！');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await importData(file);
        alert('数据导入成功！');
        setShowImportModal(false);
        window.location.reload();
      } catch (error) {
        alert('导入失败，请检查文件格式！');
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      storage.remove(STORAGE_KEYS.SCHEDULES);
      storage.remove(STORAGE_KEYS.TODOS);
      storage.remove(STORAGE_KEYS.COURSES);
      alert('数据已清除！');
      window.location.reload();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>⏰ 时间管理应用</h1>
        <div className="header-actions">
          <button className="action-btn" onClick={() => setShowImportModal(true)}>
            📥 导入数据
          </button>
          <button className="action-btn" onClick={handleExport}>
            📤 导出数据
          </button>
          <button className="action-btn danger" onClick={handleClearData}>
            🗑️ 清除数据
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 周日程表
        </button>
        <button
          className={`nav-btn ${activeTab === 'todo' ? 'active' : ''}`}
          onClick={() => setActiveTab('todo')}
        >
          ✅ 待办事项
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'schedule' && <WeeklySchedule />}
        {activeTab === 'todo' && <TodoList />}
      </main>

      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>导入数据</h2>
            <p>请选择之前导出的JSON文件</p>
            <input type="file" accept=".json" onChange={handleImport} />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowImportModal(false)}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;