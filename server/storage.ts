import fs from 'fs';
import path from 'path';

export interface BackendStorageSchema {
  profile: {
    studentName: string;
    studentId: string;
    college: string;
    primaryMajor: string;
    currentSemester: number;
    interestedMajorType: string;
    secondaryMajorName?: string;
    careerGoal: string;
    completedCredits: number;
    targetTotalCredits: number;
    chapelSemestersPassed: number;
    gpa: number;
  };
  chatHistory: Array<{
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: string;
    suggestedActions?: Array<{
      label: string;
      actionType: 'prompt' | 'navigate';
      value: string;
    }>;
  }>;
  proposals: Array<{
    id: string;
    majorTitleKo: string;
    majorTitleEn: string;
    degreeType: string;
    targetDepartments: string[];
    targetCareer: string;
    userRationale: string;
    courses: Array<{
      id: string;
      code: string;
      name: string;
      credits: number;
      department: string;
      category: string;
      recommendedYear: number;
      description: string;
      tags: string[];
    }>;
    totalCredits: number;
    generatedPlan?: string;
    roadmap?: any[];
    createdAt: string;
    updatedAt: string;
  }>;
  graduation: {
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
    lastUpdated: string;
  };
  activeDraft?: {
    majorTitleKo: string;
    majorTitleEn: string;
    degreeType: string;
    targetDepartments: string[];
    targetCareer: string;
    userRationale: string;
    courses: any[];
    totalCredits: number;
    generatedPlan?: string;
    roadmap?: any[];
    lastSaved: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'ssu-backend-db.json');

const INITIAL_DATA: BackendStorageSchema = {
  profile: {
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
  },
  chatHistory: [
    {
      id: 'welcome-1',
      role: 'model',
      timestamp: '방금 전',
      content: `반갑습니다, **김숭실** 학우님! 숭실대학교 다전공·진로 설계 전문 어드바이저 **슈멘토(SSUMentor)**입니다. 🐴💙

현재 학우님의 주전공은 **경영학부**이며, 현재 **3학기차**(이수학점: 48/130학점), 희망 진로는 **핀테크 프로덕트 매니저 (PM / 퀀트)**로 설정되어 있네요.

[서버 데이터베이스 연동 완료 💾]
상담 대화 내용, 학생설계융합전공 기획안, 졸업 요건 시뮬레이션 상태가 백엔드 서버에 영구 보관됩니다.

어떤 진로와 다전공에 대해 상담해 드릴까요?`,
      suggestedActions: [
        { label: '학생설계전공 기획실 가기', actionType: 'navigate', value: 'major-studio' },
        { label: '졸업 요건 계산기 확인', actionType: 'navigate', value: 'graduation' },
      ],
    },
  ],
  proposals: [
    {
      id: 'prop-default-1',
      majorTitleKo: '핀테크알고리즘투자학',
      majorTitleEn: 'FinTech & Algorithmic Investment',
      degreeType: '경영학사',
      targetDepartments: ['경영학부', '컴퓨터학부', '금융학부'],
      targetCareer: '핀테크 프로덕트 매니저(PM), 퀀트 트레이더',
      userRationale: '금융공학 이론과 컴퓨터 사이언스를 융합하여 데이터 기반의 자동 매매 알고리즘과 차세대 핀테크 서비스를 설계할 수 있는 실무 융합 인재 양성',
      totalCredits: 36,
      courses: [
        { id: 'c1', code: 'CSE2001', name: '자료구조', credits: 3, department: '컴퓨터학부', category: '전공기초', recommendedYear: 2, description: '금융 시계열 데이터 저장을 위한 핵심 자료구조', tags: ['자료구조'] },
        { id: 'c2', code: 'MGT1001', name: '경영학원론', credits: 3, department: '경영학부', category: '전공기초', recommendedYear: 2, description: '기업 거버넌스 및 자본시장 작동 원리', tags: ['기초'] },
        { id: 'c3', code: 'CSE3001', name: '데이터베이스', credits: 3, department: '컴퓨터학부', category: '전공기초', recommendedYear: 2, description: '금융 트랜잭션 데이터의 안정적 영속화', tags: ['DB'] },
        { id: 'c4', code: 'FIN2001', name: '금융시장론', credits: 3, department: '금융학부', category: '전공필수', recommendedYear: 2, description: '자본시장 및 금리 매커니즘 이해', tags: ['금융'] },
        { id: 'c5', code: 'FIN3001', name: '투자론', credits: 3, department: '금융학부', category: '전공필수', recommendedYear: 3, description: '포트폴리오 이론 및 CAPM 자산가격 결정', tags: ['투자'] },
        { id: 'c6', code: 'CSE2002', name: '알고리즘', credits: 3, department: '컴퓨터학부', category: '전공필수', recommendedYear: 3, description: '트레이딩 규칙 최적화 및 복잡도 분석', tags: ['알고리즘'] },
        { id: 'c7', code: 'FIN3002', name: '금융공학개론', credits: 3, department: '금융학부', category: '전공선택', recommendedYear: 3, description: '파생상품 및 몬테카를로 시뮬레이션', tags: ['금융공학'] },
        { id: 'c8', code: 'MGT3001', name: '경영정보시스템(MIS)', credits: 3, department: '경영학부', category: '전공선택', recommendedYear: 3, description: '오픈뱅킹, 마이데이터 및 결제 API 인프라', tags: ['MIS'] },
        { id: 'c9', code: 'FIN4001', name: '알고리즘트레이딩', credits: 3, department: '금융학부', category: '전공선택', recommendedYear: 4, description: '백테스팅 및 실전 팩터 투자 전략', tags: ['알고리즘'] },
        { id: 'c10', code: 'CSE4001', name: '인공지능개론', credits: 3, department: '컴퓨터학부', category: '전공선택', recommendedYear: 4, description: '주가 예측 머신러닝 모델 및 딥러닝 응용', tags: ['AI'] },
        { id: 'c11', code: 'MGT3002', name: '프로덕트매니지먼트', credits: 3, department: '경영학부', category: '전공선택', recommendedYear: 4, description: '핀테크 앱 런칭 및 사용자 경험 설계', tags: ['PM'] },
        { id: 'c12', code: 'CS999', name: '핀테크캡스톤디자인', credits: 3, department: '컴퓨터학부', category: '전공선택', recommendedYear: 4, description: '모의투자 엔진 및 핀테크 서비스 구축 프로젝트', tags: ['캡스톤'] },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  graduation: {
    generalRequiredCredits: 14,
    generalElectiveCredits: 12,
    primaryMajorCredits: 24,
    multiMajorCredits: 12,
    freeElectiveCredits: 6,
    chapelCount: 3,
    passedBible: true,
    passedEnglishCert: false,
    passedVolunteer: true,
    passedGradThesis: false,
    lastUpdated: new Date().toISOString(),
  },
};

export class BackendStorageService {
  private static instance: BackendStorageService;

  private constructor() {
    this.ensureDataFile();
  }

  public static getInstance(): BackendStorageService {
    if (!BackendStorageService.instance) {
      BackendStorageService.instance = new BackendStorageService();
    }
    return BackendStorageService.instance;
  }

  private ensureDataFile(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('Failed to ensure data file:', err);
    }
  }

  public getAll(): BackendStorageSchema {
    this.ensureDataFile();
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading storage, restoring defaults:', err);
      return INITIAL_DATA;
    }
  }

  private saveAll(data: BackendStorageSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving data to storage:', err);
    }
  }

  // Profile
  public getProfile() {
    return this.getAll().profile;
  }

  public updateProfile(updatedProfile: Partial<BackendStorageSchema['profile']>) {
    const data = this.getAll();
    data.profile = { ...data.profile, ...updatedProfile };
    this.saveAll(data);
    return data.profile;
  }

  // Chat
  public getChatHistory() {
    return this.getAll().chatHistory;
  }

  public addChatMessage(message: BackendStorageSchema['chatHistory'][0]) {
    const data = this.getAll();
    data.chatHistory.push(message);
    this.saveAll(data);
    return data.chatHistory;
  }

  public setChatHistory(history: BackendStorageSchema['chatHistory']) {
    const data = this.getAll();
    data.chatHistory = history;
    this.saveAll(data);
    return data.chatHistory;
  }

  public clearChatHistory() {
    const data = this.getAll();
    const welcome = INITIAL_DATA.chatHistory[0];
    welcome.timestamp = '방금 전';
    data.chatHistory = [welcome];
    this.saveAll(data);
    return data.chatHistory;
  }

  // Proposals (Student-designed major plans)
  public getProposals() {
    return this.getAll().proposals;
  }

  public saveProposal(proposal: Omit<BackendStorageSchema['proposals'][0], 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
    const data = this.getAll();
    const now = new Date().toISOString();

    if (proposal.id) {
      const idx = data.proposals.findIndex((p) => p.id === proposal.id);
      if (idx !== -1) {
        data.proposals[idx] = {
          ...data.proposals[idx],
          ...proposal,
          id: proposal.id,
          updatedAt: now,
        };
        this.saveAll(data);
        return data.proposals[idx];
      }
    }

    const newId = `prop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newProp = {
      ...proposal,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    data.proposals.unshift(newProp);
    this.saveAll(data);
    return newProp;
  }

  public deleteProposal(id: string) {
    const data = this.getAll();
    data.proposals = data.proposals.filter((p) => p.id !== id);
    this.saveAll(data);
    return data.proposals;
  }

  // Graduation
  public getGraduation() {
    return this.getAll().graduation;
  }

  public updateGraduation(updatedGraduation: Partial<BackendStorageSchema['graduation']>) {
    const data = this.getAll();
    data.graduation = {
      ...data.graduation,
      ...updatedGraduation,
      lastUpdated: new Date().toISOString(),
    };
    this.saveAll(data);
    return data.graduation;
  }

  // Active Draft
  public getActiveDraft() {
    return this.getAll().activeDraft || null;
  }

  public saveActiveDraft(draft: BackendStorageSchema['activeDraft']) {
    const data = this.getAll();
    data.activeDraft = {
      ...draft,
      lastSaved: new Date().toISOString(),
    } as any;
    this.saveAll(data);
    return data.activeDraft;
  }

  // Diagnostic Stats
  public getStats() {
    this.ensureDataFile();
    const data = this.getAll();
    let fileSize = 0;
    try {
      const stats = fs.statSync(DB_FILE);
      fileSize = stats.size;
    } catch {}

    return {
      filePath: DB_FILE,
      fileSizeKb: (fileSize / 1024).toFixed(2),
      profileName: data.profile.studentName,
      chatMessagesCount: data.chatHistory.length,
      savedProposalsCount: data.proposals.length,
      hasActiveDraft: !!data.activeDraft,
      lastGraduationUpdate: data.graduation.lastUpdated,
      serverTime: new Date().toISOString(),
    };
  }
}

export const backendStorage = BackendStorageService.getInstance();
