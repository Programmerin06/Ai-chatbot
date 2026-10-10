import React, { useState } from 'react';
import { X, User, Check, Building, GraduationCap, Target } from 'lucide-react';
import { MultiMajorType, StudentProfile } from '../types';
import { SSU_COLLEGES, SSU_DEPARTMENTS } from '../data/ssuData';
import { api } from '../services/api';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSave: (updated: StudentProfile) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [form, setForm] = useState<StudentProfile>({ ...profile });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const saved = await api.updateProfile(form);
      onSave(saved);
      onClose();
    } catch (err: any) {
      alert('프로필 서버 저장 실패: ' + err.message);
      onSave(form);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#003B6F] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">학생 프로필 설정</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">학생 이름</label>
            <input
              type="text"
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">주전공 학과</label>
              <select
                value={form.primaryMajor}
                onChange={(e) => setForm({ ...form, primaryMajor: e.target.value })}
                className="w-full text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-blue-600"
              >
                {SSU_DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">현재 이수 학기</label>
              <select
                value={form.currentSemester}
                onChange={(e) => setForm({ ...form, currentSemester: Number(e.target.value) })}
                className="w-full text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-blue-600"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}학기차
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">목표 희망 진로 / 직무</label>
            <input
              type="text"
              value={form.careerGoal}
              onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
              placeholder="예: 핀테크 프로덕트 매니저(PM), AI 데이터 엔지니어"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">관심 다전공 제도</label>
            <select
              value={form.interestedMajorType}
              onChange={(e) => setForm({ ...form, interestedMajorType: e.target.value as MultiMajorType })}
              className="w-full text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-blue-600"
            >
              <option value="student_designed">💡 학생설계융합전공 (나만의 커스텀 전공 설계)</option>
              <option value="double_major">📚 복수전공 (제2전공 - 39학점 이수)</option>
              <option value="interdisciplinary">🤝 연계전공 (기설치 융합 프로그램)</option>
              <option value="minor">⚡ 부전공 (21학점 이수)</option>
              <option value="micro_degree">🏅 마이크로전공 (9~15학점 단기 디그리)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">현재 취득 학점 (총 130)</label>
              <input
                type="number"
                min={0}
                max={130}
                value={form.completedCredits}
                onChange={(e) => setForm({ ...form, completedCredits: Number(e.target.value) })}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">채플 패스 횟수 (총 6회)</label>
              <input
                type="number"
                min={0}
                max={6}
                value={form.chapelSemestersPassed}
                onChange={(e) => setForm({ ...form, chapelSemestersPassed: Number(e.target.value) })}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#004B87] hover:bg-blue-800 text-white font-bold cursor-pointer"
            >
              저장 및 반영
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
