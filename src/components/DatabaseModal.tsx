import React, { useState, useEffect } from 'react';
import { X, Database, RefreshCw, Download, CheckCircle2, HardDrive, FileText, Check } from 'lucide-react';
import { api } from '../services/api';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<any>(null);
  const [allData, setAllData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [writeTestResult, setWriteTestResult] = useState<string | null>(null);

  const fetchDbInfo = async () => {
    setIsLoading(true);
    setWriteTestResult(null);
    try {
      const [statsData, fullData] = await Promise.all([
        api.getStorageStats(),
        api.getAllStorage(),
      ]);
      setStats(statsData);
      setAllData(fullData);
    } catch (err: any) {
      console.error('Failed to load DB stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDbInfo();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    if (!allData) return;
    navigator.clipboard.writeText(JSON.stringify(allData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!allData) return;
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ssu-backend-db-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunWriteTest = async () => {
    try {
      setIsLoading(true);
      const testMsg = `[시스템 백엔드 쓰기 검증 ${new Date().toLocaleTimeString()}]`;
      // Save test ping to backend chat
      await api.updateChatHistory([
        ...(allData?.chatHistory || []),
        {
          id: `test-${Date.now()}`,
          role: 'model',
          content: `✅ 백엔드 서버 쓰기 테스트가 성공적으로 완료되었습니다: ${new Date().toLocaleString()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      await fetchDbInfo();
      setWriteTestResult('성공: 백엔드 서버 디스크에 실시간 기록되었습니다!');
    } catch (err: any) {
      setWriteTestResult('오류: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#003B6F] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Database className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  LIVE CONNECTED
                </span>
                <span className="text-xs text-blue-200">Express Node.js File Database</span>
              </div>
              <h3 className="font-bold text-lg text-white">백엔드 서버 데이터베이스 관리기</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDbInfo}
              disabled={isLoading}
              className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Diagnostic Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
              <span className="text-slate-500 font-medium">서버 저장 위치</span>
              <div className="font-bold text-slate-800 font-mono mt-1 text-[11px] truncate" title={stats?.filePath}>
                data/ssu-backend-db.json
              </div>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                용량: {stats?.fileSizeKb || '0'} KB
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
              <span className="text-slate-500 font-medium">보관된 대화 메시지</span>
              <div className="text-xl font-black text-blue-900 mt-1">
                {stats?.chatMessagesCount || 0} <span className="text-xs font-normal text-slate-500">건</span>
              </div>
              <span className="text-[10px] text-slate-400">Gemini 답변 포함</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
              <span className="text-slate-500 font-medium">저장된 학생설계전공</span>
              <div className="text-xl font-black text-emerald-800 mt-1">
                {stats?.savedProposalsCount || 0} <span className="text-xs font-normal text-slate-500">건</span>
              </div>
              <span className="text-[10px] text-slate-400">8학기 로드맵 포함</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
              <span className="text-slate-500 font-medium">학생 프로필</span>
              <div className="text-base font-bold text-slate-800 mt-1 truncate">
                {stats?.profileName || '김숭실'}
              </div>
              <span className="text-[10px] text-blue-600 font-medium">실시간 동기화 중</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs">
            <div className="flex items-center gap-2 text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                모든 변경 사항은 백엔드 서버 디스크에 실시간 자동 영구 저장(Auto-persist)됩니다.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunWriteTest}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
              >
                서버 쓰기 테스트 실행
              </button>
              <button
                onClick={handleDownloadJson}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DB 백업 다운로드</span>
              </button>
            </div>
          </div>

          {writeTestResult && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium animate-fadeIn">
              {writeTestResult}
            </div>
          )}

          {/* Raw JSON Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-600" />
                백엔드 서버 저장 데이터 원본 (JSON):
              </span>
              <button
                onClick={handleCopyJson}
                className="text-slate-500 hover:text-blue-700 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                <span>{copied ? '복사 완료' : '전체 복사'}</span>
              </button>
            </div>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] max-h-72 overflow-y-auto leading-relaxed border border-slate-800">
              <pre>{JSON.stringify(allData, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
