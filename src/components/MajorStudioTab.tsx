import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  BookOpen,
  ArrowRight,
  RefreshCw,
  Sliders,
  Send,
  Save,
  FolderOpen,
  Clock,
  Calendar
} from 'lucide-react';
import { Course, Department, SemesterSchedule, StudentDesignedMajorProposal, StudentProfile } from '../types';
import { POPULAR_STUDENT_DESIGNED_MAJORS, SSU_DEPARTMENTS } from '../data/ssuData';
import { MarkdownRenderer } from './MarkdownRenderer';
import { api, SavedProposal } from '../services/api';
import { RoadmapModal } from './RoadmapModal';

interface MajorStudioTabProps {
  profile: StudentProfile;
  onAskChatbotAboutPlan?: (planTitle: string) => void;
  onAskChatbotWithPrompt?: (prompt: string) => void;
}

export const MajorStudioTab: React.FC<MajorStudioTabProps> = ({ 
  profile, 
  onAskChatbotAboutPlan,
  onAskChatbotWithPrompt = () => {},
}) => {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState<boolean>(false);
  const [currentRoadmap, setCurrentRoadmap] = useState<SemesterSchedule[] | undefined>(undefined);
  
  // Custom or selected major state
  const [majorTitleKo, setMajorTitleKo] = useState<string>(POPULAR_STUDENT_DESIGNED_MAJORS[0].majorTitleKo);
  const [majorTitleEn, setMajorTitleEn] = useState<string>(POPULAR_STUDENT_DESIGNED_MAJORS[0].majorTitleEn);
  const [degreeType, setDegreeType] = useState<string>(POPULAR_STUDENT_DESIGNED_MAJORS[0].degreeType);
  const [targetCareer, setTargetCareer] = useState<string>('핀테크 프로덕트 매니저(PM), 퀀트 트레이더');
  const [userRationale, setUserRationale] = useState<string>(POPULAR_STUDENT_DESIGNED_MAJORS[0].rationale);
  
  // Selected participating departments
  const [selectedDepts, setSelectedDepts] = useState<string[]>(POPULAR_STUDENT_DESIGNED_MAJORS[0].targetDepartments);
  
  // Course basket (36 credits)
  const [basketCourses, setBasketCourses] = useState<Course[]>(POPULAR_STUDENT_DESIGNED_MAJORS[0].courses);

  // Available department for picking courses
  const [deptForAdding, setDeptForAdding] = useState<string>(SSU_DEPARTMENTS[0].name);

  // AI Generated plan text
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Saved proposals from backend
  const [savedProposals, setSavedProposals] = useState<SavedProposal[]>([]);
  const [showSavedVault, setShowSavedVault] = useState<boolean>(true);

  // Load saved proposals from backend on mount
  useEffect(() => {
    async function loadSaved() {
      try {
        const list = await api.getProposals();
        setSavedProposals(list);
      } catch (err) {
        console.error('Failed to load proposals from backend:', err);
      }
    }
    loadSaved();
  }, []);

  // Calculation
  const totalBasketCredits = basketCourses.reduce((sum, c) => sum + c.credits, 0);
  const distinctDeptsInBasket = Array.from(new Set(basketCourses.map((c) => c.department)));
  const isMinCreditsMet = totalBasketCredits >= 36;
  const isMultiDeptMet = distinctDeptsInBasket.length >= 2;

  // Load template
  const handleLoadTemplate = (index: number) => {
    setSelectedTemplateIndex(index);
    const tmpl = POPULAR_STUDENT_DESIGNED_MAJORS[index];
    setMajorTitleKo(tmpl.majorTitleKo);
    setMajorTitleEn(tmpl.majorTitleEn);
    setDegreeType(tmpl.degreeType);
    setTargetCareer(tmpl.careerProspects.join(', '));
    setUserRationale(tmpl.rationale);
    setSelectedDepts(tmpl.targetDepartments);
    setBasketCourses(tmpl.courses);
    setGeneratedPlan(null);
  };

  // Add course to basket
  const handleAddCourse = (course: Course) => {
    if (basketCourses.some((c) => c.name === course.name)) {
      alert('이미 편성표에 포함된 과목입니다.');
      return;
    }
    setBasketCourses([...basketCourses, course]);
  };

  // Remove course from basket
  const handleRemoveCourse = (courseId: string) => {
    setBasketCourses(basketCourses.filter((c) => c.id !== courseId));
  };

  // Generate formal plan via Gemini API
  const handleGenerateAIPlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/design-major-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          majorTitle: `${majorTitleKo} (${majorTitleEn})`,
          targetCareer,
          targetDepartments: selectedDepts,
          userDescription: userRationale + `\n편성 과목: ` + basketCourses.map((c) => `${c.name}(${c.department}, ${c.credits}학점, ${c.category})`).join(', '),
        }),
      });

      if (!res.ok) {
        throw new Error('계획서 생성 실패');
      }

      const data = await res.json();
      setGeneratedPlan(data.plan);
    } catch (err: any) {
      alert('AI 계획서 생성 중 오류: ' + (err.message || '네트워크 오류'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Save current plan to backend server
  const handleSaveToBackend = async () => {
    try {
      setIsSaving(true);
      const res = await api.saveProposal({
        majorTitleKo,
        majorTitleEn,
        degreeType,
        targetDepartments: selectedDepts,
        targetCareer,
        userRationale,
        courses: basketCourses,
        totalCredits: totalBasketCredits,
        generatedPlan: generatedPlan || undefined,
      });
      setSavedProposals(res.proposals);
      alert(`[${majorTitleKo}] 기획안이 백엔드 서버에 안전하게 영구 저장되었습니다!`);
    } catch (err: any) {
      alert('백엔드 저장 실패: ' + (err.message || '오류'));
    } finally {
      setIsSaving(false);
    }
  };

  // Save proposal with 8-semester roadmap to backend
  const handleSaveProposalWithRoadmap = async (roadmap: SemesterSchedule[]) => {
    setCurrentRoadmap(roadmap);
    const res = await api.saveProposal({
      majorTitleKo,
      majorTitleEn,
      degreeType,
      targetDepartments: selectedDepts,
      targetCareer,
      userRationale,
      courses: basketCourses,
      totalCredits: totalBasketCredits,
      generatedPlan: generatedPlan || undefined,
      roadmap,
    });
    setSavedProposals(res.proposals);
  };

  // Delete saved proposal from backend
  const handleDeleteProposal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('이 기획안을 백엔드 서버에서 삭제하시겠습니까?')) return;
    try {
      const updated = await api.deleteProposal(id);
      setSavedProposals(updated);
    } catch (err: any) {
      alert('삭제 실패: ' + err.message);
    }
  };

  // Load a saved proposal into current editor
  const handleLoadSaved = (item: SavedProposal) => {
    setMajorTitleKo(item.majorTitleKo);
    setMajorTitleEn(item.majorTitleEn);
    setDegreeType(item.degreeType);
    setTargetCareer(item.targetCareer);
    setUserRationale(item.userRationale);
    setSelectedDepts(item.targetDepartments);
    setBasketCourses(item.courses);
    setGeneratedPlan(item.generatedPlan || null);
    if (item.roadmap) {
      setCurrentRoadmap(item.roadmap);
    }
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCopyPlan = () => {
    if (!generatedPlan) return;
    navigator.clipboard.writeText(generatedPlan);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const currentAvailableDeptCourses = SSU_DEPARTMENTS.find((d) => d.name === deptForAdding)?.sampleCourses || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
              숭실대 시그니처 다전공
            </span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              백엔드 서버 영구 보관 연동
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            💡 학생설계융합전공(Student-Designed Major) 기획실
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            세상에 없던 나만의 전공을 직접 창조하세요! 2개 이상의 학과 교과목을 최소 36학점 이상 융합 편성하여 
            심의위원회를 거치면 정규 학사학위가 수여됩니다. 작성한 기획안은 백엔드 서버에 안전하게 영구 저장됩니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsRoadmapModalOpen(true)}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-700 to-[#004B87] hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
            title="현재 36학점 교과목을 바탕으로 남은 학기 동안의 8학기 이수 로드맵 생성"
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>8학기 이수 로드맵 생성</span>
          </button>

          <button
            onClick={handleSaveToBackend}
            disabled={isSaving}
            className="px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="현재 기획안과 36학점 편성표를 백엔드 서버에 영구 보관"
          >
            <Save className="w-4 h-4 text-emerald-200" />
            <span>{isSaving ? '서버 저장 중...' : '기획안 서버 저장'}</span>
          </button>

          <button
            onClick={handleGenerateAIPlan}
            disabled={isGenerating}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-600 to-[#004B87] hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
            <span>{isGenerating ? 'AI가 계획서 작성 중...' : 'AI 공식 심의 계획서 생성'}</span>
          </button>
        </div>
      </div>

      {/* Backend Saved Proposals Vault */}
      {savedProposals.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-emerald-700" />
              📂 백엔드 서버 보관함 ({savedProposals.length}건 저장됨):
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">클릭 시 편집기로 즉시 복원됩니다</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {savedProposals.map((item) => (
              <div
                key={item.id}
                onClick={() => handleLoadSaved(item)}
                className="bg-white border border-emerald-200 hover:border-emerald-500 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {item.majorTitleKo}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      {item.degreeType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                    {item.majorTitleEn || item.targetCareer}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{item.courses.length}과목 ({item.totalCredits}학점)</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-semibold group-hover:underline">
                    에디터로 불러오기 ➜
                  </span>
                  <button
                    onClick={(e) => handleDeleteProposal(item.id, e)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                    title="서버에서 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preset Templates */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            숭실대 인기 승인 모델 템플릿 불러오기:
          </span>
          <span className="text-[11px] text-slate-500">클릭 시 편성표가 자동 세팅됩니다</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {POPULAR_STUDENT_DESIGNED_MAJORS.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadTemplate(idx)}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                selectedTemplateIndex === idx
                  ? 'bg-white border-[#004B87] ring-2 ring-blue-100 shadow-xs'
                  : 'bg-white/80 hover:bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-sm text-slate-900">{tmpl.majorTitleKo}</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md border border-blue-200">
                  {tmpl.degreeType}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mb-2">{tmpl.majorTitleEn}</p>
              <div className="flex flex-wrap gap-1">
                {tmpl.targetDepartments.map((d, dIdx) => (
                  <span key={dIdx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                    {d}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Course Picker (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Major Basic Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-[#004B87]" />
              1. 전공 기본 개요 및 설계 방향
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">전공 명칭 (국문)</label>
                <input
                  type="text"
                  value={majorTitleKo}
                  onChange={(e) => setMajorTitleKo(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                  placeholder="예: 핀테크알고리즘투자학"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">전공 명칭 (영문)</label>
                <input
                  type="text"
                  value={majorTitleEn}
                  onChange={(e) => setMajorTitleEn(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                  placeholder="예: FinTech & Algorithmic Investment"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">수여 학위 유형</label>
                <select
                  value={degreeType}
                  onChange={(e) => setDegreeType(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none bg-white"
                >
                  <option value="경영학사">경영학사 (BBA)</option>
                  <option value="공학사">공학사 (B.E.)</option>
                  <option value="문학사">문학사 (B.A.)</option>
                  <option value="이학사">이학사 (B.S.)</option>
                  <option value="융합학사">융합학사 (B.Interdisciplinary)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">희망 진로 / 타깃 직무</label>
                <input
                  type="text"
                  value={targetCareer}
                  onChange={(e) => setTargetCareer(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                  placeholder="예: 핀테크 PM, 데이터 분석가, 퀀트"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                융합의 필요성 및 설계 의도 (심의위원회 설득 포인트)
              </label>
              <textarea
                value={userRationale}
                onChange={(e) => setUserRationale(e.target.value)}
                rows={3}
                className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                placeholder="왜 기존의 단일 전공이나 일반 복수전공으로는 이 진로를 대비하기 어려운지, 두 학문 간 융합 시너지를 설명해주세요."
              />
            </div>
          </div>

          {/* Course Basket Builder Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#004B87]" />
                <h3 className="font-bold text-slate-900 text-base">
                  2. 교육과정 편성표 구성 (현재 {totalBasketCredits}학점 / 최소 36학점)
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => setIsRoadmapModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#004B87] font-bold text-xs flex items-center gap-1.5 border border-indigo-200 transition-all cursor-pointer"
                  title="이 편성표를 바탕으로 남은 학기 8학기 이수 로드맵 편성"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>8학기 로드맵 편성</span>
                </button>

                <span className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isMinCreditsMet ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {isMinCreditsMet ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {isMinCreditsMet ? '학점 충족' : `${36 - totalBasketCredits}학점 부족`}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isMultiDeptMet ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {isMultiDeptMet ? `${distinctDeptsInBasket.length}개 학과 융합 OK` : '2개 이상 학과 필요'}
                </span>
              </div>
            </div>

            {/* Current Basket Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {basketCourses.map((c, i) => (
                  <div key={c.id || i} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400 w-5">{i + 1}</span>
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>{c.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                            {c.department}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            c.category === '전공기초' ? 'bg-blue-50 text-blue-700' :
                            c.category === '전공필수' ? 'bg-indigo-50 text-indigo-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {c.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-slate-700">{c.credits}학점</span>
                      <button
                        onClick={() => handleRemoveCourse(c.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        title="과목 제외"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Course From SSU Departments */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">숭실대 개설 과목 추가하기:</span>
                <select
                  value={deptForAdding}
                  onChange={(e) => setDeptForAdding(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1 bg-white font-medium text-slate-800"
                >
                  {SSU_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name} ({dept.college})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentAvailableDeptCourses.map((c) => {
                  const isAdded = basketCourses.some((item) => item.name === c.name);
                  return (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs hover:border-blue-300 transition-all"
                    >
                      <div>
                        <div className="font-medium text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-500">{c.category} • {c.credits}학점</div>
                      </div>
                      <button
                        onClick={() => handleAddCourse(c)}
                        disabled={isAdded}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                          isAdded
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-[#004B87] hover:bg-blue-800 text-white shadow-2xs'
                        }`}
                      >
                        {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span>{isAdded ? '담김' : '추가'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Official Proposal Reviewer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col h-full min-h-[550px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#004B87]" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">공식 전공계획서 미리보기</h3>
                  <p className="text-[11px] text-slate-500">교육과정심의위원회 제출 양식 기준</p>
                </div>
              </div>

              {generatedPlan && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPlan}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-blue-700 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                    title="전체 복사"
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copySuccess ? '복사됨' : '복사'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Generated Document Area */}
            <div className="flex-1 overflow-y-auto pr-1">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#004B87] flex items-center justify-center animate-spin">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">AI 심의 계획서 작성 중...</h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    숭실대 교육과정심의위원회 평가 지표(타당성, 선후수 연계성, 사회적 수요)를 바탕으로 
                    설득력 있는 전공계획서를 생성하고 있습니다.
                  </p>
                </div>
              ) : generatedPlan ? (
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 text-xs leading-relaxed text-slate-800 space-y-2">
                  <MarkdownRenderer content={generatedPlan} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">아직 생성된 계획서가 없습니다</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                      왼쪽에서 전공명과 36학점 편성표를 세팅한 후, 
                      상단의 <strong className="text-blue-700">[AI 공식 심의 계획서 생성]</strong> 버튼을 누르면
                      승인용 보고서가 즉시 완성됩니다!
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateAIPlan}
                    className="px-4 py-2 rounded-xl bg-[#004B87] hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>지금 계획서 자동 생성하기</span>
                  </button>
                </div>
              )}
            </div>

            {/* Checklist Box at bottom */}
            <div className="mt-4 pt-3 border-t border-slate-100 bg-blue-50/40 rounded-xl p-3 text-xs space-y-1.5">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                숭실대 심의위원회 필수 체크포인트:
              </span>
              <ul className="text-slate-600 space-y-1 pl-4 list-disc text-[11px]">
                <li>융합 대상 학과 중 1인의 주임/지도교수 위촉 상담 날인이 필요합니다.</li>
                <li>기존 복수전공과 80% 이상 유사할 경우 반려될 수 있으니 차별성을 명시해야 합니다.</li>
                <li>학위 수여 학기 전까지 36학점(전필/전선 포함) 이상 이수 완료해야 합니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Semester Roadmap Modal */}
      <RoadmapModal
        isOpen={isRoadmapModalOpen}
        onClose={() => setIsRoadmapModalOpen(false)}
        majorTitleKo={majorTitleKo}
        majorTitleEn={majorTitleEn}
        degreeType={degreeType}
        targetCareer={targetCareer}
        basketCourses={basketCourses}
        profile={profile}
        onAskChatbotWithPrompt={onAskChatbotWithPrompt}
        onSaveProposalWithRoadmap={handleSaveProposalWithRoadmap}
      />
    </div>
  );
};
