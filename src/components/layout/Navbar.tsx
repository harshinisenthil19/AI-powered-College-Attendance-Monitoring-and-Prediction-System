import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Code2,
  LogOut,
  UserCheck,
  ChevronDown,
  RotateCcw
} from 'lucide-react';

export interface NavbarProps {
  onNavigate?: (view: string) => void;
  activeView?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView }) => {
  const {
    currentUser,
    users,
    switchUser,
    logout,
    alerts,
    acknowledgeAlert,
    activeTab,
    setActiveTab,
    resetToDefaults
  } = useApp();

  const handleNav = (view: string) => {
    setActiveTab(view);
    onNavigate?.(view);
  };

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & College Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-sm font-bold text-lg tracking-wider">
              AI
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                  Apex Institute of Technology
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  AI Attendance Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Attendance Monitoring, Risk Prediction & Spring Boot REST Services
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Spring Boot Code Explorer Button */}
            <button
              id="btn-code-explorer-nav"
              onClick={() => handleNav('spring-boot-architecture')}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                activeView === 'spring-boot-architecture' || activeTab === 'code-explorer'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
              title="View Java Spring Boot Backend Code, MySQL Schema & REST APIs"
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">Spring Boot & MySQL Code</span>
              <span className="sm:hidden">Backend</span>
            </button>

            {/* Notification Alerts Dropdown */}
            <div className="relative">
              <button
                id="btn-alerts-bell"
                onClick={() => {
                  setShowAlertMenu(!showAlertMenu);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden transition-colors"
                title="Low Attendance Warnings"
              >
                <Bell className="w-5 h-5" />
                {unacknowledgedAlerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                  </span>
                )}
              </button>

              {showAlertMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-xs uppercase tracking-wider text-slate-700">
                        Attendance Alerts ({unacknowledgedAlerts.length})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">Under 75% Cutoff</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No active low-attendance alerts.
                      </div>
                    ) : (
                      alerts.slice(0, 6).map(alert => (
                        <div
                          key={alert.id}
                          className={`p-3 text-xs transition-colors ${
                            alert.acknowledged ? 'bg-slate-50/60 opacity-75' : 'bg-rose-50/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-slate-900">
                                  {alert.studentName} ({alert.rollNumber})
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    alert.severity === 'CRITICAL'
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {alert.percentage}%
                                </span>
                              </div>
                              <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                                {alert.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                Issued: {alert.date}
                              </span>
                            </div>
                            {!alert.acknowledged && (
                              <button
                                onClick={() => acknowledgeAlert(alert.id)}
                                className="text-indigo-600 hover:text-indigo-800 p-1"
                                title="Mark as Reviewed"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Demo Switcher Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  id="btn-user-profile-menu"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowAlertMenu(false);
                  }}
                  className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-hidden"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-semibold text-slate-900 leading-tight">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] font-medium text-indigo-600 uppercase tracking-wide">
                      {currentUser.role === 'TEACHER'
                        ? 'Faculty / Instructor'
                        : currentUser.role === 'ADMIN'
                        ? 'Dean / Admin'
                        : 'Enrolled Student'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{currentUser.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Quick Demo Role Switcher
                    </div>

                    <div className="max-h-56 overflow-y-auto px-1 space-y-0.5">
                      {users.map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u);
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                            currentUser.id === u.id
                              ? 'bg-indigo-50 text-indigo-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <img
                            src={u.avatarUrl}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 truncate">
                            <div className="truncate">{u.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {u.role} &bull; {u.username}
                            </div>
                          </div>
                          {currentUser.id === u.id && (
                            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 mt-2 pt-1 px-2 space-y-1">
                      <button
                        onClick={() => {
                          resetToDefaults();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-md"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reset Demo Data</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
