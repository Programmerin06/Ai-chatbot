import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  HelpCircle, 
  BookOpen, 
  Sparkles, 
  Award, 
  Check, 
  Printer, 
  TrendingUp,
  Clock,
  HeartHandshake,
  Save
} from 'lucide-react';
import { StudentProfile } from '../types';
import { api, GraduationData } from '../services/api';

interface GraduationTabProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onAskChatbot: (prompt: string) => void;
}

export const GraduationTab: React.FC<GraduationTabProps> = ({
  profile,
  onUpdateProfile,
  onAskChatbot,
}) => {
  // Credits breakdown state
  const [generalRequiredCredits, setGeneralRequiredCredits] = useState<number>(14); // 교필
  const [generalElectiveCredits, setGeneralElectiveCredits] = useState<number>(12); // 교선
  const [primaryMajorCredits, setPrimaryMajorCredits] = useState<number>(24); // 주전공
  const [multiMajorCredits, setMultiMajorCredits] = useState<number>(12); // 다전공
  const [freeElectiveCredits, setFreeElectiveCredits] = useState<number>(6); // 일선

  // Mandatory Certifications Checklist
  const [chapelCount, setChapelCount] = useState<number>(profile.chapelSemestersPassed || 3);
  const [passedBible, setPassedBible] = useState<boolean>(true);
  const [passedEnglishCert, setPassedEnglishCert] = useState<boolean>(false);
  const [passedVolunteer, setPassedVolunteer] = useState<boolean>(true);
  const [passedGradThesis, setPassedGradThesis] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Load from backend on mount
  useEffect(() => {
    async function loadGradData() {
      try {
        const data = await api.getGraduation();
        if (data) {
          setGeneralRequiredCredits(data.generalRequiredCredits ?? 14);
          setGeneralElectiveCredits(data.generalElectiveCredits ?? 12);
          setPrimaryMajorCredits(data.primaryMajorCredits ?? 24);
          setMultiMajorCredits(data.multiMajorCredits ?? 12);
          setFreeElectiveCredits(data.freeElectiveCredits ?? 6);
          setChapelCount(data.chapelCount ?? 3);
          setPassedBible(data.passedBible ?? true);
          setPassedEnglishCert(data.passedEnglishCert ?? false);
          setPassedVolunteer(data.passedVolunteer ?? true);
          setPassedGradThesis(data.passedGradThesis ?? false);
          if (data.lastUpdated) {
            setLastSavedTime(new Date(data.lastUpdated).toLocaleTimeString());
          }
        }
      } catch (err) {
        console.error('Failed to load graduation data from backend:', err);
      }
    }
    loadGradData();
  }, []);

  // Targets
  const targetTotal = profile.targetTotalCredits || 130;
  const currentTotal =
    generalRequiredCredits +
    generalElectiveCredits +
    primaryMajorCredits +
    multiMajorCredits +
    freeElectiveCredits;

  const remainingTotal = Math.max(0, targetTotal - currentTotal);
  const progressPercent = Math.min(100, Math.round((currentTotal / targetTotal) * 100));

  // Semester remaining
  const remainingSemesters = Math.max(1, 8 - profile.currentSemester);
  const creditsPerRemainingSemester = (remainingTotal / remainingSemesters).toFixed(1);

  // Save to backend
  const handleSaveToBackend = async () => {
    setIsSaving(true);
    try {
      const payload: GraduationData = {
        generalRequiredCredits,
        generalElectiveCredits,
        primaryMajorCredits,
        multiMajorCredits,
        freeElectiveCredits,
        chapelCount,
        passedBible,
        passedEnglishCert,
        passedVolunteer,
        passedGradThesis,
      };
      await api.updateGraduation(payload);
      
      // Also sync profile in backend and local
      await api.updateProfile({
        ...profile,
        completedCredits: currentTotal,
        chapelSemestersPassed: chapelCount,
      });
      onUpdateProfile({
        completedCredits: currentTotal,
        chapelSemestersPassed: chapelCount,
      });

      setLastSavedTime(new Date().toLocaleTimeString());
      alert('졸업 요건 시뮬레이션 상태와 총 이수학점이 백엔드 서버에 저장되었습니다!');
    } catch (err: any) {
      alert('백엔드 저장 실패: ' + (err.message || '오류'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConsultChatbot = () => {
    const prompt = `현재 총 130학점 중 ${currentTotal}학점을 이수했고 ${remainingTotal}학점이 남았습니다. (현재 ${profile.currentSemester}학기차, 채플 ${chapelCount}/6회, 주전공 ${primaryMajorCredits}학점, 다전공 ${multiMajorCredits}학점). 남은 학기 동안 복수/학생설계전공을 차질 없이 졸업하기 위한 최적의 수강계획을 세워줘!`;
    onAskChatbot(prompt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              숭실대 학사규정 130학점 기준
            </span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              백엔드 DB 자동 동기화 지원
            </span>
            {lastSavedTime && (
              <span className="text-[11px] text-slate-400">
                (최근 저장: {lastSavedTime})
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            🎓 졸업 요건 관리기 및 학점 이수 시뮬레이터
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            다전공(복수/부/연계/학생설계전공) 이수 시 자칫 놓치기 쉬운 필수 교양, 채플, 졸업인증 요건을 
            한눈에 점검하고 남은 학기별 권장 이수 학점을 시뮬레이션하세요. 변경사항은 백엔드 서버에 보관됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSaveToBackend}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="현재 시뮬레이션 상태를 백엔드 서버에 영구 보관"
          >
            <Save className="w-4 h-4 text-emerald-200" />
            <span>{isSaving ? '저장 중...' : '백엔드 저장'}</span>
          </button>
          <button
            onClick={handleConsultChatbot}
            className="px-4 py-2.5 rounded-xl bg-[#004B87] hover:bg-blue-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI 잔여학점 맞춤 플래닝</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            title="졸업 사정 요약표 인쇄"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 130 Credit Overall Progress Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {profile.studentName} 학우의 졸업 이수 진행도
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold text-[#004B87]">{currentTotal}</span>
              <span className="text-slate-400 font-bold text-lg">/ {targetTotal} 학점</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 ml-2">
                {progressPercent}% 달성
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between gap-6 text-slate-600">
              <span>남은 이수 학점:</span>
              <strong className="text-rose-600 font-bold">{remainingTotal} 학점</strong>
            </div>
            <div className="flex items-center justify-between gap-6 text-slate-600">
              <span>남은 정규 학기:</span>
              <strong className="text-slate-900 font-bold">{remainingSemesters} 학기</strong>
            </div>
            <div className="flex items-center justify-between gap-6 text-slate-600 pt-1 border-t border-slate-200">
              <span>학기당 권장 수강:</span>
              <strong className="text-blue-700 font-bold">{creditsPerRemainingSemester} 학점/학기</strong>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
          <div
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-[#004B87] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Credit Categories Interactive Sliders/Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#004B87]" />
              영역별 이수 학점 시뮬레이터
            </h3>
            <span className="text-xs text-slate-500">슬라이더를 조절하여 계획을 세워보세요</span>
          </div>

          <div className="space-y-4">
            {/* 1. 교양필수 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  교양필수 (베어드교양대학)
                  <span className="font-normal text-slate-500 ml-1.5">(기준: 14학점 이상)</span>
                </span>
                <span className="font-bold text-blue-700">{generalRequiredCredits} 학점</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                value={generalRequiredCredits}
                onChange={(e) => setGeneralRequiredCredits(Number(e.target.value))}
                className="w-full accent-[#004B87]"
              />
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>현대인과성서(1), 숭실인성(1), 코딩(3), 글쓰기(3), 영어(3)</span>
                <span className={generalRequiredCredits >= 14 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                  {generalRequiredCredits >= 14 ? '✓ 기준 충족' : `${14 - generalRequiredCredits}학점 필요`}
                </span>
              </div>
            </div>

            {/* 2. 교양선택 */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  교양선택 (핵심/균형교양)
                  <span className="font-normal text-slate-500 ml-1.5">(기준: 15학점 내외)</span>
                </span>
                <span className="font-bold text-blue-700">{generalElectiveCredits} 학점</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={generalElectiveCredits}
                onChange={(e) => setGeneralElectiveCredits(Number(e.target.value))}
                className="w-full accent-[#004B87]"
              />
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>인문, 사회, 자연, 융합 등 3개 이상 영역 균형 이수</span>
                <span className={generalElectiveCredits >= 15 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                  {generalElectiveCredits >= 15 ? '✓ 기준 충족' : `${15 - generalElectiveCredits}학점 필요`}
                </span>
              </div>
            </div>

            {/* 3. 주전공 */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  주전공 이수학점 ({profile.primaryMajor})
                  <span className="font-normal text-slate-500 ml-1.5">(다전공 이수 시 최소 36~42학점)</span>
                </span>
                <span className="font-bold text-blue-700">{primaryMajorCredits} 학점</span>
              </div>
              <input
                type="range"
                min={0}
                max={66}
                value={primaryMajorCredits}
                onChange={(e) => setPrimaryMajorCredits(Number(e.target.value))}
                className="w-full accent-[#004B87]"
              />
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>전공기초 + 전공필수 + 전공선택</span>
                <span className={primaryMajorCredits >= 39 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                  {primaryMajorCredits >= 39 ? '✓ 최소 요건 충족' : `${39 - primaryMajorCredits}학점 필요`}
                </span>
              </div>
            </div>

            {/* 4. 다전공 / 학생설계융합전공 */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  다전공 이수학점 (복수/부/학생설계전공)
                  <span className="font-normal text-slate-500 ml-1.5">(최소 36학점, 부전공은 21학점)</span>
                </span>
                <span className="font-bold text-[#004B87] font-mono">{multiMajorCredits} 학점</span>
              </div>
              <input
                type="range"
                min={0}
                max={54}
                value={multiMajorCredits}
                onChange={(e) => setMultiMajorCredits(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>학생설계융합전공 편성 36학점 규정</span>
                <span className={multiMajorCredits >= 36 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-medium'}>
                  {multiMajorCredits >= 36 ? '✓ 36학점 이수 요건 충족' : `${36 - multiMajorCredits}학점 부족`}
                </span>
              </div>
            </div>

            {/* 5. 일반선택 */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  일반선택 및 기타 잔여학점
                  <span className="font-normal text-slate-500 ml-1.5">(타 학과 개방과목 등)</span>
                </span>
                <span className="font-bold text-blue-700">{freeElectiveCredits} 학점</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={freeElectiveCredits}
                onChange={(e) => setFreeElectiveCredits(Number(e.target.value))}
                className="w-full accent-[#004B87]"
              />
            </div>
          </div>
        </div>

        {/* Mandatory SSU Certifications Checklist (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-[#004B87]" />
              숭실대 필수 졸업인증 체크리스트
            </h3>
            <span className="text-[11px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full font-bold">
              누락 주의
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Chapel 6 Semesters */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  채플 (6학기 이상 P 필수)
                </span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  chapelCount >= 6 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {chapelCount >= 6 ? '완료' : `${6 - chapelCount}학기 남음`}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 text-[11px]">현재 통과 학기 수:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setChapelCount(num)}
                      className={`w-6 h-6 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
                        chapelCount >= num
                          ? 'bg-[#004B87] text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-500'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bible Course */}
            <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors">
              <div>
                <div className="font-bold text-slate-900">현대인과성서 (기독교교양)</div>
                <div className="text-[11px] text-slate-500">베어드교양대학 필수 1학점 이수</div>
              </div>
              <input
                type="checkbox"
                checked={passedBible}
                onChange={(e) => setPassedBible(e.target.checked)}
                className="w-4 h-4 accent-[#004B87] rounded cursor-pointer"
              />
            </label>

            {/* Foreign Language Cert */}
            <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors">
              <div>
                <div className="font-bold text-slate-900">외국어 공인영어 성적 인증</div>
                <div className="text-[11px] text-slate-500">TOEIC / OPIc / 토플 기준 점수 충족</div>
              </div>
              <input
                type="checkbox"
                checked={passedEnglishCert}
                onChange={(e) => setPassedEnglishCert(e.target.checked)}
                className="w-4 h-4 accent-[#004B87] rounded cursor-pointer"
              />
            </label>

            {/* Volunteer / Reading */}
            <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
                  사회봉사 (숭실베어드봉사 32시간)
                </div>
                <div className="text-[11px] text-slate-500">독서인증 또는 봉사활동 인증 통과</div>
              </div>
              <input
                type="checkbox"
                checked={passedVolunteer}
                onChange={(e) => setPassedVolunteer(e.target.checked)}
                className="w-4 h-4 accent-[#004B87] rounded cursor-pointer"
              />
            </label>

            {/* Graduation Thesis / Capstone */}
            <label className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors">
              <div>
                <div className="font-bold text-slate-900">졸업논문 / 종합시험 / 캡스톤</div>
                <div className="text-[11px] text-slate-500">주전공 및 다전공 졸업 심사 합격</div>
              </div>
              <input
                type="checkbox"
                checked={passedGradThesis}
                onChange={(e) => setPassedGradThesis(e.target.checked)}
                className="w-4 h-4 accent-[#004B87] rounded cursor-pointer"
              />
            </label>
          </div>

          {/* SSU Academic tip box */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              💡 숭실대 학점 이월 및 초과 수강신청 팁:
            </span>
            <p className="text-[11px] leading-relaxed">
              직전 정규학기 평점 4.0 이상 취득 시 최대 3학점(총 21~22학점)까지 추가 수강신청이 가능합니다. 다전공 학점 부담을 줄이는 데 적극 활용하세요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
