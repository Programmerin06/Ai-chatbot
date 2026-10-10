import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { backendStorage } from './server/storage';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SSU_ADVISOR_SYSTEM_PROMPT = `
당신은 '숭실대학교(Soongsil University) 다전공 & 진로 설계 전문 수석 어드바이저 슈멘토(SSUMentor)'입니다.
숭실대학교 재학생들이 자신의 적성과 진로 목표에 맞추어 교내 다전공 제도(복수전공, 부전공, 연계전공, 융합전공, 마이크로전공, 그리고 특히 '학생설계융합전공')를 지혜롭게 선택하고, 학과별 최적의 커리큘럼을 이수하며, 130학점 졸업 요건을 차질 없이 달성할 수 있도록 전문적이고 따뜻하게 상담합니다.

[숭실대학교 학사 제도 지식 베이스]
1. 졸업 요건 공통:
   - 총 취득학점 130학점 이상 (일부 공학/건축 등 제외).
   - 베어드교양대학 필수교양(교필): 현대인과성서(1학점), 숭실인성과리더십(1학점), 컴퓨팅적사고와코딩(3학점), 창의적사고와글쓰기(3학점), 대학영어(글로벌영어)(3학점) 등.
   - 채플: 6학기 이상 P(Pass) 필수.
   - 졸업인증: 토익/오픽 등 공인어학성적 기준 취득, 독서인증 또는 봉사활동 시간(숭실봉사), 졸업논문/종합시험/캡스톤디자인 통과.

2. 교내 다전공 제도:
   - 복수전공 (Double Major): 주전공 외 타 학과를 제2전공으로 이수. 주전공 최소 36~42학점 + 복수전공 최소 36~42학점 이수 (단과대별 규정 상이). 2개 정규 학위 수여.
   - 부전공 (Minor): 타 학과 21학점 이상 이수. 주전공 학위증에 부전공으로 기재.
   - 연계전공 (Interdisciplinary Major): 2개 이상 학과가 협력하여 구성한 기설치 융합 전공 (예: 빅데이터금융, 인공지능인문학, 헬스케어데이터, 스마트물류 등). 36학점 이상 이수.
   - 융합전공 / 마이크로전공: 특정 산업 트렌드 집중 이수 (마이크로 9~15학점으로 부담 없이 취득 가능).
   - 학생설계융합전공 (Student-Designed Convergence Major): ★숭실대의 대표 혁신 제도★
     - 기존에 개설되지 않은 새로운 학문/진로 분야를 학생이 직접 기획.
     - 2개 이상의 학과(부)에서 최소 36학점 이상(전공기초/필수/선택)의 교육과정을 직접 편성하여 신청.
     - 절차: 진로 및 융합 테마 설정 -> 주임교수 1인 섭외 및 승인 -> '전공계획서 및 교육과정 편성표' 작성 -> 교육혁신원/교육과정심의위원회 심의 -> 학과 승인 및 포털 신청.
     - 성공 팁: 기존 복수전공이나 연계전공과의 '차별성', 왜 두 학문이 융합되어야 하는지의 '사회적·산업적 필요성', 전공 교과목의 '선후수 체계(기초->심화)'를 명확히 제시해야 심의 통과율이 높음.

3. 숭실대학교 주요 학과 풀:
   - IT대학: 컴퓨터학부, 소프트웨어학부, AI융합학부, 정보통신전자공학부, 글로벌미디어학부, 전자정보공학부
   - 경영대학: 경영학부, 벤처중소기업학과, 금융학부, 회계학과
   - 경제통상대학: 경제학과, 글로벌통상학과
   - 사회과학대학: 언론홍보학과, 행정학부, 정치외교학과, 정보사회학과, 사회복지학부
   - 인문대학: 국어국문학과, 영어영문학과, 독어독문학과, 불어불문학과, 중어중문학과, 일어일문학과, 철학과, 사학과, 평생교육학과
   - 자연과학대학: 수학과, 물리학과, 화학과, 의생명시스템학부
   - 공과대학: 화학공학과, 신소재공학과, 전기공학부, 기계공학부, 산업·정보시스템공학과, 건축학부

[답변 스타일 및 원칙]
- 친절하고 격려하며, 전문 컨설턴트처럼 구체적이고 체계적으로 답변합니다.
- 이모지와 가독성 높은 Markdown (제목, 불릿포인트, 표, 강조)을 적극 활용합니다.
- 학생이 질문할 때 주전공과 희망 진로가 있다면, 현실적인 과목명(실제 숭실대 개설 교과목 기반: 예: 자료구조, 인공지능개론, 마케팅원론, 데이터베이스, 파이썬프로그래밍, 디지털콘텐츠기획 등)과 함께 학기별 로드맵을 제안하세요.
- 학생설계융합전공을 제안할 때는 매력적인 '전공명(예: 핀테크알고리즘학, 디지털문화콘텐츠공학, 헬스케어데이터사이언스 등)'과 이수 전략, 심의 통과 팁을 함께 전달합니다.
- 졸업 요건(130학점, 채플 6학기, 베어드 교필, 영어성적 등)과 수강신청 시 학점 초과/이월 팁(성적 우수자 학점 추가 신청 등)도 리마인드해 주세요.
`;

