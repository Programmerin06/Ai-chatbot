import React, { useState } from 'react';
import { 
  Compass, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  MessageSquare,
  TrendingUp,
  Cpu,
  GraduationCap
} from 'lucide-react';
import { Department, StudentProfile } from '../types';
import { SSU_DEPARTMENTS } from '../data/ssuData';

interface CurriculumTabProps {
  profile: StudentProfile;
  onAskChatbotWithPrompt: (prompt: string) => void;
  onNavigateToStudio: () => void;
}

const CAREER_TRACKS = [
  { id: 'fintech', name: '핀테크 & 금융 데이터 분석', icon: '💳', recommendedCombo: ['경영학부', '컴퓨터학부', '금융학부'], bestType: '학생설계융합전공' },
  { id: 'ai_dev', name: 'AI 엔지니어 & 머신러닝 개발', icon: '🤖', recommendedCombo: ['컴퓨터학부', 'AI융합학부', '수학과'], bestType: '복수전공' },
  { id: 'pm_ux', name: 'IT 서비스 기획자(PM) & UX', icon: '📱', recommendedCombo: ['경영학부', '글로벌미디어학부', '언론홍보학과'], bestType: '학생설계융합전공' },
  { id: 'bio_health', name: '디지털 헬스케어 & 바이오데이터', icon: '🧬', recommendedCombo: ['의생명시스템학부', 'AI융합학부', '컴퓨터학부'], bestType: '학생설계융합전공' },
  { id: 'media_story', name: '인터랙티브 미디어 & 게임 스토리', icon: '🎮', recommendedCombo: ['국어국문학과', '글로벌미디어학부', '소프트웨어학부'], bestType: '학생설계융합전공' },
  { id: 'data_journal', name: '데이터 저널리즘 & PR 캠페인', icon: '📰', recommendedCombo: ['언론홍보학과', '컴퓨터학부', '경영학부'], bestType: '연계전공' },
];

