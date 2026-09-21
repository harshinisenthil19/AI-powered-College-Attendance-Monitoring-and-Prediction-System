import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Search,
  CheckSquare,
  UserPlus,
  BookOpen,
  Send,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface TeacherDashboardProps {
  onNavigate?: (view: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    students,
    subjects,
    attendanceRecords,
    setActiveTab,
    sendLowAttendanceAlert
  } = useApp();

  const handleNavigate = (view: string) => {
    setActiveTab(view);
    onNavigate?.(view);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'AT_RISK' | 'WARNING' | 'GOOD'>('ALL');
  const [alertSentFeedback, setAlertSentFeedback] = useState<string | null>(null);

  // Statistics
  const totalStudents = students.length;
  const atRiskStudents = students.filter(s => s.riskStatus === 'AT_RISK');
  const warningStudents = students.filter(s => s.riskStatus === 'WARNING');
  const goodStudents = students.filter(s => s.riskStatus === 'GOOD');

  const avgAttendance = totalStudents > 0
    ? Math.round(
        (students.reduce((acc, s) => acc + s.attendancePercentage, 0) / totalStudents) * 10
      ) / 10
    : 0;

  // Filtered student list for quick overview
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk = filterRisk === 'ALL' || student.riskStatus === filterRisk;
    return matchesSearch && matchesRisk;
  });

  // Data for subject average chart
  const subjectChartData = subjects.map(sub => {
    const subRecords = attendanceRecords.filter(r => r.subjectId === sub.id);
    const attended = subRecords.filter(r => r.status === 'PRESENT' || r.status === 'EXCUSED').length;
    const total = subRecords.length;
    const rate = total > 0 ? Math.round((attended / total) * 1000) / 10 : 0;
    return {
      name: sub.code,
      fullName: sub.name,
      attendance: rate
    };
  });

  const handleNotifyStudent = (studentId: string, studentName: string) => {
    sendLowAttendanceAlert(studentId);
    setAlertSentFeedback(`Official warning notification dispatched to ${studentName} and registered guardian.`);
    setTimeout(() => setAlertSentFeedback(null), 4000);
  };

  return (
    <div className="space-y-6" id="teacher-dashboard">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
              <span>Department of Computer Science & Engineering</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Spring 2026 Academic Session &bull; Real-time attendance monitoring, AI regression risk engine & automated early alerts.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => handleNavigate('mark-attendance')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Mark Today&apos;s Attendance</span>
            </button>
            <button
              onClick={() => handleNavigate('student-management')}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Manage Students</span>
            </button>
          </div>
        </div>
      </div>

      {alertSentFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center space-x-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{alertSentFeedback}</span>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{totalStudents}</div>
            <div className="text-[11px] text-slate-500 mt-1">CS Dept &bull; Year 3 (Sem 5)</div>
          </div>
        </div>

        {/* Average Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Average Attendance</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{avgAttendance}%</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              Above mandatory 75% institutional baseline
            </div>
          </div>
        </div>

        {/* High Risk Students (< 75%) */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold uppercase tracking-wider">
            <span>Students At Risk (&lt;75%)</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-rose-600">{atRiskStudents.length}</div>
            <div className="text-[11px] text-rose-600 font-medium mt-1">
              Mandatory debarment threshold breached
            </div>
          </div>
        </div>

        {/* Warning Zone Students (75% - 80%) */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold uppercase tracking-wider">
            <span>Warning Zone (75-80%)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-600">{warningStudents.length}</div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">
              High risk of falling below required cutoff
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Subject Attendance Chart + Quick Priority Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Subject-Wise Attendance Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Subject-Wise Attendance Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Aggregated student presence percentage by course
              </p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>Full Analytics</span>
              <BarChart3 className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`${value}% Attendance`, 'Rate']}
                  labelFormatter={(label) => {
                    const found = subjectChartData.find(s => s.name === label);
                    return found ? `${found.name}: ${found.fullName}` : label;
                  }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="attendance" radius={[6, 6, 0, 0]}>
                  {subjectChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.attendance >= 80
                          ? '#10b981'
                          : entry.attendance >= 75
                          ? '#f59e0b'
                          : '#ef4444'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
              <span>&gt;= 80% (Good)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
              <span>75% - 79% (Warning)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
              <span>&lt; 75% (At Risk)</span>
            </span>
          </div>
        </div>

        {/* Quick Quick Actions & Quick Links */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Faculty Quick Navigation
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Common administrative and attendance actions
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleNavigate('mark-attendance')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Mark Daily Attendance</div>
                    <div className="text-[10px] text-slate-500">Record roll calls for today's classes</div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-indigo-600">&rarr;</span>
              </button>

              <button
                onClick={() => handleNavigate('edit-attendance')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Edit Past Attendance</div>
                    <div className="text-[10px] text-slate-500">Modify past logs & medical leaves</div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-indigo-600">&rarr;</span>
              </button>

              <button
                onClick={() => handleNavigate('ai-prediction')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-200 bg-purple-50/30 hover:bg-purple-50 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-purple-950">AI Risk Prediction Module</div>
                    <div className="text-[10px] text-purple-700">Predict final standing & needed classes</div>
                  </div>
                </div>
                <span className="text-purple-600">&rarr;</span>
              </button>

              <button
                onClick={() => handleNavigate('subject-management')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Manage Subjects</div>
                    <div className="text-[10px] text-slate-500">Add course modules & syllabus hours</div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-indigo-600">&rarr;</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
            <strong>Institutional Rule:</strong> Minimum 75% attendance is required under University Regulation 4.2 for exam hall tickets.
          </div>
        </div>

      </div>

      {/* High-Risk Students Early Alert Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Attendance Monitoring & Early Alert Action List
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter students by attendance status, search records, and issue instant warnings.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, roll no..."
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
              <button
                onClick={() => setFilterRisk('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterRisk === 'ALL' ? 'bg-white shadow-xs font-bold text-slate-900' : 'text-slate-600'
                }`}
              >
                All ({students.length})
              </button>
              <button
                onClick={() => setFilterRisk('AT_RISK')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterRisk === 'AT_RISK' ? 'bg-rose-600 text-white font-bold' : 'text-rose-700'
                }`}
              >
                At Risk ({atRiskStudents.length})
              </button>
              <button
                onClick={() => setFilterRisk('WARNING')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterRisk === 'WARNING' ? 'bg-amber-500 text-white font-bold' : 'text-amber-700'
                }`}
              >
                Warning ({warningStudents.length})
              </button>
              <button
                onClick={() => setFilterRisk('GOOD')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterRisk === 'GOOD' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-700'
                }`}
              >
                Good ({goodStudents.length})
              </button>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student & Roll No</th>
                <th className="py-3 px-4">Dept & Sem</th>
                <th className="py-3 px-4">Classes Held / Attended</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Risk Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No students match the selected filter or search term.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500">{student.rollNumber} &bull; {student.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>CSE (Sec {student.section})</div>
                      <div className="text-[10px] text-slate-400">Year {student.year}, Sem {student.semester}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {student.totalClassesAttended} / {student.totalClassesHeld}
                      <span className="text-[10px] text-slate-400 block">
                        Missed: {student.totalClassesHeld - student.totalClassesAttended}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-extrabold text-sm ${
                            student.attendancePercentage >= 80
                              ? 'text-emerald-600'
                              : student.attendancePercentage >= 75
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {student.attendancePercentage}%
                        </span>
                      </div>
                      <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            student.attendancePercentage >= 80
                              ? 'bg-emerald-500'
                              : student.attendancePercentage >= 75
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${student.attendancePercentage}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          student.riskStatus === 'AT_RISK'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : student.riskStatus === 'WARNING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {student.riskStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {student.riskStatus === 'AT_RISK' && (
                          <button
                            onClick={() => handleNotifyStudent(student.id, student.name)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200 transition-colors"
                            title="Dispatch early alert to student & parent"
                          >
                            <Send className="w-3 h-3" />
                            <span>Notify</span>
                          </button>
                        )}
                        <button
                          onClick={() => setActiveTab('ai-prediction')}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px]"
                        >
                          AI Forecast &rarr;
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