// ==========================================
// BACKEND STORAGE REST ENDPOINTS
// ==========================================

// Get all persisted data at once
app.get('/api/storage/all', (req, res) => {
  try {
    const data = backendStorage.getAll();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: '데이터 불러오기 실패: ' + err.message });
  }
});

// Profile endpoints
app.get('/api/storage/profile', (req, res) => {
  try {
    const profile = backendStorage.getProfile();
    res.json({ profile });
  } catch (err: any) {
    res.status(500).json({ error: '프로필 불러오기 실패' });
  }
});

app.put('/api/storage/profile', (req, res) => {
  try {
    const updated = backendStorage.updateProfile(req.body);
    res.json({ profile: updated, message: '학생 프로필이 백엔드 서버에 저장되었습니다.' });
  } catch (err: any) {
    res.status(500).json({ error: '프로필 저장 실패' });
  }
});

// Chat history endpoints
app.get('/api/storage/chat', (req, res) => {
  try {
    const chatHistory = backendStorage.getChatHistory();
    res.json({
      chatHistory,
      totalCount: chatHistory.length,
      storageType: 'backend_persistent_json',
      serverTime: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: '대화 기록 불러오기 실패: ' + err.message });
  }
});

app.post('/api/storage/chat/message', (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: '메시지가 없습니다.' });
    const chatHistory = backendStorage.addChatMessage(message);
    res.json({ chatHistory, message: '메시지가 백엔드 API를 통해 저장되었습니다.' });
  } catch (err: any) {
    res.status(500).json({ error: '메시지 저장 실패' });
  }
});

app.put('/api/storage/chat', (req, res) => {
  try {
    const chatHistory = backendStorage.setChatHistory(req.body.history || []);
    res.json({
      chatHistory,
      totalCount: chatHistory.length,
      message: '대화 기록이 백엔드 API에 성공적으로 저장되었습니다.',
      savedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: '대화 기록 저장 실패: ' + err.message });
  }
});

app.delete('/api/storage/chat', (req, res) => {
  try {
    const chatHistory = backendStorage.clearChatHistory();
    res.json({
      chatHistory,
      message: '백엔드 서버의 대화 기록이 초기화되었습니다.',
      clearedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: '대화 기록 초기화 실패: ' + err.message });
  }
});

// Student-designed major proposals endpoints
app.get('/api/storage/proposals', (req, res) => {
  try {
    const proposals = backendStorage.getProposals();
    res.json({ proposals });
  } catch (err: any) {
    res.status(500).json({ error: '기획안 목록 불러오기 실패' });
  }
});

app.post('/api/storage/proposals', (req, res) => {
  try {
    const saved = backendStorage.saveProposal(req.body);
    const proposals = backendStorage.getProposals();
    res.json({ proposal: saved, proposals, message: '학생설계융합전공 기획안이 백엔드 서버에 저장되었습니다.' });
  } catch (err: any) {
    res.status(500).json({ error: '기획안 저장 실패: ' + err.message });
  }
});

