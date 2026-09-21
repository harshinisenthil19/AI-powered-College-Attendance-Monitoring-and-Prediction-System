import React, { useState } from 'react';
import {
  FileCode,
  Database,
  Terminal,
  Copy,
  Check,
  FolderTree,
  Server,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SPRING_BOOT_CODE_FILES, MYSQL_SCHEMA_SQL, REST_API_SPECS, SETUP_INSTRUCTIONS } from './codeFilesData';

export const SpringBootCodeExplorer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'CODE' | 'SCHEMA' | 'APIS' | 'SETUP' | 'TREE'>('CODE');
  const [selectedFileKey, setSelectedFileKey] = useState<string>('PredictionService.java');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const selectedFile = SPRING_BOOT_CODE_FILES.find(f => f.filename === selectedFileKey) || SPRING_BOOT_CODE_FILES[0];

  return (
    <div className="space-y-6" id="code-explorer-view">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Server className="w-3.5 h-3.5" />
              <span>Production Java Spring Boot 3 + MySQL + Hibernate Architecture</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Backend Architecture & Code Specification
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Complete folder structure, MySQL schema & queries, Java JPA entities, AI prediction service, REST API controllers, and run commands.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setActiveSection('CODE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeSection === 'CODE' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Java Source Files
            </button>
            <button
              onClick={() => setActiveSection('SCHEMA')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeSection === 'SCHEMA' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              MySQL Schema & DDL
            </button>
            <button
              onClick={() => setActiveSection('APIS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeSection === 'APIS' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              REST Endpoints
            </button>
            <button
              onClick={() => setActiveSection('SETUP')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeSection === 'SETUP' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Setup & Run Guide
            </button>
            <button
              onClick={() => setActiveSection('TREE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeSection === 'TREE' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Directory Tree
            </button>
          </div>
        </div>
      </div>

      {/* 1. JAVA SOURCE CODE VIEWER */}
      {activeSection === 'CODE' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Selector Sidebar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Java Spring Boot Files</span>
            </div>

            <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
              {SPRING_BOOT_CODE_FILES.map(file => (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFileKey(file.filename)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                    selectedFileKey === file.filename
                      ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate">
                    <div className="truncate font-mono">{file.filename}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{file.category}</div>
                  </div>
                  {file.filename === 'PredictionService.java' && (
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* File Code Display */}
          <div className="lg:col-span-3 bg-slate-900 rounded-2xl shadow-md border border-slate-800 overflow-hidden flex flex-col">
            <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-200">
                  {selectedFile.path}
                </span>
                <span className="text-[11px] text-slate-400 ml-2">
                  ({selectedFile.description})
                </span>
              </div>

              <button
                onClick={() => handleCopy(selectedFile.content, selectedFile.filename)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
              >
                {copiedKey === selectedFile.filename ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-5 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-[600px] overflow-y-auto">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 2. MYSQL SCHEMA & QUERIES */}
      {activeSection === 'SCHEMA' && (
        <div className="bg-slate-900 rounded-2xl shadow-md border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  MySQL Database Schema (schema.sql) & DDL Queries
                </h3>
                <p className="text-xs text-slate-400">
                  Tables: users, students, teachers, subjects, attendance + indexing & sample seeds
                </p>
              </div>
            </div>

            <button
              onClick={() => handleCopy(MYSQL_SCHEMA_SQL, 'schema')}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
            >
              {copiedKey === 'schema' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied SQL!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Schema</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed max-h-[650px] overflow-y-auto">
            <pre>
              <code>{MYSQL_SCHEMA_SQL}</code>
            </pre>
          </div>
        </div>
      )}

      {/* 3. REST ENDPOINTS SPECIFICATION */}
      {activeSection === 'APIS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Spring Boot REST API Endpoint Documentation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardized RESTful interfaces implemented across Controllers
              </p>
            </div>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
              Base URL: http://localhost:8080/api
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Endpoint URI</th>
                  <th className="py-3 px-4">Role Permission</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Sample Payload / Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {REST_API_SPECS.map((api, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          api.method === 'GET'
                            ? 'bg-blue-100 text-blue-700'
                            : api.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-700'
                            : api.method === 'PUT'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {api.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {api.endpoint}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {api.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{api.description}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                      {api.payload}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SETUP & RUN GUIDE */}
      {activeSection === 'SETUP' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Complete Project Setup, Configuration & Run Commands
              </h2>
            </div>

            <button
              onClick={() => handleCopy(SETUP_INSTRUCTIONS, 'setup')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
            >
              {copiedKey === 'setup' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied Setup Guide!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Run Instructions</span>
                </>
              )}
            </button>
          </div>

          <div className="prose prose-sm max-w-none text-xs text-slate-700 space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span>Step 1: MySQL Database Initialization</span>
              </h4>
              <p className="text-slate-600">
                Ensure MySQL Server is running (or launch via Docker: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">docker run -p 3306:3306 --name mysql-attendance -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=attendance_db -d mysql:8.0</code>).
              </p>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
{`# Connect to MySQL and create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS attendance_db;"

# Import schema and seed initial data
mysql -u root -p attendance_db < schema.sql`}
              </pre>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span>Step 2: Configure & Launch Spring Boot Backend</span>
              </h4>
              <p className="text-slate-600">
                Navigate to backend folder, check <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">src/main/resources/application.properties</code> for database credentials, then compile and start:
              </p>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
{`cd backend-spring-boot
# Build and package with Maven
./mvnw clean install

# Launch Spring Boot REST Server on port 8080
./mvnw spring-boot:run`}
              </pre>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span>Step 3: Launch React.js Frontend</span>
              </h4>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
{`# Install dependencies
npm install

# Start Vite Development Server
npm run dev`}
              </pre>
            </div>

            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2 text-indigo-900">
              <h4 className="font-bold text-indigo-950 text-sm">
                Default Spring Boot Test Credentials
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Teacher / Admin:</strong> Username: <code className="font-mono bg-white px-1 rounded">dr.sarah</code> | Password: <code className="font-mono bg-white px-1 rounded">faculty@2026</code> (Role: TEACHER)</li>
                <li><strong>Student (At Risk):</strong> Username: <code className="font-mono bg-white px-1 rounded">arjun.sharma</code> | Password: <code className="font-mono bg-white px-1 rounded">student@2026</code> (Roll: 23CS101)</li>
                <li><strong>Student (Good):</strong> Username: <code className="font-mono bg-white px-1 rounded">priya.patel</code> | Password: <code className="font-mono bg-white px-1 rounded">student@2026</code> (Roll: 23CS102)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 5. PROJECT DIRECTORY STRUCTURE */}
      {activeSection === 'TREE' && (
        <div className="bg-slate-900 rounded-2xl shadow-md border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderTree className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                Full-Stack Project Directory Architecture
              </h3>
            </div>
          </div>

          <div className="p-6 text-xs font-mono text-indigo-300 leading-relaxed overflow-x-auto">
            <pre>
{`college-attendance-ai-system/
├── backend-spring-boot/                     # Java Spring Boot REST Backend
│   ├── pom.xml                             # Maven Dependencies & Plugins
│   ├── schema.sql                          # MySQL Database DDL & Seed Queries
│   ├── README.md                           # Backend Setup Documentation
│   └── src/
│       ├── main/
│       │   ├── java/com/college/attendance/
│       │   │   ├── AiAttendanceApplication.java    # Spring Boot Entry Point
│       │   │   ├── config/
│       │   │   │   ├── SecurityConfig.java         # Spring Security & JWT Filter Chain
│       │   │   │   └── JwtAuthFilter.java          # JWT Token Verification Filter
│       │   │   ├── controller/
│       │   │   │   ├── AuthController.java         # Login & Registration APIs
│       │   │   │   ├── StudentController.java      # Student CRUD & At-Risk Queries
│       │   │   │   ├── SubjectController.java      # Subject Management APIs
│       │   │   │   ├── AttendanceController.java   # Roll Call Marking & Edit APIs
│       │   │   │   ├── PredictionController.java   # AI Risk Prediction & Simulation APIs
│       │   │   │   └── ReportController.java       # Daily & Monthly Report APIs
│       │   │   ├── dto/
│       │   │   │   ├── LoginRequest.java
│       │   │   │   ├── AttendanceBatchRequest.java
│       │   │   │   └── PredictionResponseDto.java
│       │   │   ├── entity/
│       │   │   │   ├── User.java                   # User Account Entity
│       │   │   │   ├── Role.java                   # Role Enum (STUDENT, TEACHER, ADMIN)
│       │   │   │   ├── Student.java                # Student Profile Entity
│       │   │   │   ├── Teacher.java                # Faculty Entity
│       │   │   │   ├── Subject.java                # Course Curriculum Entity
│       │   │   │   ├── Attendance.java             # Attendance Record Entity
│       │   │   │   └── AttendanceStatus.java       # PRESENT, ABSENT, LATE, EXCUSED
│       │   │   ├── repository/
│       │   │   │   ├── UserRepository.java
│       │   │   │   ├── StudentRepository.java      # Custom @Query for Low Attendance
│       │   │   │   ├── SubjectRepository.java
│       │   │   │   └── AttendanceRepository.java   # Date & Subject Range Aggregations
│       │   │   └── service/
│       │   │       ├── AttendanceService.java      # Transactional Roll Call Service
│       │   │       ├── PredictionService.java      # AI ML Momentum Regression Engine
│       │   │       └── ReportService.java          # Regulatory Reports Generator
│       │   └── resources/
│       │       └── application.properties          # MySQL Connection & Hibernate Config
│       └── test/
│           └── java/com/college/attendance/
│               └── PredictionServiceTest.java      # AI Regression Unit Tests
│
├── frontend-react/                         # React.js SPA Frontend
│   ├── package.json                        # Dependencies (React, Lucide, Recharts, Tailwind)
│   ├── vite.config.ts                      # Vite Configuration
│   ├── index.html                          # HTML5 Entry Point
│   └── src/
│       ├── main.tsx                        # Application Root
│       ├── App.tsx                         # Layout & Master View Router
│       ├── types.ts                        # TypeScript Interfaces & Enums
│       ├── context/
│       │   └── AppContext.tsx              # Reactive State & Persistence Store
│       ├── utils/
│       │   └── aiPredictionEngine.ts       # AI Statistical Regression Engine
│       ├── data/
│       │   └── mockData.ts                 # Realistic Academic Seed Dataset
│       └── components/
│           ├── layout/
│           │   ├── Navbar.tsx              # Institutional Header & Demo Switcher
│           │   └── Sidebar.tsx             # Role-Adaptive Navigation
│           ├── auth/
│           │   └── LoginPage.tsx           # Dual-Role Authentication View
│           ├── dashboard/
│           │   ├── StudentDashboard.tsx    # Student Metrics & Warning Alerts
│           │   └── TeacherDashboard.tsx    # Faculty Overview & At-Risk Priority
│           ├── attendance/
│           │   ├── MarkAttendance.tsx      # Daily Roll Call Sheet
│           │   └── EditAttendance.tsx      # Past Records Auditor
│           ├── students/
│           │   └── StudentManagement.tsx   # Enrolment & Alerts Manager
│           ├── subjects/
│           │   └── SubjectManagement.tsx   # Curriculum & Syllabus Manager
│           ├── prediction/
│           │   └── AIPredictionView.tsx    # AI Predictor & What-If Simulator
│           ├── reports/
│           │   └── ReportsView.tsx         # Recharts Analytics & CSV Export
│           └── code-explorer/
│               └── SpringBootCodeExplorer.tsx # Interactive Architecture Browser`}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
