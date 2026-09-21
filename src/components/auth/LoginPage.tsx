import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Lock,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, users, switchUser } = useApp();
  const [activeRoleTab, setActiveRoleTab] = useState<'STUDENT' | 'TEACHER'>('TEACHER');
  const [username, setUsername] = useState('dr.sarah');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleRoleTabChange = (role: 'STUDENT' | 'TEACHER') => {
    setActiveRoleTab(role);
    setError('');
    if (role === 'TEACHER') {
      setUsername('dr.sarah');
      setPassword('faculty@2026');
    } else {
      setUsername('arjun.sharma');
      setPassword('student@2026');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username or institutional email');
      return;
    }
    const success = login(username, password);
    if (!success) {
      setError('Invalid credentials. Check the quick demo accounts below.');
    }
  };

  const handleQuickDemoLogin = (targetUsername: string) => {
    const user = users.find(u => u.username === targetUsername);
    if (user) {
      switchUser(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30 mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Apex Institute of Technology
        </h2>
        <p className="mt-2 text-sm text-slate-300 font-medium">
          AI-Based College Attendance Monitoring & Prediction System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-slate-100">
          
          {/* Role selection tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => handleRoleTabChange('TEACHER')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
                activeRoleTab === 'TEACHER'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Teacher / Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('STUDENT')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
                activeRoleTab === 'STUDENT'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Student Portal</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Institutional ID / Username
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                  placeholder={activeRoleTab === 'TEACHER' ? 'e.g. dr.sarah' : 'e.g. arjun.sharma'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                  required
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[11px] text-slate-400">Spring Security JWT Protected</span>
                <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer">
                  Forgot credentials?
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <span>Sign In to Portal</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>One-Click Instant Demo Evaluation</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('dr.sarah')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-700">
                    Dr. Sarah Jenkins (Faculty / HOD)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Full teacher powers: mark daily attendance, add students, run AI forecasts
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                  Login &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('arjun.sharma')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-rose-200 bg-rose-50/30 hover:border-rose-300 hover:bg-rose-50 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-rose-700 flex items-center space-x-1.5">
                    <span>Arjun Sharma (Student - At Risk: 68.5%)</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700">
                      Alert Active
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Test student dashboard with low attendance warning & AI remediation advice
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-rose-600 group-hover:translate-x-0.5 transition-transform">
                  Login &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('priya.patel')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700">
                    Priya Patel (Student - Good Standing: 94.3%)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    High performer: safe margin calculations, perfect attendance subjects
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                  Login &rarr;
                </span>
              </button>
            </div>

            <div className="mt-4 flex items-start space-x-2 text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Simulates Spring Boot JWT authentication against MySQL users table with BCrypt hashed credentials.
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
