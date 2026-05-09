import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

// --- MOCK DATA ---
const chartData = [
  { iteration: 0, greedy: 200, ga: 200, sa: 200 },
  { iteration: 5, greedy: 185, ga: 178, sa: 190 },
  { iteration: 10, greedy: 185, ga: 165, sa: 180 },
  { iteration: 20, greedy: 185, ga: 155, sa: 168 },
  { iteration: 30, greedy: 185, ga: 148, sa: 160 },
  { iteration: 40, greedy: 185, ga: 146, sa: 155 },
  { iteration: 50, greedy: 185, ga: 145, sa: 152 },
];

const algorithmsData = {
  GREEDY: {
    name: 'Xếp lịch Tham lam (Greedy)',
    status: 'Vi phạm nghiêm trọng',
    statusColor: 'text-red-600',
    icon: <AlertCircle size={18} />,
    metrics: { cost: '185.000.000đ', violations: 12, coverage: '82%', satisfaction: '65%' },
    scheduleMap: { 
      'Sáng-ICU-Thứ 7': { doc: '❌ [TRỐNG - Thiếu Bác sĩ]', nurse: 'ĐD. Thị Na, ĐD. Thảo Nguyên', type: 'error' },
      'Đêm-ICU-Thứ 2': { doc: '❌ [TRỐNG - Thiếu Bác sĩ]', nurse: 'ĐD. Gia Trang, ĐD. Anna', type: 'error' },
      'Chiều-Cấp Cứu-Thứ 4': { doc: 'BS. Diệu Tâm', nurse: '❌ [TRỐNG - Thiếu Điều dưỡng]', type: 'error' },
    }
  },
  SA: {
    name: 'Luyện kim mô phỏng (SA)',
    status: 'Tạm ổn (Có cảnh báo mềm)',
    statusColor: 'text-yellow-600',
    icon: <AlertTriangle size={18} />,
    metrics: { cost: '152.000.000đ', violations: 5, coverage: '100%', satisfaction: '80%' },
    scheduleMap: { 
      'Sáng-ICU-Thứ 7': { doc: 'BS. Minh (⚠️ Trái ca)', nurse: 'ĐD. Thị Na, ĐD. Thảo Nguyên', type: 'warning' },
      'Đêm-ICU-Thứ 2': { doc: 'BS. John', nurse: 'ĐD. Gia Trang (⚠️ Làm liên tiếp)', type: 'warning' },
    }
  },
  GA: {
    name: 'Thuật toán Di truyền (GA)',
    status: 'Lịch trực hoàn hảo',
    statusColor: 'text-green-600',
    icon: <CheckCircle2 size={18} />,
    metrics: { cost: '145.000.000đ', violations: 0, coverage: '100%', satisfaction: '95%' },
    scheduleMap: {} // Hoàn hảo, tự dùng data chuẩn
  }
};

const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
const allShifts = [
  { time: 'Sáng', dept: 'ICU' }, { time: 'Sáng', dept: 'Cấp Cứu' },
  { time: 'Chiều', dept: 'ICU' }, { time: 'Chiều', dept: 'Cấp Cứu' },
  { time: 'Đêm', dept: 'ICU' }, { time: 'Đêm', dept: 'Cấp Cứu' },
];