export const CurriculumTab: React.FC<CurriculumTabProps> = ({
  profile,
  onAskChatbotWithPrompt,
  onNavigateToStudio,
}) => {
  const [selectedPrimary, setSelectedPrimary] = useState<string>(profile.primaryMajor || '경영학부');
  const [selectedTrack, setSelectedTrack] = useState<string>(CAREER_TRACKS[0].id);

  const activeTrack = CAREER_TRACKS.find((t) => t.id === selectedTrack) || CAREER_TRACKS[0];
  const primaryDeptData = SSU_DEPARTMENTS.find((d) => d.name === selectedPrimary) || SSU_DEPARTMENTS[0];

  // Synergistic departments
  const synergyDepts = SSU_DEPARTMENTS.filter((d) => d.name !== selectedPrimary);

  const handleAskCombination = (targetDeptName: string) => {
    const prompt = `제 주전공은 [${selectedPrimary}]이고 희망 진로는 [${activeTrack.name}]입니다. [${targetDeptName}]을(를) 활용한 최적의 다전공(복수전공 vs 학생설계융합전공) 이수 로드맵과 꼭 수강해야 할 핵심 과목들을 추천해줘!`;
    onAskChatbotWithPrompt(prompt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#004B87] text-xs font-bold border border-blue-200">
              커리큘럼 시너지 분석기
            </span>
            <span className="text-xs text-slate-500">숭실대학교 단과대·학과별 공식 교과목 매칭</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            🧭 학과별 맞춤 커리큘럼 & 다전공 추천 로드맵
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            본인의 주전공과 목표 진로 분야를 선택하면, 최고의 시너지를 발휘하는 교내 학과 교과목 조합과 학년별 이수 경로를 추천합니다.
          </p>
        </div>

        <button
          onClick={onNavigateToStudio}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>맞춤 전공 직접 설계하러 가기</span>
        </button>
      </div>

      {/* Selectors: Primary Major & Career Track */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-[#004B87]" />
            1. 학우님의 주전공 학과 선택
          </label>
          <select
            value={selectedPrimary}
            onChange={(e) => setSelectedPrimary(e.target.value)}
            className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-100 outline-none"
          >
            {SSU_DEPARTMENTS.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name} ({dept.college})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1">
            {primaryDeptData.description}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#004B87]" />
            2. 진출 희망 산업 / 커리어 트랙 선택
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {CAREER_TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                  selectedTrack === track.id
                    ? 'bg-blue-50 border-[#004B87] text-[#004B87] font-bold ring-1 ring-blue-200'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="text-base mb-0.5">{track.icon}</div>
                <div className="line-clamp-1">{track.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Synergy Recommendation Result Card */}
      <div className="bg-gradient-to-br from-slate-900 via-[#003B6F] to-indigo-950 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{activeTrack.icon}</span>
              <h3 className="text-lg font-bold">
                [{selectedPrimary}] 학우를 위한 [{activeTrack.name}] 최적 다전공 솔루션
              </h3>
            </div>
            <p className="text-xs text-blue-200">
              추천 이수 방식: <strong className="text-amber-300 font-bold underline">{activeTrack.bestType}</strong>
            </p>
          </div>

          <button
            onClick={() => handleAskCombination(activeTrack.recommendedCombo[1] || '컴퓨터학부')}
            className="px-4 py-2 rounded-xl bg-white text-[#004B87] hover:bg-blue-50 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>이 트랙으로 슈멘토와 1:1 상담하기</span>
          </button>
        </div>

        {/* 4-Year Academic Roadmap */}
        <div className="mt-5">
          <div className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            학년별 추천 수강 로드맵 (베어드 교필 + 주전공 + 다전공 조화)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 text-xs">
              <div className="font-bold text-amber-300 text-sm mb-1">1학년: 기초 & 베어드 교필</div>
              <p className="text-blue-100 text-[11px] mb-2 leading-relaxed">
                채플(2학기), 현대인과성서, 컴퓨팅적사고와코딩, 창의적글쓰기 등 교필을 우선 이수하고 주전공 개론 수강.
              </p>
              <div className="bg-white/10 rounded p-1.5 text-[10px] text-white font-mono">
                추천 과목: {primaryDeptData.sampleCourses[0]?.name || '전공기초'} + 대학영어
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 text-xs">
              <div className="font-bold text-emerald-300 text-sm mb-1">2학년: 다전공 진입 & 전공기초</div>
              <p className="text-blue-100 text-[11px] mb-2 leading-relaxed">
                다전공/학생설계전공 신청 기간(5월/11월). 상대 학과 전공기초 및 주전공 필수 과목 본격 이수.
              </p>
              <div className="bg-white/10 rounded p-1.5 text-[10px] text-white font-mono">
                추천 과목: 주전공 전필 + 연계학과 전초 (자료구조/마케팅 등)
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 text-xs">
              <div className="font-bold text-sky-300 text-sm mb-1">3학년: 융합 심화 & 프로젝트</div>
              <p className="text-blue-100 text-[11px] mb-2 leading-relaxed">
                두 학문의 시너지를 낼 수 있는 전공선택 과목 집중 수강. 학회, 공모전, 데이터 분석 실습 병행.
              </p>
              <div className="bg-white/10 rounded p-1.5 text-[10px] text-white font-mono">
                추천 과목: DB, MIS, 금융공학, 딥러닝응용 등 심화
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 text-xs">
              <div className="font-bold text-pink-300 text-sm mb-1">4학년: 캡스톤 & 취업 포트폴리오</div>
              <p className="text-blue-100 text-[11px] mb-2 leading-relaxed">
                융합 캡스톤디자인 이수, 졸업인증(토익, 봉사, 채플 6학기 체크), 다전공 스토리텔링 취업 지원.
              </p>
              <div className="bg-white/10 rounded p-1.5 text-[10px] text-white font-mono">
                추천 과목: 캡스톤디자인 + 졸업논문/시험
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synergy Departments Deep Dive */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#004B87]" />
          [{selectedPrimary}]와 매칭 가능한 숭실대 핵심 학과 & 추천 과목
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {synergyDepts.slice(0, 6).map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="font-bold text-sm text-slate-900">{dept.name}</div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                    {dept.college}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{dept.description}</p>

                {/* Core Courses List */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[11px] font-semibold text-slate-700">추천 핵심 교과목:</div>
                  {dept.sampleCourses.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      className="text-xs bg-slate-50 border border-slate-200/80 rounded-lg p-2 flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800">{c.name}</span>
                      <span className="text-[10px] text-slate-500">{c.credits}학점 • {c.category}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  복수전공 최소 <strong className="text-blue-700 font-bold">{dept.doubleMajorCredits}학점</strong>
                </span>
                <button
                  onClick={() => handleAskCombination(dept.name)}
                  className="text-xs font-semibold text-[#004B87] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>상담하기</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
