import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import {
  CheckSquare,
  XSquare,
  Clock,
  ShieldAlert,
  Save,
  CheckCircle2,
  Calendar,
  BookOpen,
  Users,
  Search
} from 'lucide-react';

export const MarkAttendance: React.FC = () => {
  const { students, subjects, markBatchAttendance, attendanceRecords } = useApp();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Attendance state for current session: { [studentId]: { status: AttendanceStatus, remarks: string } }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>(() => {
    // Check if attendance already marked for this date & subject
    const existing = attendanceRecords.filter(
      r => r.date === todayStr && r.subjectId === (subjects[0]?.id || '')
    );

    const initial: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    students.forEach(s => {
      const record = existing.find(r => r.studentId === s.id);
      initial[s.id] = {
        status: record ? record.status : 'PRESENT',
        remarks: record?.remarks || ''
      };
    });
    return initial;
  });

  // When date or subject changes, load existing records or default to present
  const handleDateOrSubjectChange = (newDate: string, newSubjectId: string) => {
    setSelectedDate(newDate);
    setSelectedSubjectId(newSubjectId);
    setSuccessMessage('');

    const existing = attendanceRecords.filter(
      r => r.date === newDate && r.subjectId === newSubjectId
    );

    const nextMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    students.forEach(s => {
      const record = existing.find(r => r.studentId === s.id);
      nextMap[s.id] = {
        status: record ? record.status : 'PRESENT',
        remarks: record?.remarks || ''
      };
    });
    setAttendanceMap(nextMap);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    setAttendanceMap(prev => {
      const updated = { ...prev };
      students.forEach(s => {
        updated[s.id] = {
          ...updated[s.id],
          status
        };
      });
      return updated;
    });
  };

  const handleSave = () => {
    const entries = students.map(student => ({
      studentId: student.id,
      status: attendanceMap[student.id]?.status || 'PRESENT',
      remarks: attendanceMap[student.id]?.remarks || undefined
    }));

    markBatchAttendance(selectedDate, selectedSubjectId, entries);
    const sub = subjects.find(s => s.id === selectedSubjectId);
    setSuccessMessage(
      `Attendance successfully recorded for ${sub?.code} - ${sub?.name} on ${selectedDate} (${entries.length} students logged).`
    );

    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  const filteredStudents = students.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Current session stats
  const total = students.length;
  const presentCount = Object.values(attendanceMap).filter(v => v.status === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter(v => v.status === 'ABSENT').length;
  const lateCount = Object.values(attendanceMap).filter(v => v.status === 'LATE').length;
  const excusedCount = Object.values(attendanceMap).filter(v => v.status === 'EXCUSED').length;
  const sessionRate = total > 0 ? Math.round(((presentCount + (lateCount * 0.75) + excusedCount) / total) * 1000) / 10 : 0;

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-6" id="mark-attendance-view">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Mark Daily Class Attendance
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select date, subject module, and record student roll call. Integrates with Spring Boot <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">POST /api/attendance/mark</code>
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleSave}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save & Sync Attendance</span>
            </button>
          </div>
        </div>

        {/* Date & Subject Selectors Row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Class Date</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => handleDateOrSubjectChange(e.target.value, selectedSubjectId)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Subject / Course</span>
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => handleDateOrSubjectChange(selectedDate, e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name} ({s.teacherName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter Student List</span>
            </label>
            <input
              type="text"
              placeholder="Search by name or roll..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Live Session Counter Banner */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Session Attendance: <strong>{sessionRate}%</strong></span>
            </span>
            <span className="text-emerald-700 font-medium">Present: {presentCount}</span>
            <span className="text-rose-700 font-medium">Absent: {absentCount}</span>
            <span className="text-amber-700 font-medium">Late: {lateCount}</span>
            <span className="text-blue-700 font-medium">Excused: {excusedCount}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-500 font-medium">Quick Bulk Actions:</span>
            <button
              onClick={() => markAll('PRESENT')}
              className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] hover:bg-emerald-200 transition-colors"
            >
              All Present
            </button>
            <button
              onClick={() => markAll('ABSENT')}
              className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 font-bold text-[11px] hover:bg-rose-200 transition-colors"
            >
              All Absent
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center space-x-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Attendance Sheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Attendance Register: {currentSubject?.code} &bull; {selectedDate}
          </h3>
          <span className="text-xs text-slate-500">
            Showing {filteredStudents.length} of {students.length} Students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">Student Name & Roll No</th>
                <th className="py-3 px-4">Overall Standing</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Remarks / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const currentStatus = attendanceMap[student.id]?.status || 'PRESENT';
                const remarks = attendanceMap[student.id]?.remarks || '';

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      currentStatus === 'ABSENT'
                        ? 'bg-rose-50/30'
                        : currentStatus === 'LATE'
                        ? 'bg-amber-50/30'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {student.rollNumber} &bull; Sec {student.section}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-bold ${
                            student.attendancePercentage >= 80
                              ? 'text-emerald-600'
                              : student.attendancePercentage >= 75
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {student.attendancePercentage}%
                        </span>
                        {student.riskStatus === 'AT_RISK' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700">
                            At Risk
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'PRESENT')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'ABSENT')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                            currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          <XSquare className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'LATE')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                            currentStatus === 'LATE'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Late</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'EXCUSED')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                            currentStatus === 'EXCUSED'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Excused</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Optional remarks (e.g. sick leave)"
                        value={remarks}
                        onChange={e => handleRemarksChange(student.id, e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer save banner */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Ensure all roll calls are verified before submitting. Changes reflect in real-time.
          </span>
          <button
            onClick={handleSave}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Confirm & Record Attendance</span>
          </button>
        </div>
      </div>

    </div>
  );
};
