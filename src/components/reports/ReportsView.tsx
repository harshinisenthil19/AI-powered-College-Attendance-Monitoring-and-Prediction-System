import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  FileText,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { students, subjects, attendanceRecords } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'DAILY' | 'MONTHLY' | 'SUBJECT_WISE' | 'STUDENT_HISTORY'>('DAILY');
  
  // Daily report filter
  const todayStr = new Date().toISOString().split('T')[0];
  const [reportDate, setReportDate] = useState(todayStr);

  // Student history filter
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [searchHistory, setSearchHistory] = useState('');

  // Daily report calculations
  const dailyRecords = attendanceRecords.filter(r => r.date === reportDate);
  const dailyPresent = dailyRecords.filter(r => r.status === 'PRESENT' || r.status === 'EXCUSED').length;
  const dailyAbsent = dailyRecords.filter(r => r.status === 'ABSENT').length;
  const dailyLate = dailyRecords.filter(r => r.status === 'LATE').length;
  const dailyTotal = dailyRecords.length;
  const dailyRate = dailyTotal > 0 ? Math.round(((dailyPresent + dailyLate * 0.75) / dailyTotal) * 1000) / 10 : 0;

  // Monthly aggregated data across unique dates
  const uniqueDates = Array.from(new Set(attendanceRecords.map(r => r.date))).sort();
  const monthlyTrendData = uniqueDates.map(d => {
    const dayRecords = attendanceRecords.filter(r => r.date === d);
    const present = dayRecords.filter(r => r.status === 'PRESENT' || r.status === 'EXCUSED').length;
    const rate = dayRecords.length > 0 ? Math.round((present / dayRecords.length) * 1000) / 10 : 0;
    return {
      date: d.slice(5), // MM-DD
      rate
    };
  });

  // Subject-wise comparative data
  const subjectReportData = subjects.map(sub => {
    const subRecords = attendanceRecords.filter(r => r.subjectId === sub.id);
    const present = subRecords.filter(r => r.status === 'PRESENT' || r.status === 'EXCUSED').length;
    const total = subRecords.length;
    const percentage = total > 0 ? Math.round((present / total) * 1000) / 10 : 0;
    return {
      code: sub.code,
      name: sub.name,
      faculty: sub.teacherName,
      total,
      present,
      percentage
    };
  });

  // Student history logs
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentHistoryRecords = attendanceRecords
    .filter(r => r.studentId === selectedStudentId)
    .filter(r => !searchHistory || r.subjectCode.toLowerCase().includes(searchHistory.toLowerCase()) || r.date.includes(searchHistory))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (activeReportTab === 'DAILY') {
      csvContent += 'Date,Subject,Roll Number,Student Name,Status,Remarks\n';
      dailyRecords.forEach(r => {
        csvContent += `"${r.date}","${r.subjectCode}","${r.rollNumber}","${r.studentName}","${r.status}","${r.remarks || ''}"\n`;
      });
    } else if (activeReportTab === 'SUBJECT_WISE') {
      csvContent += 'Subject Code,Subject Name,Faculty,Total Held,Present,Attendance Rate\n';
      subjectReportData.forEach(s => {
        csvContent += `"${s.code}","${s.name}","${s.faculty}",${s.total},${s.present},"${s.percentage}%"\n`;
      });
    } else {
      csvContent += 'Roll Number,Student Name,Department,Year,Attendance Percentage,Risk Status\n';
      students.forEach(s => {
        csvContent += `"${s.rollNumber}","${s.name}","${s.department}",${s.year},"${s.attendancePercentage}%","${s.riskStatus}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${activeReportTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="reports-view">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Attendance Intelligence & Regulatory Reports
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Generate daily summaries, monthly trend timelines, subject-level audits, and exportable regulatory transcripts.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
              title="Download CSV Spreadsheet"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
              title="Print Official Report"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>

        {/* Report Category Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveReportTab('DAILY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportTab === 'DAILY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Daily Roll Call Report
          </button>
          <button
            onClick={() => setActiveReportTab('MONTHLY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportTab === 'MONTHLY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Monthly Timeline Trend
          </button>
          <button
            onClick={() => setActiveReportTab('SUBJECT_WISE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportTab === 'SUBJECT_WISE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Subject-Wise Aggregation
          </button>
          <button
            onClick={() => setActiveReportTab('STUDENT_HISTORY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportTab === 'STUDENT_HISTORY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Individual Student Dossier
          </button>
        </div>
      </div>

      {/* 1. DAILY REPORT */}
      {activeReportTab === 'DAILY' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daily Attendance Log for {reportDate}
                </h3>
                <p className="text-xs text-slate-500">
                  {dailyTotal} student roll calls recorded
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-xs font-semibold text-slate-600">Select Date:</label>
              <input
                type="date"
                value={reportDate}
                onChange={e => setReportDate(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Daily Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Rate</div>
              <div className="text-2xl font-extrabold text-indigo-600 mt-1">{dailyRate}%</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-[11px] font-bold text-emerald-600 uppercase">Present</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">{dailyPresent}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-[11px] font-bold text-rose-600 uppercase">Absent</div>
              <div className="text-2xl font-extrabold text-rose-700 mt-1">{dailyAbsent}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-[11px] font-bold text-amber-600 uppercase">Late</div>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">{dailyLate}</div>
            </div>
          </div>

          {/* Daily Register Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No classes or attendance records logged for {reportDate}.
                      </td>
                    </tr>
                  ) : (
                    dailyRecords.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                          {r.subjectCode}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{r.rollNumber}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{r.studentName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              r.status === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-700'
                                : r.status === 'ABSENT'
                                ? 'bg-rose-100 text-rose-700'
                                : r.status === 'LATE'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{r.remarks || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. MONTHLY TIMELINE TREND */}
      {activeReportTab === 'MONTHLY' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Monthly Attendance Trend Curve
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Daily percentage of enrolled students present across the academic term
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val}% Attendance`, 'Daily Rate']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#attendanceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBJECT-WISE AGGREGATION */}
      {activeReportTab === 'SUBJECT_WISE' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Course-Wise Comparative Performance
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Comparative average student presence percentage across curriculum modules
            </p>

            <div className="h-64 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectReportData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Attendance Rate']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                    {subjectReportData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.percentage >= 80 ? '#10b981' : entry.percentage >= 75 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Subject Title</th>
                    <th className="py-3 px-4">Faculty</th>
                    <th className="py-3 px-4">Conducted Sessions</th>
                    <th className="py-3 px-4">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjectReportData.map(s => (
                    <tr key={s.code} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">{s.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-4 text-slate-600">{s.faculty}</td>
                      <td className="py-3 px-4 text-slate-600">{s.total} Sessions</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">{s.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. INDIVIDUAL STUDENT DOSSIER */}
      {activeReportTab === 'STUDENT_HISTORY' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Student:
              </label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-indigo-500"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNumber}) &bull; {s.attendancePercentage}%
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-64">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Search Logs:
              </label>
              <input
                type="text"
                placeholder="Filter by subject code or date..."
                value={searchHistory}
                onChange={e => setSearchHistory(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          {selectedStudent && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Attendance History for {selectedStudent.name} ({selectedStudent.rollNumber})
                </h3>
                <span className="text-xs font-bold text-indigo-600">
                  Overall: {selectedStudent.attendancePercentage}%
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentHistoryRecords.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">
                          No attendance history records match your search.
                        </td>
                      </tr>
                    ) : (
                      studentHistoryRecords.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono text-slate-700">{r.date}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{r.subjectCode} - {r.subjectName}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                r.status === 'PRESENT'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : r.status === 'ABSENT'
                                  ? 'bg-rose-100 text-rose-700'
                                  : r.status === 'LATE'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{r.remarks || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
