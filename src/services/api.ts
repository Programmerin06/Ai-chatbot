import { ChatMessage, Course, SemesterSchedule, StudentProfile } from '../types';

export interface SavedProposal {
  id: string;
  majorTitleKo: string;
  majorTitleEn: string;
  degreeType: string;
  targetDepartments: string[];
  targetCareer: string;
  userRationale: string;
  courses: Course[];
  totalCredits: number;
  generatedPlan?: string;
  roadmap?: SemesterSchedule[];
  createdAt: string;
  updatedAt: string;
}

export interface GraduationData {
  generalRequiredCredits: number;
  generalElectiveCredits: number;
  primaryMajorCredits: number;
  multiMajorCredits: number;
  freeElectiveCredits: number;
  chapelCount: number;
  passedBible: boolean;
  passedEnglishCert: boolean;
  passedVolunteer: boolean;
  passedGradThesis: boolean;
  lastUpdated?: string;
}

export const api = {
  // Load everything on initial app startup
  async getAllStorage() {
    const res = await fetch('/api/storage/all');
    if (!res.ok) throw new Error('백엔드 데이터를 불러오지 못했습니다.');
    return res.json();
  },

  // Profile
  async getProfile(): Promise<StudentProfile> {
    const res = await fetch('/api/storage/profile');
    if (!res.ok) throw new Error('프로필 조회 실패');
    const data = await res.json();
    return data.profile;
  },

  async updateProfile(profile: StudentProfile): Promise<StudentProfile> {
    const res = await fetch('/api/storage/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('프로필 저장 실패');
    const data = await res.json();
    return data.profile;
  },

  // Chat
  async getChatHistory(): Promise<ChatMessage[]> {
    const res = await fetch('/api/storage/chat');
    if (!res.ok) throw new Error('대화 기록 조회 실패');
    const data = await res.json();
    return data.chatHistory || [];
  },

  async getChatHistoryWithMeta(): Promise<{ chatHistory: ChatMessage[]; totalCount: number; serverTime?: string; storageType?: string }> {
    const res = await fetch('/api/storage/chat');
    if (!res.ok) throw new Error('대화 기록 조회 실패');
    return res.json();
  },

  async updateChatHistory(history: ChatMessage[]): Promise<ChatMessage[]> {
    const res = await fetch('/api/storage/chat', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history }),
    });
    if (!res.ok) throw new Error('대화 기록 저장 실패');
    const data = await res.json();
    return data.chatHistory;
  },

  async clearChatHistory(): Promise<ChatMessage[]> {
    const res = await fetch('/api/storage/chat', {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('대화 기록 초기화 실패');
    const data = await res.json();
    return data.chatHistory;
  },

  // Proposals
  async getProposals(): Promise<SavedProposal[]> {
    const res = await fetch('/api/storage/proposals');
    if (!res.ok) throw new Error('기획안 목록 조회 실패');
    const data = await res.json();
    return data.proposals;
  },

  async saveProposal(proposal: Omit<SavedProposal, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<{ proposal: SavedProposal; proposals: SavedProposal[] }> {
    const res = await fetch('/api/storage/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposal),
    });
    if (!res.ok) throw new Error('기획안 저장 실패');
    return res.json();
  },

  async deleteProposal(id: string): Promise<SavedProposal[]> {
    const res = await fetch(`/api/storage/proposals/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('기획안 삭제 실패');
    const data = await res.json();
    return data.proposals;
  },

  // Graduation
  async getGraduation(): Promise<GraduationData> {
    const res = await fetch('/api/storage/graduation');
    if (!res.ok) throw new Error('졸업 요건 조회 실패');
    const data = await res.json();
    return data.graduation;
  },

  async updateGraduation(graduation: GraduationData): Promise<GraduationData> {
    const res = await fetch('/api/storage/graduation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graduation),
    });
    if (!res.ok) throw new Error('졸업 요건 저장 실패');
    const data = await res.json();
    return data.graduation;
  },

  // Active Draft
  async getActiveDraft() {
    const res = await fetch('/api/storage/draft');
    if (!res.ok) throw new Error('드래프트 조회 실패');
    const data = await res.json();
    return data.draft;
  },

  async saveActiveDraft(draft: any) {
    const res = await fetch('/api/storage/draft', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (!res.ok) throw new Error('드래프트 저장 실패');
    const data = await res.json();
    return data.draft;
  },

  // Storage Stats
  async getStorageStats() {
    const res = await fetch('/api/storage/stats');
    if (!res.ok) throw new Error('스토리지 통계 조회 실패');
    const data = await res.json();
    return data.stats;
  },
};