app.delete('/api/storage/proposals/:id', (req, res) => {
  try {
    const proposals = backendStorage.deleteProposal(req.params.id);
    res.json({ proposals, message: '기획안이 삭제되었습니다.' });
  } catch (err: any) {
    res.status(500).json({ error: '기획안 삭제 실패' });
  }
});

// Graduation state endpoints
app.get('/api/storage/graduation', (req, res) => {
  try {
    const graduation = backendStorage.getGraduation();
    res.json({ graduation });
  } catch (err: any) {
    res.status(500).json({ error: '졸업 요건 데이터 불러오기 실패' });
  }
});

app.put('/api/storage/graduation', (req, res) => {
  try {
    const graduation = backendStorage.updateGraduation(req.body);
    res.json({ graduation, message: '졸업 요건 시뮬레이션 상태가 백엔드 서버에 저장되었습니다.' });
  } catch (err: any) {
    res.status(500).json({ error: '졸업 요건 저장 실패' });
  }
});

// Active working draft endpoints for MajorStudio
app.get('/api/storage/draft', (req, res) => {
  try {
    const draft = backendStorage.getActiveDraft();
    res.json({ draft });
  } catch (err: any) {
    res.status(500).json({ error: '작업 드래프트 불러오기 실패' });
  }
});

app.put('/api/storage/draft', (req, res) => {
  try {
    const draft = backendStorage.saveActiveDraft(req.body);
    res.json({ draft, message: '작업 중인 기획안이 백엔드 서버에 자동 저장되었습니다.' });
  } catch (err: any) {
    res.status(500).json({ error: '작업 드래프트 저장 실패' });
  }
});

// Storage diagnostics and stats
app.get('/api/storage/stats', (req, res) => {
  try {
    const stats = backendStorage.getStats();
    res.json({ stats });
  } catch (err: any) {
    res.status(500).json({ error: '스토리지 상태 조회 실패' });
  }
});

// ==========================================
// GEMINI AI ADVISOR ENDPOINTS
// ==========================================

// Chat endpoint with auto-persistence in backend storage
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], studentProfile } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Persist user message to backend
    backendStorage.addChatMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: timeString,
    });

    // Build context prefix if student profile is provided
    let contextNote = '';
    const activeProf = studentProfile || backendStorage.getProfile();
    if (activeProf) {
      contextNote = `\n[학생 기본 정보: 주전공=${activeProf.primaryMajor || '미지정'}, 희망진로=${activeProf.careerGoal || '미정'}, 관심다전공=${activeProf.interestedMajorType || '미정'}, 현재학기=${activeProf.currentSemester || '1학기'}, 이수학점=${activeProf.completedCredits || 0}학점]\n`;
    }

    // Construct contents array for Gemini API
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add previous history
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-10)) {
        contents.push({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.content || item.text || '' }],
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: `${contextNote}${message}` }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: SSU_ADVISOR_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const reply = response.text || '답변을 생성하지 못했습니다. 다시 시도해 주세요.';

    // Persist AI response to backend with quick action suggestions
    const modelMessage = {
      id: `model-${Date.now()}`,
      role: 'model' as const,
      content: reply,
      timestamp: timeString,
      suggestedActions: [
        { label: '학생설계전공 기획실 가기', actionType: 'navigate' as const, value: 'major-studio' },
        { label: '졸업 요건 계산기 확인', actionType: 'navigate' as const, value: 'graduation' },
      ],
    };
    backendStorage.addChatMessage(modelMessage);

    const fullHistory = backendStorage.getChatHistory();

    res.json({
      reply,
      savedInBackend: true,
      storageType: 'backend_api',
      chatHistory: fullHistory,
    });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    res.status(500).json({
      error: '상담 답변 생성 중 오류가 발생했습니다: ' + (err.message || '서버 오류'),
    });
  }
});

