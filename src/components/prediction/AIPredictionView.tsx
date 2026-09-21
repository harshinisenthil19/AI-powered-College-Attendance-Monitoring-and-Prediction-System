import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  generateStudentPrediction,
  simulateAttendanceOutcome
} from '../../utils/aiPredictionEngine';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Search,
  Activity
} from 'lucide-react';

export const AIPredictionView: React.FC = () => {
  const { students, subjects, attendanceRecords, currentUser } = useApp();

  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'ALL' | 'AT_RISK' | 'WARNING' | 'GOOD'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Default simulated student: if current user is student, use their id; otherwise std-1 (Arjun Sharma)
  const defaultStudentId =
    currentUser?.role === 'STUDENT' && currentUser.studentId
      ? currentUser.studentId
      : 'std-1';

  const [simStudentId, setSimStudentId] = useState(defaultStudentId);
  const [simFutureAttend, setSimFutureAttend] = useState(10);
  const [simFutureMiss, setSimFutureMiss] = useState(2);

  // Generate predictions for all students
  const allPredictions = students.map(student => {
    const studentRecords = attendanceRecords.filter(r => r.studentId === student.id);
    return generateStudentPrediction(student, studentRecords, subjects, 60);
  });

  const filteredPredictions = allPredictions.filter(p => {
    const matchesFilter = selectedRiskFilter === 'ALL' || p.riskStatus === selectedRiskFilter;
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Selected student for simulation
  const simStudent = students.find(s => s.id === simStudentId) || students[0];
  const simRecords = attendanceRecords.filter(r => r.studentId === simStudent?.id);
  const simPrediction = generateStudentPrediction(simStudent, simRecords, subjects, 60);

  const simulationResult = simulateAttendanceOutcome(
    simStudent.totalClassesAttended,
    simStudent.totalClassesHeld,
    simFutureAttend,
    simFutureMiss
  );

  const atRiskCount = allPredictions.filter(p => p.riskStatus === 'AT_RISK').length;
  const warningCount = allPredictions.filter(p => p.riskStatus === 'WARNING').length;
  const goodCount = allPredictions.filter(p => p.riskStatus === 'GOOD').length;

  return (
    <div className="space-y-6" id="ai-prediction-view">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-purple-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold mb-2 border border-purple-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Machine Learning & Linear Velocity Prediction Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              AI Attendance Risk & Remediation Analytics
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 mt-1 max-w-2xl">
              Analyzes historical attendance records, computes sliding-window momentum regression, predicts final semester standing, and prescribes exact compensatory attendance requirements.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-black/20 p-3 rounded-xl border border-white/10 shrink-0">
            <div>
              <div className="text-slate-400">At Risk (&lt;75%)</div>
              <div className="text-lg font-bold text-rose-400">{atRiskCount} students</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-slate-400">Warning (75-80%)</div>
              <div className="text-lg font-bold text-amber-400">{warningCount} students</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-slate-400">Good Standing</div>
              <div className="text-lg font-bold text-emerald-400">{goodCount} students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive AI Attendance Simulator */}
      <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Interactive Attendance &quot;What-If&quot; Simulator
              </h2>
              <p className="text-xs text-slate-500">
                Model hypothetical upcoming class attendance and observe real-time projected outcomes
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Real-Time Model
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Column */}
          <div className="space-y-4 lg:border-r lg:border-slate-100 lg:pr-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Target Student
              </label>
              <select
                value={simStudentId}
                onChange={e => setSimStudentId(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNumber}) &bull; Current: {s.attendancePercentage}% ({s.riskStatus})
                  </option>
                ))}
              </select>
            </div>

            {/* Slider: Classes Attended */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-700">
                  Hypothetical Upcoming Attended:
                </span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  +{simFutureAttend} Classes
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                value={simFutureAttend}
                onChange={e => setSimFutureAttend(Number(e.target.value))}
                className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Slider: Classes Missed */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-rose-700">
                  Hypothetical Upcoming Missed:
                </span>
                <span className="font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
                  +{simFutureMiss} Absences
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                value={simFutureMiss}
                onChange={e => setSimFutureMiss(Number(e.target.value))}
                className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed">
              <strong>Base Stats:</strong> {simStudent.name} has attended {simStudent.totalClassesAttended} of {simStudent.totalClassesHeld} classes held to date.
            </div>
          </div>

          {/* Outcome Metric Column */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Current Standing */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Current Actual
                </div>
                <div
                  className={`text-2xl font-extrabold mt-1 ${
                    simStudent.attendancePercentage >= 80
                      ? 'text-emerald-600'
                      : simStudent.attendancePercentage >= 75
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {simStudent.attendancePercentage}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {simStudent.totalClassesAttended}/{simStudent.totalClassesHeld} Classes
                </div>
              </div>

              {/* Simulated Final */}
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                  Simulated Outcome
                </div>
                <div
                  className={`text-2xl font-extrabold mt-1 ${
                    simulationResult.projectedPercentage >= 80
                      ? 'text-emerald-600'
                      : simulationResult.projectedPercentage >= 75
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {simulationResult.projectedPercentage}%
                </div>
                <div className="text-[10px] font-semibold text-indigo-600 mt-0.5">
                  Delta: {simulationResult.deltaPct >= 0 ? '+' : ''}{simulationResult.deltaPct}%
                </div>
              </div>

              {/* Resulting Status */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col justify-center">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Resulting Standing
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      simulationResult.projectedStatus === 'AT_RISK'
                        ? 'bg-rose-100 text-rose-700'
                        : simulationResult.projectedStatus === 'WARNING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {simulationResult.projectedStatus.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {simulationResult.projectedPercentage >= 75
                    ? 'Eligible for Finals'
                    : 'Debarment Risk Active'}
                </div>
              </div>

            </div>

            {/* Prescriptive Remediation Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                  AI Prescriptive Recommendation for {simStudent.name}
                </div>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  {simPrediction.aiExplanation}
                </p>
                {simPrediction.requiredClassesTo75 > 0 ? (
                  <div className="mt-2 text-xs font-bold text-amber-300">
                    &bull; Immediate Target: Must attend next {simPrediction.requiredClassesTo75} consecutive sessions without unexcused gaps.
                  </div>
                ) : (
                  <div className="mt-2 text-xs font-bold text-emerald-300">
                    &bull; Safe Margin: Can afford at most {simPrediction.maxCanAffordToMiss} absences while remaining above the 75% cutoff.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Student AI Predictions Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Automated AI Attendance Risk Forecast Roster
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Predicted final standing based on historical attendance trend slope and prescriptive remedial actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student..."
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
              <button
                onClick={() => setSelectedRiskFilter('ALL')}
                className={`px-2.5 py-1 rounded-md ${
                  selectedRiskFilter === 'ALL' ? 'bg-white shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedRiskFilter('AT_RISK')}
                className={`px-2.5 py-1 rounded-md ${
                  selectedRiskFilter === 'AT_RISK' ? 'bg-rose-600 text-white font-bold' : 'text-rose-700'
                }`}
              >
                At Risk
              </button>
              <button
                onClick={() => setSelectedRiskFilter('WARNING')}
                className={`px-2.5 py-1 rounded-md ${
                  selectedRiskFilter === 'WARNING' ? 'bg-amber-500 text-white font-bold' : 'text-amber-700'
                }`}
              >
                Warning
              </button>
              <button
                onClick={() => setSelectedRiskFilter('GOOD')}
                className={`px-2.5 py-1 rounded-md ${
                  selectedRiskFilter === 'GOOD' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-700'
                }`}
              >
                Good
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Current Rate</th>
                <th className="py-3 px-4">Momentum Trend</th>
                <th className="py-3 px-4">AI Forecast</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Remediation Prescription</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPredictions.map(pred => (
                <tr key={pred.studentId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{pred.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{pred.rollNumber}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900">{pred.currentAttendancePct}%</span>
                    <span className="text-[10px] text-slate-400 block">
                      {pred.totalAttended}/{pred.totalHeld} classes
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {pred.recentTrend === 'IMPROVING' ? (
                      <span className="inline-flex items-center text-emerald-600 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5 mr-1" /> +{pred.trendSlope}%
                      </span>
                    ) : pred.recentTrend === 'DECLINING' ? (
                      <span className="inline-flex items-center text-rose-600 font-semibold">
                        <TrendingDown className="w-3.5 h-3.5 mr-1" /> {pred.trendSlope}%
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Stable</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-sm text-purple-700">
                      {pred.predictedFinalPct}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Est. end semester
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        pred.riskStatus === 'AT_RISK'
                          ? 'bg-rose-100 text-rose-700'
                          : pred.riskStatus === 'WARNING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {pred.riskStatus === 'AT_RISK'
                        ? 'At Risk'
                        : pred.riskStatus === 'WARNING'
                        ? 'Warning'
                        : 'Good'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {pred.requiredClassesTo75 > 0 ? (
                      <span className="text-rose-700 font-bold bg-rose-50 px-2 py-1 rounded text-[11px] block">
                        Must attend next {pred.requiredClassesTo75} classes
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium text-[11px]">
                        Can afford {pred.maxCanAffordToMiss} absences
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSimStudentId(pred.studentId);
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs inline-flex items-center"
                    >
                      <span>Simulate</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Methodology Box */}
      <div className="p-5 bg-slate-100/80 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-slate-800 text-sm">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>About the AI & Statistical Prediction Architecture</span>
        </div>
        <p className="leading-relaxed">
          The system implements a <strong>Dual-Layer Attendance Analytics Architecture</strong>:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li>
            <strong>Layer 1 (Direct Calculation):</strong> Standard deterministic formula calculating total held sessions versus present/excused attendance.
          </li>
          <li>
            <strong>Layer 2 (Predictive Machine Learning Engine):</strong> Isolates attendance velocity by analyzing rolling sliding-window momentum regression. If student attendance shows acceleration or deceleration across recent weeks, future projected sessions are weighted accordingly.
          </li>
          <li>
            <strong>Prescriptive Remediation Optimizer:</strong> Solves the inequality $(A + x) / (H + x) \ge 0.75$ to provide mathematically guaranteed minimum classes required to recover exam clearance.
          </li>
        </ul>
      </div>

    </div>
  );
};
