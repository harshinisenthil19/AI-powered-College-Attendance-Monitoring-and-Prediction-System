import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  BookOpen
} from 'lucide-react';
import { generateStudentPrediction } from '../../utils/aiPredictionEngine';

export const StudentDashboard: React.FC = () => {
  const { currentUser, students, subjects, attendanceRecords, setActiveTab } = useApp();

  // Find the student corresponding to currentUser (or default to Arjun Sharma std-1)
  const currentStudent =
    students.find(s => s.id === currentUser?.studentId) ||
    students.find(s => s.id === 'std-1') ||
    students[0];

  const studentRecords = attendanceRecords.filter(r => r.studentId === currentStudent.id);

  // Run AI prediction model for this student
  const prediction = generateStudentPrediction(currentStudent, studentRecords, subjects, 60);

  const isLowAttendance = currentStudent.attendancePercentage < 75;
  const isWarningZone = currentStudent.attendancePercentage >= 75 && currentStudent.attendancePercentage < 80;

  return (
    <div className="space-y-6" id="student-dashboard">
      
      {/* Student Profile Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-2xl">
              {currentStudent.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {currentStudent.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Roll: {currentStudent.rollNumber}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {currentStudent.department} &bull; Year {currentStudent.year}, Semester {currentStudent.semester} (Section {currentStudent.section})
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Institutional Email: {currentStudent.email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                currentStudent.riskStatus === 'AT_RISK'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : currentStudent.riskStatus === 'WARNING'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {currentStudent.riskStatus === 'AT_RISK' && <AlertTriangle className="w-4 h-4" />}
              {currentStudent.riskStatus === 'WARNING' && <Clock className="w-4 h-4" />}
              {currentStudent.riskStatus === 'GOOD' && <CheckCircle className="w-4 h-4" />}
              <span>Status: {currentStudent.riskStatus.replace('_', ' ')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Critical Low Attendance Warning Notification Banner */}
      {isLowAttendance && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-5 rounded-r-2xl shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-rose-900">
                  Critical Warning: Attendance Below Mandatory University 75% Cutoff
                </h3>
                <span className="text-xs font-semibold text-rose-700 bg-rose-200/60 px-2 py-0.5 rounded">
                  Debarment Risk
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                Your current aggregate attendance is <strong>{currentStudent.attendancePercentage}%</strong>. According to academic regulations, students with attendance below 75% will be detained from appearing in end-semester final examinations.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center text-xs font-bold text-rose-950 bg-rose-100 px-3 py-1 rounded-lg border border-rose-200">
                  &bull; AI Prescription: Attend next {prediction.requiredClassesTo75} consecutive classes to restore eligibility
                </span>
                <button
                  onClick={() => setActiveTab('ai-prediction')}
                  className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline flex items-center space-x-1"
                >
                  <span>Open AI Attendance Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Zone Notification (75% - 80%) */}
      {isWarningZone && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl shadow-xs">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900">
                Attendance Alert: Caution Margin ({currentStudent.attendancePercentage}%)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                You are hovering right on the 75% edge. You can only safely afford <strong>{prediction.maxCanAffordToMiss}</strong> more absence before dropping below the required cutoff.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Percentage Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Overall Attendance</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span
                className={`text-3xl font-extrabold ${
                  currentStudent.attendancePercentage >= 80
                    ? 'text-emerald-600'
                    : currentStudent.attendancePercentage >= 75
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {currentStudent.attendancePercentage}%
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                Req. Threshold: 75.0%
              </div>
            </div>
            
            {/* Progress Bar / Ring */}
            <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-xs border-slate-100 relative">
              <div
                className={`absolute inset-0 rounded-full border-4 ${
                  currentStudent.attendancePercentage >= 80
                    ? 'border-emerald-500'
                    : currentStudent.attendancePercentage >= 75
                    ? 'border-amber-500'
                    : 'border-rose-500'
                }`}
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% ${currentStudent.attendancePercentage}%, 0 ${currentStudent.attendancePercentage}%)`
                }}
              />
              <span className="text-[11px] font-bold text-slate-700">
                {Math.round(currentStudent.attendancePercentage)}%
              </span>
            </div>
          </div>
        </div>

        {/* Total Classes Conducted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Classes Attended / Held</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">
              {currentStudent.totalClassesAttended}{' '}
              <span className="text-lg font-medium text-slate-400">
                / {currentStudent.totalClassesHeld}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Missed: {currentStudent.totalClassesHeld - currentStudent.totalClassesAttended} sessions
            </div>
          </div>
        </div>

        {/* AI Momentum & Projected Final */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>AI Projected Final</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-extrabold text-purple-700">
                {prediction.predictedFinalPct}%
              </div>
              <div className="flex items-center space-x-1 text-[11px] font-medium mt-1">
                {prediction.recentTrend === 'IMPROVING' ? (
                  <span className="text-emerald-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> Trend: Improving (+{prediction.trendSlope}%)
                  </span>
                ) : prediction.recentTrend === 'DECLINING' ? (
                  <span className="text-rose-600 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" /> Trend: Declining ({prediction.trendSlope}%)
                  </span>
                ) : (
                  <span className="text-slate-500">Trend: Stable</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptive Remediation */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-700 text-xs font-semibold uppercase tracking-wider">
            <span>Remediation Advice</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-4">
            {prediction.requiredClassesTo75 > 0 ? (
              <div>
                <div className="text-2xl font-extrabold text-indigo-950">
                  Attend {prediction.requiredClassesTo75} Classes
                </div>
                <div className="text-[11px] text-indigo-700 mt-1 font-medium">
                  To achieve safe 75% cutoff threshold
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-extrabold text-emerald-700">
                  {prediction.maxCanAffordToMiss} Safe Skips
                </div>
                <div className="text-[11px] text-emerald-800 mt-1 font-medium">
                  Can miss without falling below 75%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Prediction Insight Box */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-indigo-950">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                AI Attendance Forecasting Engine Analysis
              </h3>
              <span className="text-[11px] bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-400/30">
                Linear Momentum Regression
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {prediction.aiExplanation}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 pt-3 border-t border-slate-700/60 text-xs text-slate-300">
              <div>
                <span className="text-slate-400">Total Semester Classes:</span>{' '}
                <strong className="text-white">60</strong>
              </div>
              <div>
                <span className="text-slate-400">Classes Completed:</span>{' '}
                <strong className="text-white">{prediction.totalHeld}</strong>
              </div>
              <div>
                <span className="text-slate-400">Upcoming Remaining:</span>{' '}
                <strong className="text-white">{prediction.remainingClasses}</strong>
              </div>
              <div>
                <span className="text-slate-400">To Reach 85% Honors:</span>{' '}
                <strong className="text-white">{prediction.requiredClassesTo85} classes</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Subject-Wise Attendance Breakdown
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {subjects.length} Enrolled Courses
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {prediction.subjectPredictions.map(sub => {
            const subjectData = subjects.find(s => s.id === sub.subjectId);
            const subRecords = studentRecords.filter(r => r.subjectId === sub.subjectId);
            const attendedCount = subRecords.filter(r => r.status === 'PRESENT' || r.status === 'EXCUSED').length;
            const totalCount = subRecords.length;

            return (
              <div key={sub.subjectId} className="p-5 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                        {sub.subjectCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {sub.subjectName}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Faculty: {subjectData?.teacherName} &bull; Credits: {subjectData?.credits} &bull; Planned: {subjectData?.totalPlannedClasses} sessions
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <div className="flex items-baseline space-x-1.5 justify-end">
                        <span
                          className={`text-lg font-extrabold ${
                            sub.currentPct >= 80
                              ? 'text-emerald-600'
                              : sub.currentPct >= 75
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {sub.currentPct}%
                        </span>
                        <span className="text-xs text-slate-400">
                          ({attendedCount}/{totalCount})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        AI Predicted: {sub.predictedPct}%
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        sub.status === 'AT_RISK'
                          ? 'bg-rose-100 text-rose-700'
                          : sub.status === 'WARNING'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {sub.status === 'AT_RISK' ? 'At Risk' : sub.status === 'WARNING' ? 'Warning' : 'Good'}
                    </span>
                  </div>
                </div>

                {/* Subject Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        sub.currentPct >= 80
                          ? 'bg-emerald-500'
                          : sub.currentPct >= 75
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, sub.currentPct)}%` }}
                    />
                  </div>
                  {sub.classesNeededFor75 > 0 && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1.5 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Deficit: Must attend next {sub.classesNeededFor75} classes to hit 75% in this course</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
