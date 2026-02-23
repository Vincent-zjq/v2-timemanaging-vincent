import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { generateId } from '../utils/constants';
import './CourseImportModal.css';

function CourseImportModal({ onImport, onClose }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length < 2) {
          setError('Excel文件格式不正确，请确保包含表头和数据行');
          return;
        }

        const courses = parseCourseData(jsonData);
        setPreviewData(courses);
      } catch (err) {
        setError('解析Excel文件失败，请检查文件格式');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseCourseData = (data) => {
    const courses = [];
    const headers = data[0];

    // 查找星期列的索引
    const dayColumns = {};
    headers.forEach((header, index) => {
      const dayName = header?.trim();
      if (dayName) {
        const dayMap = {
          '周一': 0, '星期一': 0,
          '周二': 1, '星期二': 1,
          '周三': 2, '星期三': 2,
          '周四': 3, '星期四': 3,
          '周五': 4, '星期五': 4,
          '周六': 5, '星期六': 5,
          '周日': 6, '星期日': 6
        };
        if (dayMap[dayName] !== undefined) {
          dayColumns[dayMap[dayName]] = index;
        }
      }
    });

    // 解析每行数据
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      // 假设第一列是时间
      const timeStr = row[0];
      if (!timeStr) continue;

      const timeInfo = parseTime(timeStr);
      if (!timeInfo) continue;

      // 为每个星期添加课程
      Object.entries(dayColumns).forEach(([dayId, colIndex]) => {
        const cellValue = row[colIndex];
        if (cellValue && cellValue.trim()) {
          courses.push({
            id: generateId(),
            type: 'course',
            dayId: parseInt(dayId),
            hour: timeInfo.hour,
            minute: timeInfo.minute,
            duration: timeInfo.duration || 1,
            title: cellValue.trim(),
            location: '',
            description: ''
          });
        }
      });
    }

    return courses;
  };

  const parseTime = (timeStr) => {
    // 支持多种时间格式：8:00, 8:00-9:00, 8, 8:30等
    const match = timeStr.match(/(\d{1,2}):?(\d{0,2})/);
    if (match) {
      const hour = parseInt(match[1]);
      const minute = match[2] ? parseInt(match[2]) : 0;
      if (hour >= 6 && hour <= 23) {
        return { hour, minute, duration: 1 };
      }
    }
    return null;
  };

  const handleImport = () => {
    if (previewData.length === 0) {
      alert('没有可导入的课程数据');
      return;
    }
    onImport(previewData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>📚 导入课表</h2>

        <div className="import-instructions">
          <h3>Excel文件格式说明：</h3>
          <ul>
            <li>第一行应为表头，包含"周一"、"周二"等星期名称</li>
            <li>第一列应为时间，如"8:00"、"8:30"等</li>
            <li>单元格中填写课程名称</li>
          </ul>
        </div>

        <div className="form-group">
          <label>选择Excel文件</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {previewData.length > 0 && (
          <div className="preview-section">
            <h3>预览（共{previewData.length}门课程）</h3>
            <div className="preview-list">
              {previewData.slice(0, 10).map((course, index) => (
                <div key={index} className="preview-item">
                  <span className="preview-time">
                    {course.hour}:{course.minute === 0 ? '00' : '30'}
                  </span>
                  <span className="preview-day">
                    {['周一', '周二', '周三', '周四', '周五', '周六', '周日'][course.dayId]}
                  </span>
                  <span className="preview-title">{course.title}</span>
                </div>
              ))}
              {previewData.length > 10 && (
                <div className="preview-more">
                  ...还有 {previewData.length - 10} 门课程
                </div>
              )}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            取消
          </button>
          <button
            className="btn-primary"
            onClick={handleImport}
            disabled={previewData.length === 0}
          >
            导入 {previewData.length > 0 && `(${previewData.length}门课程)`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseImportModal;