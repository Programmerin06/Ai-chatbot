import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Save, 
  Printer, 
  MessageSquare, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Layers,
  Compass,
  AlertCircle,
  Award
} from 'lucide-react';
import { Course, SemesterSchedule, StudentProfile } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { api, SavedProposal } from '../services/api';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  majorTitleKo: string;
  majorTitleEn: string;
  degreeType: string;
  targetCareer: string;
  basketCourses: Course[];
  profile: StudentProfile;
  onAskChatbotWithPrompt: (prompt: string) => void;
  onSaveProposalWithRoadmap: (roadmap: SemesterSchedule[]) => Promise<void>;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({
  isOpen,
  onClose,
  majorTitleKo,
  majorTitleEn,
  degreeType,
  targetCareer,
  basketCourses,
  profile,
  onAskChatbotWithPrompt,
  onSaveProposalWithRoadmap,
}) => {
  const [schedule, setSchedule] = useState<SemesterSchedule[]>([]);
  const [selectedSemesterIdx, setSelectedSemesterIdx] = useState<number>(profile.currentSemester - 1);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'grid' | 'timeline' | 'ai'>('grid');

  // Generate 8-semester schedule based on current semester and basket courses
  const generateRoadmap = () => {
    const curSem = profile.currentSemester; // e.g. 3

    // Sort basket courses: foundation (전공기초) -> required (전공필수) -> elective (전공선택) -> capstone
    const sortedDesignCourses = [...basketCourses].sort((a, b) => {
      const order = { '전공기초': 1, '전공필수': 2, '전공선택': 3 };
      const catA = order[a.category as keyof typeof order] || 4;
      const catB = order[b.category as keyof typeof order] || 4;
      if (catA !== catB) return catA - catB;
      return (a.recommendedYear || 2) - (b.recommendedYear || 2);
    });

    // Available remaining semesters from curSem to 8
    const remainingSemestersCount = Math.max(1, 9 - curSem);
    
    // Distribute the 12 design courses across remaining semesters (typically 2-3 per semester)
    const designCoursesPerSem: { [sem: number]: Course[] } = {};
    for (let s = curSem; s <= 8; s++) {
      designCoursesPerSem[s] = [];
    }

    let semPointer = curSem;
    sortedDesignCourses.forEach((course) => {
      // Put capstone courses in semester 7 or 8
      if (course.name.includes('캡스톤') || course.name.includes('종합설계')) {
        designCoursesPerSem[8] ? designCoursesPerSem[8].push(course) : designCoursesPerSem[semPointer]?.push(course);
      } else {
        if (!designCoursesPerSem[semPointer]) semPointer = curSem;
        designCoursesPerSem[semPointer].push(course);
        // Distribute 2 courses per semester until 7th semester
        if (designCoursesPerSem[semPointer].length >= 2 && semPointer < 8) {
          semPointer++;
        }
      }
    });

    const semesters: SemesterSchedule[] = [];

    const defaultMilestones = [
      '베어드 교필(글쓰기/기독교교양) 및 대학생활 적응, 주전공 탐색',
      '코딩/소프트웨어 기초 및 채플 2학기 이수, 융합 전공 분야 탐색',
      '★ 학생설계융합전공 계획서 작성, 지도교수 위촉 상담 및 심의위원회 제출',
      '★ 교육과정심의위원회 최종 승인 확인 및 포털 u-Saint 다전공 등록, 기초 선수과목 이수',
      '융합 전공 심화 과목 집중 수강, 관련 학회 및 데이터/프로젝트 공모전 준비',
      '채플 6학기 이수 완료(P), 공인영어성적(TOEIC/OPIc) 졸업인증 취득',
      '학생설계융합전공 캡스톤디자인 프로젝트 기획, 포트폴리오 빌딩',
      '졸업논문/작품 심사 통과, 130학점 이수 사정 최종 확인 및 학위 취득',
    ];

    const defaultGoals = [
      '대학 기초 교양 및 전공 기본 소양 함양',
      'IT/디지털 리터러시 역량 및 교양필수 완료',
      '학생설계전공 신청 및 기초 융합 교과목 이수 진입',
      '다전공 정식 등록 및 융합 전공필수 본격 수강',
      '두 학문 간 시너지 프로젝트 수행 및 심화 지식 습득',
      '채플 패스 및 어학 졸업인증 완료, 전공선택 마스터',
      '융합 캡스톤디자인 및 취업 실무 포트폴리오 제작',
      '졸업 사정 통과 및 독자적 융합 학사 학위 수여',
    ];

    for (let s = 1; s <= 8; s++) {
      const year = Math.ceil(s / 2);
      const term = (s % 2 === 1 ? 1 : 2) as 1 | 2;
      const isCompleted = s < curSem;
      const isCurrent = s === curSem;

      const semCourses: SemesterSchedule['courses'] = [];

      if (isCompleted) {
        // Pre-filled past completed courses
        if (s === 1) {
          semCourses.push(
            { name: '현대인과성서', credits: 1, category: '베어드교필' },
            { name: '숭실인성과리더십', credits: 1, category: '베어드교필' },
            { name: '창의적사고와글쓰기', credits: 3, category: '베어드교필' },
            { name: `${profile.primaryMajor} 개론`, credits: 3, category: '주전공' },
            { name: '인문학의이해 (균형교양)', credits: 3, category: '균형교양' },
            { name: '일반선택과목', credits: 3, category: '일반선택' },
            { name: '채플 (1학기)', credits: 0, category: '베어드교필' }
          );
        } else if (s === 2) {
          semCourses.push(
            { name: '컴퓨팅적사고와코딩', credits: 3, category: '베어드교필' },
            { name: '대학영어(글로벌영어)', credits: 3, category: '베어드교필' },
            { name: `${profile.primaryMajor} 기초원론`, credits: 3, category: '주전공' },
            { name: '사회과학의이해 (균형교양)', credits: 3, category: '균형교양' },
            { name: '일반선택과목', credits: 3, category: '일반선택' },
            { name: '채플 (2학기)', credits: 0, category: '베어드교필' }
          );
        } else {
          semCourses.push(
            { name: `${profile.primaryMajor} 전공과목`, credits: 6, category: '주전공' },
            { name: '균형교양과목', credits: 6, category: '균형교양' },
            { name: '채플', credits: 0, category: '베어드교필' }
          );
        }
      } else {
        // Remaining upcoming or current semesters
        // 1. Add assigned design courses
        const assigned = designCoursesPerSem[s] || [];
        assigned.forEach((c) => {
          semCourses.push({
            name: c.name,
            credits: c.credits,
            category: '학생설계전공',
            department: c.department,
            isDesignMajorCourse: true,
            description: c.description,
          });
        });

        // 2. Add accompanying primary major and general courses to maintain 15~18 credits
        if (s <= 6) {
          semCourses.push({ name: `채플 (${s}학기)`, credits: 0, category: '베어드교필' });
        }
        semCourses.push({ name: `${profile.primaryMajor} 전공과목`, credits: 6, category: '주전공' });
        
        if (s <= 5) {
          semCourses.push({ name: '균형교양 / 일반선택', credits: 3, category: '균형교양' });
        }
      }

      const totalCredits = semCourses.reduce((sum, c) => sum + c.credits, 0);

      semesters.push({
        semesterNumber: s,
        year,
        term,
        isCompleted,
        isCurrent,
        courses: semCourses,
        totalCredits,
        semesterGoal: defaultGoals[s - 1],
        keyMilestones: [defaultMilestones[s - 1]],
      });
    }

    setSchedule(semesters);
    setSelectedSemesterIdx(Math.max(0, curSem - 1));
  };

  useEffect(() => {
    if (isOpen) {
      generateRoadmap();
      setAiAdvice(null);
    }
  }, [isOpen, basketCourses, profile.currentSemester]);

  if (!isOpen) return null;

  // Total credits across all 8 semesters
  const grandTotalCredits = schedule.reduce((sum, sem) => sum + sem.totalCredits, 0);
  const designCoursesAllocatedCount = schedule
    .flatMap((s) => s.courses)
    .filter((c) => c.isDesignMajorCourse).length;
  const designCreditsAllocated = schedule
    .flatMap((s) => s.courses)
    .filter((c) => c.isDesignMajorCourse)
    .reduce((sum, c) => sum + c.credits, 0);

  // AI Roadmap Advisory
  const handleRequestAiAdvice = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/generate-roadmap-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          majorTitle: `${majorTitleKo} (${majorTitleEn})`,
          primaryMajor: profile.primaryMajor,
          currentSemester: profile.currentSemester,
          targetCareer,
          roadmap: schedule.map((s) => ({
            semester: `${s.year}학년 ${s.term}학기 (총 ${s.totalCredits}학점)`,
            goal: s.semesterGoal,
            designCourses: s.courses.filter((c) => c.isDesignMajorCourse).map((c) => `${c.name}(${c.credits}학점)`),
            otherCourses: s.courses.filter((c) => !c.isDesignMajorCourse).map((c) => c.name),
          })),
        }),
      });

      if (!res.ok) throw new Error('로드맵 AI 분석 실패');
      const data = await res.json();
      setAiAdvice(data.advice);
      setActiveView('ai');
    } catch (err: any) {
      alert('AI 분석 중 오류: ' + (err.message || '오류 발생'));
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Save to backend
  const handleSaveToBackend = async () => {
    setIsSaving(true);
    try {
      await onSaveProposalWithRoadmap(schedule);
      alert('8학기 이수 로드맵이 백엔드 서버에 성공적으로 저장되었습니다!');
    } catch (err: any) {
      alert('저장 실패: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Consult with chatbot
  const handleConsultChatbot = () => {
    onClose();
    const prompt = `제 주전공은 [${profile.primaryMajor}]이고 현재 [${profile.currentSemester}학기차]입니다. 방금 기획실에서 설계한 [${majorTitleKo}] 학생설계융합전공(36학점)을 남은 학기 동안 이수하는 8학기 로드맵을 짰습니다. 학기별 수강 밸런스와 심의위원회 통과를 위한 팁을 추가로 조언해줘!`;
    onAskChatbotWithPrompt(prompt);
  };

  const currentSelectedSem = schedule[selectedSemesterIdx] || schedule[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#003B6F] text-white p-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-xs">
              <Calendar className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
                  8학기 이수 로드맵
                </span>
                <span className="text-xs text-blue-200">
                  {profile.studentName} 학우 ({profile.primaryMajor} • 현재 {profile.currentSemester}학기차)
                </span>
              </div>
              <h3 className="font-bold text-lg md:text-xl text-white tracking-tight mt-0.5">
                [{majorTitleKo}] 학생설계융합전공 8학기 맞춤 수강 완성표
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestAiAdvice}
              disabled={isLoadingAi}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoadingAi ? 'AI 분석 중...' : 'AI 수석 어드바이저 정밀 분석'}</span>
            </button>

            <button
              onClick={handleSaveToBackend}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="백엔드 서버에 8학기 로드맵 영구 저장"
            >
              <Save className="w-4 h-4 text-emerald-200" />
              <span>{isSaving ? '저장 중...' : '서버에 저장'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-bar with Overall Summary & Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">8학기 총 이수 계획:</span>
              <strong className="text-blue-900 font-bold">{grandTotalCredits}학점</strong>
              <span className="text-slate-400 text-[11px]">(기준: 130학점 충족)</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">배치된 학생설계전공:</span>
              <strong className="text-emerald-700 font-bold">{designCreditsAllocated}학점</strong>
              <span className="text-[11px] text-slate-500">({designCoursesAllocatedCount}과목 / 최소 36학점)</span>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setActiveView('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'grid' ? 'bg-[#004B87] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              전체 8학기 그리드
            </button>
            <button
              onClick={() => setActiveView('timeline')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'timeline' ? 'bg-[#004B87] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              학기별 상세 집중 뷰
            </button>
            {aiAdvice && (
              <button
                onClick={() => setActiveView('ai')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  activeView === 'ai' ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs' : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                AI 분석 보고서
              </button>
            )}
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Advice View (if active) */}
          {activeView === 'ai' && aiAdvice && (
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-slate-900 text-base">
                    슈멘토의 8학기 로드맵 전문 분석 및 심의 통과 가이드
                  </h4>
                </div>
                <button
                  onClick={() => setActiveView('grid')}
                  className="text-xs text-amber-800 hover:underline font-semibold"
                >
                  ← 로드맵 그리드로 돌아가기
                </button>
              </div>
              <div className="prose prose-sm max-w-none text-slate-800">
                <MarkdownRenderer content={aiAdvice} />
              </div>
            </div>
          )}

          {/* VIEW 1: Complete 8-Semester Grid View */}
          {activeView === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {schedule.map((sem, idx) => {
                const designCourses = sem.courses.filter((c) => c.isDesignMajorCourse);
                const otherCourses = sem.courses.filter((c) => !c.isDesignMajorCourse);

                return (
                  <div
                    key={sem.semesterNumber}
                    onClick={() => {
                      setSelectedSemesterIdx(idx);
                      setActiveView('timeline');
                    }}
                    className={`rounded-2xl border p-4 flex flex-col justify-between transition-all cursor-pointer group hover:shadow-md ${
                      sem.isCurrent
                        ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-300 shadow-xs'
                        : sem.isCompleted
                        ? 'bg-slate-50 border-slate-200 opacity-90'
                        : 'bg-white border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div>
                      {/* Semester Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">
                            {sem.year}학년 {sem.term}학기
                          </span>
                          <span className="text-[10px] text-slate-400">({sem.semesterNumber}학기차)</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sem.isCurrent
                              ? 'bg-blue-600 text-white animate-pulse'
                              : sem.isCompleted
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {sem.isCurrent ? '현재 진행' : sem.isCompleted ? '기이수 완료' : '남은 학기'}
                        </span>
                      </div>

                      {/* Semester Goal */}
                      <p className="text-[11px] text-slate-500 mb-3 line-clamp-1">
                        🎯 {sem.semesterGoal}
                      </p>

                      {/* Course List inside card */}
                      <div className="space-y-1.5 mb-3">
                        {/* Student Designed Major Courses (Highlighted) */}
                        {designCourses.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2 text-xs flex items-center justify-between"
                          >
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                              <span className="font-semibold text-emerald-950 line-clamp-1">{c.name}</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 shrink-0">{c.credits}학점</span>
                          </div>
                        ))}

                        {/* Other Courses */}
                        {otherCourses.slice(0, 3).map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-[11px] flex items-center justify-between text-slate-600"
                          >
                            <span className="line-clamp-1">{c.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{c.credits}학점</span>
                          </div>
                        ))}

                        {otherCourses.length > 3 && (
                          <div className="text-[10px] text-slate-400 text-center">
                            외 {otherCourses.length - 3}개 과목
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Semester Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        총 <span className="text-blue-700">{sem.totalCredits}</span>학점
                      </span>
                      <span className="text-[11px] text-blue-600 font-semibold group-hover:underline flex items-center gap-0.5">
                        상세보기 <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: Detailed Semester Timeline View */}
          {activeView === 'timeline' && currentSelectedSem && (
            <div className="space-y-6">
              {/* Semester Selector Tabs (1~8) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {schedule.map((s, idx) => (
                  <button
                    key={s.semesterNumber}
                    onClick={() => setSelectedSemesterIdx(idx)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                      selectedSemesterIdx === idx
                        ? 'bg-[#004B87] text-white border-[#004B87] shadow-sm'
                        : s.isCurrent
                        ? 'bg-blue-50 border-blue-300 text-blue-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{s.year}학년 {s.term}학기</span>
                    {s.isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-blue-300 animate-ping"></span>
                    )}
                  </button>
                ))}
              </div>

              {/* Active Semester Deep Dive Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xl text-slate-900">
                        {currentSelectedSem.year}학년 {currentSelectedSem.term}학기 ({currentSelectedSem.semesterNumber}학기차)
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          currentSelectedSem.isCurrent
                            ? 'bg-blue-600 text-white'
                            : currentSelectedSem.isCompleted
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {currentSelectedSem.isCurrent ? '현재 학기' : currentSelectedSem.isCompleted ? '이수 완료' : '남은 수강 예정 학기'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      학기 목표: <strong className="text-slate-800">{currentSelectedSem.semesterGoal}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500">학기 총 이수 학점:</span>
                    <div className="text-2xl font-black text-blue-900">
                      {currentSelectedSem.totalCredits} <span className="text-sm font-semibold text-slate-500">학점</span>
                    </div>
                  </div>
                </div>

                {/* Milestone Callout */}
                {currentSelectedSem.keyMilestones && currentSelectedSem.keyMilestones.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                    <Award className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">이번 학기 핵심 마일스톤:</span>
                      <p className="mt-0.5 leading-relaxed">{currentSelectedSem.keyMilestones[0]}</p>
                    </div>
                  </div>
                )}

                {/* Course List */}
                <div>
                  <h5 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#004B87]" />
                    수강 교과목 편성 상세 ({currentSelectedSem.courses.length}개 과목):
                  </h5>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {currentSelectedSem.courses.map((course, cIdx) => (
                      <div
                        key={cIdx}
                        className={`p-3.5 flex items-center justify-between text-xs transition-colors ${
                          course.isDesignMajorCourse ? 'bg-emerald-50/40' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-400 w-5">{cIdx + 1}</span>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{course.name}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  course.isDesignMajorCourse
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : course.category === '주전공'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {course.category}
                              </span>
                              {course.department && (
                                <span className="text-[10px] text-slate-500 font-medium">({course.department})</span>
                              )}
                            </div>
                            {course.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{course.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="font-bold text-slate-800 text-xs shrink-0">
                          {course.credits}학점
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>선택한 [{majorTitleKo}] 36학점 교과목이 남은 학기에 전원 편성되었습니다.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleConsultChatbot}
              className="px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-[#004B87] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>슈멘토에게 로드맵 1:1 상담하기</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>로드맵 인쇄 / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
