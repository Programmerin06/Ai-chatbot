/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatTab } from './components/ChatTab';
import { MajorStudioTab } from './components/MajorStudioTab';
import { CurriculumTab } from './components/CurriculumTab';
import { GraduationTab } from './components/GraduationTab';
import { SystemGuideModal } from './components/SystemGuideModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { DatabaseModal } from './components/DatabaseModal';
import { StudentProfile } from './types';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState<boolean>(false);
  const [chatPrefillPrompt, setChatPrefillPrompt] = useState<string>('');

  // Student profile state
  const [profile, setProfile] = useState<StudentProfile>({
    studentName: '김숭실',
    studentId: '20241234',
    college: '경영대학',
    primaryMajor: '경영학부',
    currentSemester: 3,
    interestedMajorType: 'student_designed',
    secondaryMajorName: '핀테크알고리즘투자학',
    careerGoal: '핀테크 프로덕트 매니저 (PM / 퀀트)',
    completedCredits: 48,
    targetTotalCredits: 130,
    chapelSemestersPassed: 3,
    gpa: 3.85,
  });

  // Load saved profile from backend on mount
  useEffect(() => {
    async function initData() {
      try {
        const savedProfile = await api.getProfile();
        if (savedProfile) {
          setProfile(savedProfile);
        }
      } catch (err) {
        console.error('Failed to initialize profile from backend:', err);
      }
    }
    initData();
  }, []);

  const handleUpdateProfile = (updated: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleNavigateWithPrompt = (prompt: string) => {
    setChatPrefillPrompt(prompt);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-blue-200">
      {/* University Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
      />

      {/* Main Tab Body */}
      <main className="flex-1 pb-10">
        {activeTab === 'chat' && (
          <ChatTab
            profile={profile}
            onNavigateTab={(tab) => setActiveTab(tab)}
            prefillPrompt={chatPrefillPrompt}
            onClearPrefillPrompt={() => setChatPrefillPrompt('')}
          />
        )}

        {activeTab === 'major-studio' && (
          <MajorStudioTab
            profile={profile}
            onAskChatbotAboutPlan={(planTitle) => {
              handleNavigateWithPrompt(`[${planTitle}] 학생설계융합전공 기획안의 교육과정 편성 타당성과 심의위원회 통과 전략에 대해 자세히 조언해줘!`);
            }}
            onAskChatbotWithPrompt={handleNavigateWithPrompt}
          />
        )}

        {activeTab === 'curriculum' && (
          <CurriculumTab
            profile={profile}
            onAskChatbotWithPrompt={handleNavigateWithPrompt}
            onNavigateToStudio={() => setActiveTab('major-studio')}
          />
        )}

        {activeTab === 'graduation' && (
          <GraduationTab
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onAskChatbot={handleNavigateWithPrompt}
          />
        )}
      </main>

      {/* SSU Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">숭실대학교(Soongsil University) 다전공 진로 상담 시스템 슈멘토</span>
            <span>•</span>
            <span>학사지원팀 & 교육혁신원 협력 모델</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Powered by Gemini 3.8 Flash • 130학점 졸업 사정 기준 준수
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SystemGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onSelectTypeForChat={(typeName) => {
          handleNavigateWithPrompt(`숭실대학교 ${typeName} 제도에 대한 신청 자격, 학점 이수 규정, 장단점을 자세히 알려줘!`);
        }}
      />

      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={(updated) => setProfile(updated)}
      />

      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />
    </div>
  );
}
