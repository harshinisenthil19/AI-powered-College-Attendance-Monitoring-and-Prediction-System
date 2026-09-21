import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import {
  BookOpen,
  Plus,
  Edit2,
  Calendar,
  CheckCircle2,
  X,
  Award
} from 'lucide-react';

export const SubjectManagement: React.FC = () => {
  const { subjects, addSubject, updateSubject } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [toast, setToast] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: 'Computer Science & Engineering',
    semester: 5,
    credits: 4,
    teacherId: 'FAC-CS-01',
    teacherName: 'Dr. Sarah Jenkins',
    totalPlannedClasses: 36
  });

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormData({
      code: '',
      name: '',
      department: 'Computer Science & Engineering',
      semester: 5,
      credits: 4,
      teacherId: 'FAC-CS-01',
      teacherName: 'Dr. Sarah Jenkins',
      totalPlannedClasses: 36
    });
    setShowModal(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      department: subject.department,
      semester: subject.semester,
      credits: subject.credits,
      teacherId: subject.teacherId,
      teacherName: subject.teacherName,
      totalPlannedClasses: subject.totalPlannedClasses
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      alert('Course Code and Title are required.');
      return;
    }

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        code: formData.code,
        name: formData.name,
        department: formData.department,
        semester: Number(formData.semester),
        credits: Number(formData.credits),
        teacherId: formData.teacherId,
        teacherName: formData.teacherName,
        totalPlannedClasses: Number(formData.totalPlannedClasses)
      });
      setToast(`Course ${formData.code} details successfully updated.`);
    } else {
      addSubject({
        code: formData.code,
        name: formData.name,
        department: formData.department,
        semester: Number(formData.semester),
        credits: Number(formData.credits),
        teacherId: formData.teacherId,
        teacherName: formData.teacherName,
        totalPlannedClasses: Number(formData.totalPlannedClasses)
      });
      setToast(`New Course ${formData.code} (${formData.name}) registered.`);
    }

    setShowModal(false);
    setTimeout(() => setToast(''), 4000);
  };

  return (
    <div className="space-y-6" id="subject-management-view">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Curriculum & Subject Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure course offerings, faculty instructors, planned syllabus contact sessions, and attendance quotas.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center space-x-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map(subject => {
          const completionRate = subject.totalPlannedClasses > 0
            ? Math.round((subject.conductedClasses / subject.totalPlannedClasses) * 100)
            : 0;

          return (
            <div
              key={subject.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                    {subject.code}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="flex items-center space-x-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      <Award className="w-3 h-3 text-amber-500" />
                      <span>{subject.credits} Credits</span>
                    </span>
                    <button
                      onClick={() => handleOpenEdit(subject)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">
                  {subject.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Instructor: <strong>{subject.teacherName}</strong>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {subject.department} &bull; Semester {subject.semester}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Conducted Sessions</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {subject.conductedClasses} / {subject.totalPlannedClasses} ({completionRate}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, completionRate)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingSubject ? 'Edit Course Details' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS506"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={formData.credits}
                    onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Subject Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Computing & Microservices"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Faculty Instructor
                </label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Planned Sessions
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={80}
                    value={formData.totalPlannedClasses}
                    onChange={e =>
                      setFormData({ ...formData, totalPlannedClasses: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
