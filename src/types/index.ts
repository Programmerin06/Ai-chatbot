export type MultiMajorType =
  | 'double_major' // 복수전공
  | 'minor' // 부전공
  | 'interdisciplinary' // 연계전공
  | 'convergence' // 융합전공
  | 'micro_degree' // 마이크로전공
  | 'student_designed'; // 학생설계융합전공

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  department: string;
  category: '전공기초' | '전공필수' | '전공선택' | '교양필수' | '교양선택';
  recommendedYear: number;
  description: string;
  tags: string[];
}

export interface Department {
  id: string;
  name: string;
  college: string;
  description: string;
  doubleMajorCredits: number;
  minorCredits: number;
  popularSynergies: string[];
  careerPaths: string[];
  sampleCourses: Course[];
}

export interface StudentProfile {
  studentName: string;
  studentId: string;
  college: string;
  primaryMajor: string;
  currentSemester: number; // 1 ~ 8
  interestedMajorType: MultiMajorType;
  secondaryMajorName?: string;
  careerGoal: string;
  completedCredits: number;
  targetTotalCredits: number;
  chapelSemestersPassed: number; // out of 6
  gpa: number; // 4.5 scale
}

export interface GraduationRequirementItem {
  id: string;
  category: '교양필수' | '교양선택' | '주전공' | '다전공' | '일반선택' | '기타인증';
  name: string;
  required: number;
  current: number;
  unit: string;
  isPassed: boolean;
  note?: string;
}

export interface RoadmapCourse {
  id?: string;
  name: string;
  credits: number;
  category: string; // '학생설계전공' | '주전공' | '베어드교필' | '균형교양' | '일반선택'
  department?: string;
  isDesignMajorCourse?: boolean;
  description?: string;
}

export interface SemesterSchedule {
  semesterNumber: number; // 1 ~ 8
  year: number; // 1 ~ 4
  term: 1 | 2; // 1학기 | 2학기
  isCompleted: boolean;
  isCurrent: boolean;
  courses: RoadmapCourse[];
  totalCredits: number;
  semesterGoal: string;
  keyMilestones?: string[];
}

export interface StudentDesignedMajorProposal {
  id?: string;
  majorTitleKo: string;
  majorTitleEn: string;
  degreeType: '문학사' | '공학사' | '경영학사' | '이학사' | '융합학사' | string;
  targetDepartments: string[];
  objective: string;
  rationale: string;
  careerProspects: string[];
  courses: Course[];
  totalCredits: number;
  advisorName?: string;
  status: 'draft' | 'reviewing' | 'approved';
  roadmap?: SemesterSchedule[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: 'prompt' | 'navigate';
    value: string;
  }[];
}

