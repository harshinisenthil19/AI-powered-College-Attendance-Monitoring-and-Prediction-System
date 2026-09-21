import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  BookOpen,
  Edit3
} from 'lucide-react';

export const EditAttendance: React.FC = () => {
  const { attendanceRecords, updateSingleAttendance, subjects } = useApp();

  const [filterSubjectId, setFilterSubjectId] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  const handleStatusChange = (recordId: string, newStatus: AttendanceStatus, studentName: string) => {
    updateSingleAttendance(recordId, newStatus);
    setToastMessage(`Record updated: ${studentName} marked as ${newStatus}.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRemarksChange = (recordId: string, remarks: string, currentStatus: AttendanceStatus) => {
    updateSingleAttendance(recordId, currentStatus, remarks);
  };

  // Filter records
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSubject = filterSubjectId === 'ALL' || record.subjectId === filterSubjectId;
    const matchesStatus = filterStatus === 'ALL' || record.status === filterStatus;
    const matchesDate = !filterDate || record.date === filterDate;
    const matchesStudent =
      !searchStudent ||
      record.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      record.rollNumber.toLowerCase().includes(searchStudent.toLowerCase());

    return matchesSubject && matchesStatus && matchesDate && matchesStudent;
  });

  // Sort descending by date
  const sortedRecords = [...filteredRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6" id="edit-attendance-view">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <CalendarCheck className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Edit & Audit Past Attendance Records
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Search historical roll call logs, rectify erroneous absences, record medical exemptions, and audit audit trails.
            </p>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Specific Date</span>
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:ring-1 focus:ring-indigo-500"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-[10px] text-indigo-600 hover:underline mt-0.5"
              >
                Clear date filter
              </button>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <BookOpen className="w-3 h-3 text-slate-400" />
              <span>Course / Subject</span>
            </label>
            <select
              value={filterSubjectId}
              onChange={e => setFilterSubjectId(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Status Filter</span>
            </label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present Only</option>
              <option value="ABSENT">Absent Only</option>
              <option value="LATE">Late Only</option>
              <option value="EXCUSED">Excused / Medical</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Search className="w-3 h-3 text-slate-400" />
              <span>Search Student</span>
            </label>
            <input
              type="text"
              placeholder="Name or roll number..."
              value={searchStudent}
              onChange={e => setSearchStudent(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center space-x-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Historical Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Historical Attendance Logs ({sortedRecords.length} records matching)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Total database records: {attendanceRecords.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Student & Roll No</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Quick Modify Status</th>
                <th className="py-3 px-4">Remarks / Condonation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No attendance records found matching your filters.
                  </td>
                </tr>
              ) : (
                sortedRecords.slice(0, 50).map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {record.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">
                        {record.subjectCode}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                        {record.subjectName}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{record.studentName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{record.rollNumber}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          record.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : record.status === 'ABSENT'
                            ? 'bg-rose-100 text-rose-800'
                            : record.status === 'LATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStatusChange(record.id, 'PRESENT', record.studentName)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold ${
                            record.status === 'PRESENT'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                          }`}
                        >
                          P
                        </button>
                        <button
                          onClick={() => handleStatusChange(record.id, 'ABSENT', record.studentName)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold ${
                            record.status === 'ABSENT'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                          }`}
                        >
                          A
                        </button>
                        <button
                          onClick={() => handleStatusChange(record.id, 'LATE', record.studentName)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold ${
                            record.status === 'LATE'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
                          }`}
                        >
                          L
                        </button>
                        <button
                          onClick={() => handleStatusChange(record.id, 'EXCUSED', record.studentName)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold ${
                            record.status === 'EXCUSED'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-blue-50'
                          }`}
                        >
                          Ex
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        defaultValue={record.remarks || ''}
                        onBlur={e => handleRemarksChange(record.id, e.target.value, record.status)}
                        placeholder="Add revision note..."
                        className="text-xs px-2 py-1 border border-slate-200 rounded-md text-slate-700 w-44 focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {sortedRecords.length > 50 && (
          <div className="p-3 bg-slate-50 text-center text-xs text-slate-500 border-t border-slate-100">
            Showing first 50 results. Use the date or subject filter above to narrow down queries.
          </div>
        )}
      </div>

    </div>
  );
};
