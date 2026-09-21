import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { MarkAttendance } from './components/attendance/MarkAttendance';
import { EditAttendance } from './components/attendance/EditAttendance';
import { StudentManagement } from './components/students/StudentManagement';
import { SubjectManagement } from './components/subjects/SubjectManagement';
import { AIPredictionView } from './components/prediction/AIPredictionView';
import { ReportsView } from './components/reports/ReportsView';
import { SpringBootCodeExplorer } from './components/code-explorer/SpringBootCodeExplorer';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [activeView, setActiveView] = useState<string>('dashboard');

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return currentUser.role === 'STUDENT' ? (
          <StudentDashboard />
        ) : (
          <TeacherDashboard onNavigate={(view) => setActiveView(view)} />
        );
      case 'mark-attendance':
        return <MarkAttendance />;
      case 'edit-attendance':
        return <EditAttendance />;
      case 'student-management':
        return <StudentManagement />;
      case 'subject-management':
        return <SubjectManagement />;
      case 'ai-prediction':
        return <AIPredictionView />;
      case 'reports':
        return <ReportsView />;
      case 'spring-boot-architecture':
        return <SpringBootCodeExplorer />;
      default:
        return currentUser.role === 'STUDENT' ? (
          <StudentDashboard />
        ) : (
          <TeacherDashboard onNavigate={(view) => setActiveView(view)} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Navbar onNavigate={setActiveView} activeView={activeView} />

      <div className="flex-1 flex w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />

        <main className="flex-1 min-w-0 pb-12" id="main-content-area">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Academic Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">
              Apex Institute of Technology &bull; Academic Portal
            </span>
            <span>&bull;</span>
            <span>Attendance Risk Prediction v2.4</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveView('spring-boot-architecture')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Backend Java / MySQL Spec
            </button>
            <span>&bull;</span>
            <span className="text-slate-400">Spring Boot 3 + React + MySQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
