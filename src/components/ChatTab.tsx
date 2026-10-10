import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  HelpCircle,
  Compass,
  FileText,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
  Database,
  RefreshCw,
  CloudUpload,
  CloudDownload,
  Server
} from 'lucide-react';
import { ChatMessage, StudentProfile } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { api } from '../services/api';

interface ChatTabProps {
  profile: StudentProfile;
  onNavigateTab: (tab: string) => void;
  onApplyPlanToStudio?: (planText: string) => void;
  prefillPrompt?: string;
  onClearPrefillPrompt?: () => void;
}

const QUICK_PROMPTS = [
  {
    category: '학생설계융합전공',
    text: '경영학부생인데 핀테크 & 퀀트 알고리즘으로 학생설계융합전공을 만들고 싶어요. 추천 과목과 계획서 작성 팁을 알려줘!',
  },
  {
    category: '복수전공 vs 연계전공',
    text: '컴퓨터학부 복수전공과 빅데이터/AI 연계전공 중 취업과 학점 부담 측면에서 어떤 게 더 유리할까요?',
  },
  {
    category: '문과 ➜ IT 전환',
    text: '인문대(국어국문/영어영문) 소속인데 IT 서비스 기획이나 개발 직무로 다전공 로드맵을 짜고 싶어요.',
  },
  {
    category: '졸업 요건 & 학점 전략',
    text: '총 130학점 중 복수전공(각 39학점)을 이수하면서 채플 6학기와 베어드 교필을 탈 없이 마치는 학기별 학점 배분 전략을 알려줘.',
  },
  {
    category: '심의 통과 노하우',
    text: '학생설계융합전공 신청 시 교육과정심의위원회 심의에서 자주 탈락하는 이유와 지도교수 위촉 요령을 알려줘.',
  },
];