export default function App() {
  const [selectedAlgo, setSelectedAlgo] = useState('GREEDY');
  const [selectedDept, setSelectedDept] = useState('ALL'); 
  
  const currentData = algorithmsData[selectedAlgo];

  const filteredShifts = allShifts.filter(shift => selectedDept === 'ALL' || shift.dept === selectedDept);

  const getCellContent = (shiftTime, dept, day) => {
    const key = `${shiftTime}-${dept}-${day}`;
    if (currentData.scheduleMap[key]) return currentData.scheduleMap[key];
    
    const defaultDocs = dept === 'ICU' ? 'BS. Khánh Long' : 'BS. Diệu Tâm';
    const defaultNurses = dept === 'ICU' ? 'ĐD. Thị Na, ĐD. Thảo Nguyên' : 'ĐD. Gia Trang, ĐD. Anna';
    return { doc: defaultDocs, nurse: defaultNurses, type: 'normal' };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center font-sans">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-7xl p-6 flex flex-col gap-6 text-gray-900">
        
        {/* HEADER & METRICS */}
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Khám Phá Thuật Toán: Xếp Lịch Bệnh Viện</h1>
            <div className={`flex items-center gap-2 mt-2 font-medium ${currentData.statusColor}`}>
              {currentData.icon}
              Trạng thái hệ thống: {currentData.status}
            </div>
          </div>
          
          <div className="flex gap-8 text-right">
            {['cost', 'violations', 'coverage', 'satisfaction'].map((key) => (
              <div key={key}>
                <div className="text-[10px] text-gray-500 font-bold uppercase">{key === 'cost' ? 'Chi phí' : key === 'violations' ? 'Vi phạm' : key === 'coverage' ? 'Độ phủ' : 'Hài lòng'}</div>
                <div className="text-lg font-bold text-gray-900">{currentData.metrics[key]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART & CONTROLS */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 border border-gray-200 rounded-lg p-4 bg-white">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Biểu đồ Hội tụ Chi phí (Triệu VNĐ)</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="iteration" tick={{ fontSize: 12 }} />
                  <YAxis domain={[140, 210]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="ga" 
                    name="GA" 
                    stroke={selectedAlgo === 'GA' ? "#16a34a" : "#d1d5db"} 
                    strokeWidth={selectedAlgo === 'GA' ? 3 : 1} 
                    dot={false} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sa" 
                    name="SA" 
                    stroke={selectedAlgo === 'SA' ? "#ca8a04" : "#d1d5db"} 
                    strokeWidth={selectedAlgo === 'SA' ? 3 : 1} 
                    dot={false} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="greedy" 
                    name="Greedy" 
                    stroke={selectedAlgo === 'GREEDY' ? "#dc2626" : "#d1d5db"} 
                    strokeWidth={selectedAlgo === 'GREEDY' ? 3 : 1} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">1. Chọn Thuật toán:</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={selectedAlgo}
                onChange={(e) => setSelectedAlgo(e.target.value)}
              >
                <option value="GREEDY">Tham lam (Greedy)</option>
                <option value="SA">Luyện kim mô phỏng (SA)</option>
                <option value="GA">Di truyền (GA)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">2. Lọc Khoa xem lịch:</label>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'ALL', label: 'Tất cả các khoa' },
                  { id: 'ICU', label: 'Chỉ xem ICU' },
                  { id: 'Cấp Cứu', label: 'Chỉ xem Cấp Cứu' }
                ].map((dept) => (
                  <button 
                    key={dept.id}
                    onClick={() => setSelectedDept(dept.id)} 
                    className={`px-4 py-2 text-sm rounded-lg border text-left font-semibold transition-colors ${selectedDept === dept.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'}`}
                  >
                    {dept.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 font-bold">
              <tr>
                <th className="border-b border-r p-3 w-32 bg-gray-200 text-center uppercase text-[10px] tracking-wider">Ca / Ngày</th>
                {days.map(day => (
                  <th key={day} className="border-b border-l p-3 text-center min-w-[160px]">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredShifts.map((shift, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="border-r p-3 bg-gray-50 text-center">
                    <div className="text-gray-900 font-bold text-sm">{shift.time}</div>
                    <div className="text-gray-500 text-[10px] font-bold uppercase mt-1">{shift.dept}</div>
                  </td>
                  {days.map(day => {
                    const cell = getCellContent(shift.time, shift.dept, day);
                    const isError = cell.type === 'error';
                    const isWarning = cell.type === 'warning';
                    
                    return (
                      <td key={day} className={`border-l p-3 align-top ${isError ? 'bg-red-50' : isWarning ? 'bg-yellow-50' : 'bg-white'}`}>
                        <div className="mb-2">
                          <span className="font-bold text-gray-400 text-[9px] uppercase block mb-1">Bác sĩ:</span>
                          <span className={`text-xs ${isError && cell.doc.includes('❌') ? 'text-red-600 font-bold' : isWarning && cell.doc.includes('⚠️') ? 'text-yellow-700 font-bold' : 'text-gray-800 font-semibold'}`}>
                            {cell.doc}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <span className="font-bold text-gray-400 text-[9px] uppercase block mb-1">Điều dưỡng:</span>
                          <span className={`text-[11px] leading-relaxed ${isError && cell.nurse.includes('❌') ? 'text-red-600 font-bold' : isWarning && cell.nurse.includes('⚠️') ? 'text-yellow-700 font-bold' : 'text-gray-700 font-medium'} block`}>
                            {cell.nurse}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}