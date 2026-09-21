import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarCheck,
  Users,
  BookOpen,
  Sparkles,
  BarChart3,
  FileCode2,
  AlertOctagon,
  ShieldCheck
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  highlight?: boolean;
  codeBadge?: boolean;
}

export interface SidebarProps {
  activeView?: string;
  onNavigate?: (view: string) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  mobileOpen,
  setMobileOpen
}) => {
  const { currentUser, activeTab, setActiveTab, students, alerts } = useApp();

  const isTeacherOrAdmin = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN';

  const teacherNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { id: 'mark-attendance', label: 'Mark Daily Attendance', icon: CheckSquare },
    { id: 'edit-attendance', label: 'Edit Past Records', icon: CalendarCheck },
    { id: 'student-management', label: 'Student Management', icon: Users, badge: students.length },
    { id: 'subject-management', label: 'Subjects & Curriculum', icon: BookOpen },
    { id: 'ai-prediction', label: 'AI Risk Predictor', icon: Sparkles, highlight: true },
    { id: 'reports', label: 'Attendance Reports', icon: BarChart3 },
    { id: 'spring-boot-architecture', label: 'Spring Boot & MySQL', icon: FileCode2, codeBadge: true },
  ];

  const studentNavItems: NavItem[] = [
    { id: 'dashboard', label: 'My Attendance', icon: LayoutDashboard },
    { id: 'ai-prediction', label: 'AI Risk & Simulator', icon: Sparkles, highlight: true },
    { id: 'reports', label: 'Attendance History', icon: BarChart3 },
    { id: 'spring-boot-architecture', label: 'Spring Boot Backend', icon: FileCode2, codeBadge: true },
  ];

  const navItems = isTeacherOrAdmin ? teacherNavItems : studentNavItems;
  const currentViewId = activeView || activeTab;

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onNavigate?.(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  const highRiskCount = students.filter(s => s.riskStatus === 'AT_RISK').length;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:static top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out border-r border-slate-800 lg:translate-x-0 rounded-2xl lg:h-[calc(100vh-7rem)] shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          
          {/* User Badge Profile Preview */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs text-white truncate">
                  {currentUser?.fullName}
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      currentUser?.role === 'TEACHER'
                        ? 'bg-blue-400'
                        : currentUser?.role === 'ADMIN'
                        ? 'bg-purple-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {currentUser?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider px-3 mb-2">
              Main Menu
            </div>

            {navItems.map(item => {
              const isActive = currentViewId === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-indigo-400'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.codeBadge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Java
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Bottom Institutional Status Box */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          {isTeacherOrAdmin && highRiskCount > 0 && (
            <div
              onClick={() => handleSelect('ai-prediction')}
              className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 cursor-pointer hover:bg-rose-950/60 transition-colors"
            >
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>{highRiskCount} Students at Risk</span>
              </div>
              <p className="text-[10px] text-rose-300/80 mt-1">
                Attendance below 75% threshold. Click to review.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-300 px-2">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security RBAC Active</span>
            </div>
            <span className="text-[10px] text-slate-300 font-mono">v1.0</span>
          </div>
        </div>

      </aside>
    </>
  );
};