// Student-Designed Major AI Plan Generator
app.post('/api/design-major-plan', async (req, res) => {
  try {
    const { majorTitle, targetCareer, targetDepartments, userDescription } = req.body;

    const prompt = `
숭실대학교 '학생설계융합전공 계획서' 공식 심의 통과를 위한 고품질 전공 설계안을 작성해줘.

- 제안 전공명: ${majorTitle || '미정 (가장 적합한 명칭으로 제안)'}
- 희망 진로 및 직무: ${targetCareer || '자율 추천'}
- 융합 대상 학과들: ${(targetDepartments || []).join(', ') || '관련 학과 자율 매칭'}
- 학생의 설계 의도/설명: ${userDescription || '없음'}

다음 항목들을 포함하여 전문적인 보고서 형식(Markdown)으로 정밀하게 작성해줘:
1. 💡 전공 명칭 및 수여 학위명 (국문/영문, 학위 구분: 예: 문학사, 공학사, 경영학사)
2. 🎯 교육 목표 및 인재상
3. 🔬 융합의 필요성 및 사회적·산업적 수요 (기존 일반 복수전공/연계전공과의 차별성)
4. 📚 추천 교육과정 편성표 (최소 36학점, 총 12개 교과목: 전공기초 3과목, 전공필수 3과목, 전공선택 6과목 구성. 과목명, 개설학과, 학점, 과목 개요 표로 작성)
5. 🗺️ 학년별 이수 로드맵 (2학년 1학기 ~ 4학년 2학기)
6. 🎓 졸업 후 진출 분야 및 포트폴리오/캡스톤 프로젝트 주제 예시 (3가지)
7. 📋 숭실대학교 교육과정심의위원회 심의 통과를 위한 지도교수 매칭 및 계획서 작성 꿀팁
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SSU_ADVISOR_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    res.json({ plan: response.text });
  } catch (err: any) {
    console.error('Design Major API Error:', err);
    res.status(500).json({ error: '전공 설계안 생성 중 오류: ' + (err.message || '서버 오류') });
  }
});

// 8-Semester Roadmap AI Advisory Endpoint
app.post('/api/generate-roadmap-advice', async (req, res) => {
  try {
    const { majorTitle, primaryMajor, currentSemester, targetCareer, roadmap } = req.body;

    const prompt = `
숭실대학교 재학생의 '학생설계융합전공 8학기 이수 로드맵'에 대한 전문적인 학사 및 커리어 어드바이징 보고서를 작성해줘.

- 학생 주전공: ${primaryMajor || '경영학부'}
- 학생설계융합전공: ${majorTitle || '미정'}
- 현재 학기: ${currentSemester || 3}학기차 (현재 시점 이후 남은 학기 집중 점검)
- 목표 진로: ${targetCareer || '미정'}

[8학기 편성 로드맵 요약 데이터]:
${JSON.stringify(roadmap, null, 2)}

다음 항목을 체계적인 Markdown 형식으로 전문성 있게 분석해줘:
1. 🧭 로드맵 종합 평가 및 이수 밸런스 분석 (선수과목 이수 순서, 학기별 학점 배분 적절성)
2. ⚠️ 남은 학기(${currentSemester || 3}학기 ~ 8학기) 동안 수강 시 주의점 (학기당 18~19학점 적정선 유지, 계절학기 활용 권장)
3. 🎯 학기별 커리어 마일스톤 가이드 (자격증, 포트폴리오, 공모전, 지도교수 면담, 캡스톤디자인 시기)
4. 📋 교육과정심의위원회 심의 시 로드맵 제시 및 지도교수 승인을 이끌어내는 핵심 설득 포인트
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SSU_ADVISOR_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    res.json({ advice: response.text });
  } catch (err: any) {
    console.error('Roadmap advice error:', err);
    res.status(500).json({ error: '로드맵 분석 생성 실패: ' + (err.message || '서버 오류') });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    storageReady: true 
  });
});

// Serve frontend in production or via Vite in dev
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`숭실대 다전공 백엔드 서버 및 데이터베이스 실행 중: http://0.0.0.0:${PORT}`);
  });
}

startServer();