export const ChatTab: React.FC<ChatTabProps> = ({ 
  profile, 
  onNavigateTab,
  prefillPrompt,
  onClearPrefillPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBackendLoaded, setIsBackendLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefillPrompt) {
      setInput(prefillPrompt);
      if (onClearPrefillPrompt) {
        onClearPrefillPrompt();
      }
    }
  }, [prefillPrompt]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load chat history directly from backend API on initial mount (No localStorage)
  const loadChatFromBackend = async (isManual = false) => {
    setIsSyncing(true);
    try {
      const data = await api.getChatHistoryWithMeta();
      if (data && data.chatHistory && data.chatHistory.length > 0) {
        setMessages(data.chatHistory);
        const timeStr = data.serverTime 
          ? new Date(data.serverTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(timeStr);
        if (isManual) {
          showToast(`백엔드 API에서 대화 기록 ${data.chatHistory.length}건을 성공적으로 불러왔습니다.`);
        }
      } else {
        const initialWelcome: ChatMessage = {
          id: 'welcome-1',
          role: 'model',
          timestamp: '방금 전',
          content: `반갑습니다, **${profile.studentName}** 학우님! 숭실대학교 다전공·진로 설계 전문 어드바이저 **슈멘토(SSUMentor)**입니다. 🐴💙\n\n[백엔드 API 연동 완료 📡]\n모든 대화 내용은 브라우저 로컬 스토리지가 아닌 **Node.js Express 백엔드 API 서버 DB**에 안전하게 영구 저장 및 동기화됩니다.\n\n어떤 다전공이나 진로에 대해 상담을 시작해볼까요?`,
          suggestedActions: [
            { label: '학생설계전공 기획실 가기', actionType: 'navigate', value: 'major-studio' },
            { label: '졸업 요건 계산기 확인', actionType: 'navigate', value: 'graduation' },
          ],
        };
        setMessages([initialWelcome]);
      }
    } catch (err: any) {
      console.error('Failed to load chat history from backend API:', err);
      if (isManual) {
        showToast('⚠️ 백엔드 API에서 대화를 불러오지 못했습니다: ' + err.message);
      }
    } finally {
      setIsSyncing(false);
      setIsBackendLoaded(true);
    }
  };

  useEffect(() => {
    loadChatFromBackend(false);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Send message through backend API
  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    const currentTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: currentTimeString,
    };

    // Optimistically update UI
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call backend /api/chat which automatically persists to backendStorage
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: historyPayload,
          studentProfile: profile,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `서버 오류: ${res.status}`);
      }

      const data = await res.json();
      
      // If server returned the full updated history, sync it directly
      if (data.chatHistory && Array.isArray(data.chatHistory)) {
        setMessages(data.chatHistory);
      } else {
        const modelMessage: ChatMessage = {
          id: `model-${Date.now()}`,
          role: 'model',
          content: data.reply || '답변을 불러오지 못했습니다.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: [
            { label: '학생설계전공 기획실 가기', actionType: 'navigate', value: 'major-studio' },
            { label: '졸업 요건 계산기 확인', actionType: 'navigate', value: 'graduation' },
          ],
        };
        setMessages((prev) => [...prev, modelMessage]);
      }

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ 백엔드 API 통신 중 문제가 발생했습니다: ${err.message || '네트워크 연결 오류'}\n\n잠시 후 다시 시도해 주세요.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Explicitly sync current messages to backend API
  const handleSaveToBackend = async () => {
    setIsSyncing(true);
    try {
      const updatedHistory = await api.updateChatHistory(messages);
      setMessages(updatedHistory);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      showToast(`대화 기록 ${updatedHistory.length}건이 백엔드 API에 안전하게 저장되었습니다.`);
    } catch (err: any) {
      alert('백엔드 API 저장 실패: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear chat through backend API
  const handleClearHistory = async () => {
    if (window.confirm('대화 기록을 초기화하시겠습니까? (백엔드 서버 API를 통해 저장소에서도 완전히 삭제됩니다)')) {
      setIsSyncing(true);
      try {
        const cleared = await api.clearChatHistory();
        setMessages(cleared);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        showToast('백엔드 서버의 대화 기록이 초기화되었습니다.');
      } catch (err: any) {
        console.error('Failed to clear chat on backend:', err);
        setMessages([
          {
            id: 'welcome-reset',
            role: 'model',
            timestamp: '방금 전',
            content: `대화가 초기화되었습니다. **${profile.studentName}** 학우님(${profile.primaryMajor}), 어떤 진로와 다전공에 대해 상담을 시작해볼까요?`,
          },
        ]);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-145px)] max-w-6xl mx-auto px-4 py-4">
      {/* Profile Bar Card */}
      <div className="bg-gradient-to-r from-blue-900 via-[#004B87] to-indigo-900 rounded-2xl p-4 text-white shadow-sm mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg text-white border border-white/20">
            🐴
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{profile.studentName} 학우 맞춤 상담 모드</span>
              <span className="text-[11px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                백엔드 API 실시간 연동 (로컬스토리지 미사용)
              </span>
              <span className="text-[11px] bg-white/20 text-blue-100 px-2 py-0.5 rounded-full font-medium">
                {profile.primaryMajor} • {profile.currentSemester}학기차
              </span>
            </div>
            <p className="text-xs text-blue-100/90 mt-0.5">
              목표: <strong className="text-white underline decoration-blue-300">{profile.careerGoal}</strong> | 관심 다전공:{' '}
              {profile.interestedMajorType === 'student_designed' ? '학생설계융합전공' : profile.interestedMajorType === 'double_major' ? '복수전공' : '연계/융합전공'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onNavigateTab('major-studio')}
            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            학생설계전공 기획실
          </button>
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-colors cursor-pointer"
            title="백엔드 대화 기록 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Backend API Synchronization Status Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 mb-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="flex items-center gap-1.5 font-bold text-[#004B87]">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>백엔드 API 연동 상태:</span>
          </span>
          <span className="text-slate-500 text-[11px] hidden md:inline">
            Express API (GET /api/storage/chat) 영구 보관 중 ({messages.length}개 대화)
          </span>
          {lastSyncTime && (
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono border border-slate-200">
              최근 서버 동기화: {lastSyncTime}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadChatFromBackend(true)}
            disabled={isSyncing || isLoading}
            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#004B87] font-semibold text-[11px] flex items-center gap-1 border border-blue-200 transition-all cursor-pointer disabled:opacity-50"
            title="백엔드 API에서 최신 대화 목록을 다시 불러옵니다"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>서버에서 불러오기</span>
          </button>

          <button
            onClick={handleSaveToBackend}
            disabled={isSyncing || isLoading}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] flex items-center gap-1 border border-emerald-200 transition-all cursor-pointer disabled:opacity-50"
            title="현재 대화 내용을 백엔드 API에 즉시 동기화합니다"
          >
            <CloudUpload className="w-3 h-3" />
            <span>서버에 저장</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-blue-50 border border-blue-300 text-[#004B87] text-xs px-3 py-1.5 rounded-lg mb-2 flex items-center gap-2 animate-fadeIn shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-4 rounded-xl">
        {!isBackendLoaded ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-[#004B87]" />
            <span className="text-xs">백엔드 API에서 대화 기록을 불러오는 중...</span>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#003B6F] to-[#0066B2] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[78%] rounded-2xl p-4 transition-all shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-[#004B87] text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-slate-100">
                  <span className="font-semibold text-xs flex items-center gap-1.5">
                    {msg.role === 'user' ? (
                      <>
                        <span>{profile.studentName}</span>
                        <User className="w-3.5 h-3.5 text-blue-200" />
                      </>
                    ) : (
                      <>
                        <span className="text-[#004B87] font-bold">슈멘토 (SSUMentor)</span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-medium border border-blue-200">
                          숭실대 수석 상담사
                        </span>
                      </>
                    )}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] opacity-70">
                    <span>{msg.timestamp}</span>
                    {msg.role === 'model' && (
                      <button
                        onClick={() => handleCopyText(msg.content, msg.id)}
                        className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                        title="내용 복사"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <MarkdownRenderer content={msg.content} />
                  </div>
                )}

                {/* Action Buttons if available */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => onNavigateTab(act.value)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#004B87] font-semibold flex items-center gap-1 border border-blue-200 transition-colors cursor-pointer"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#003B6F] to-[#0066B2] text-white flex items-center justify-center shadow-xs shrink-0 animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 max-w-[70%] shadow-xs flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                슈멘토가 숭실대 학사 규정 및 최적의 다전공 커리큘럼을 분석하고 백엔드에 기록 중입니다...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="pt-2 pb-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>추천 빠른 질문 (클릭 시 바로 상담):</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt.text)}
              disabled={isLoading}
              className="text-left text-xs bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl px-3 py-2 shrink-0 max-w-xs transition-all shadow-2xs group cursor-pointer disabled:opacity-50"
            >
              <div className="font-bold text-[#004B87] text-[11px] mb-0.5 group-hover:underline">
                [{prompt.category}]
              </div>
              <p className="text-slate-600 text-[11px] line-clamp-1">
                {prompt.text}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="mt-2 bg-white rounded-2xl border border-slate-300 p-2 shadow-sm focus-within:border-[#004B87] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`슈멘토에게 다전공, 학생설계전공, 학과별 추천 과목, 졸업 요건을 질문해보세요... (모든 대화는 백엔드 API에 저장됩니다)`}
            className="flex-1 text-sm bg-transparent px-3 py-2 outline-none text-slate-800 placeholder-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#004B87] hover:bg-[#003B6F] text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            <span>전송</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
