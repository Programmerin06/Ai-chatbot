import React from 'react';
import { 
  GraduationCap, 
  MessageSquare, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  User, 
  Compass,
  Building2
} from 'lucide-react';
import { StudentProfile } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: StudentProfile;
  onOpenProfileModal: () => void;
  onOpenGuideModal: () => void;
  onOpenDatabaseModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenProfileModal,
  onOpenGuideModal,
  onOpenDatabaseModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner with University Identity */}
      <div className="bg-[#003B6F] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="px-1.5 py-0.5 rounded bg-white/20 text-white font-bold tracking-wider">SSU</span>
          <span>숭실대학교 학사지원 & 교육혁신원 공인 다전공 진로 상담 시스템</span>
        </div>
        <div className="flex items-center gap-3 text-blue-100">
          <button
            onClick={onOpenDatabaseModal}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-400/30 text-[11px] font-medium transition-colors cursor-pointer"
            title="백엔드 서버 데이터베이스 상태 및 저장된 데이터 조회"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            백엔드 서버 데이터 영구 저장 연동됨 (DB 모니터)
          </button>
          <span className="text-white/40">|</span>
          <button 
            onClick={onOpenGuideModal}
            className="hover:text-white flex items-center gap-1 transition-colors underline cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            교내 다전공 규정 안내서
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#003B6F] to-[#0066B2] text-white flex items-center justify-center shadow-md shadow-blue-900/10">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                숭실대 다전공·진로 멘토 <span className="text-[#0055A5]">슈멘토</span>
              </h1>
              <span className="bg-blue-100 text-[#004B87] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                학생설계융합전공 특화
              </span>
            </div>
            <p className="text-xs text-slate-500">
              복수·부·연계·융합·학생설계전공 로드맵 및 130학점 졸업 관리
            </p>
          </div>
        </div>

        {/* Student Profile Quick Widget */}
        <button
          onClick={onOpenProfileModal}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group cursor-pointer"
          title="학생 프로필 설정 변경"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#004B87] flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>{profile.studentName} ({profile.primaryMajor})</span>
              <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded text-slate-700 font-mono">
                {profile.currentSemester}학기
              </span>
            </div>
            <div className="text-slate-500 text-[11px] flex items-center gap-2">
              <span>목표: {profile.careerGoal}</span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-600 font-medium">{profile.completedCredits}/130학점</span>
            </div>
          </div>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 border-t border-slate-100 flex items-center overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'chat'
              ? 'border-[#004B87] text-[#004B87] bg-blue-50/40'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI 진로·다전공 상담 (챗봇)</span>
          <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-bold">
            AI
          </span>
        </button>

        <button
          onClick={() => setActiveTab('major-studio')}
          className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'major-studio'
              ? 'border-[#004B87] text-[#004B87] bg-blue-50/40'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>학생설계융합전공 기획실</span>
          <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold">
            NEW
          </span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'curriculum'
              ? 'border-[#004B87] text-[#004B87] bg-blue-50/40'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>학과별 맞춤 커리큘럼 추천</span>
        </button>

        <button
          onClick={() => setActiveTab('graduation')}
          className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'graduation'
              ? 'border-[#004B87] text-[#004B87] bg-blue-50/40'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>졸업 요건 관리기 (130학점)</span>
        </button>

        <button
          onClick={onOpenGuideModal}
          className="flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-semibold border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 ml-auto whitespace-nowrap cursor-pointer"
        >
          <Building2 className="w-4 h-4" />
          <span>교내 다전공 제도 비교</span>
        </button>
      </div>
    </header>
  );
};
