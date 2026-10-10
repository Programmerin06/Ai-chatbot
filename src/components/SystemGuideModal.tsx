import React from 'react';
import { X, BookOpen, Check, HelpCircle, Sparkles, Building2 } from 'lucide-react';
import { SSU_MULTI_MAJOR_SYSTEMS } from '../data/ssuData';

interface SystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTypeForChat: (typeName: string) => void;
}

export const SystemGuideModal: React.FC<SystemGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectTypeForChat,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-[#003B6F] text-white p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">숭실대학교 교내 다전공 제도 완벽 비교</h3>
              <p className="text-xs text-blue-200">
                복수전공 • 부전공 • 연계전공 • 융합/마이크로전공 • 학생설계융합전공
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-sm text-[#004B87]">
              💡 숭실대 다전공 제도를 지혜롭게 선택하는 핵심 가이드:
            </span>
            <p className="text-slate-700 leading-relaxed">
              자신의 진로 목표가 기존 단과대에 개설된 특정 학과(예: 컴퓨터공학, 경영학 등)의 정통 커리큘럼을 완전히 소화하고 싶다면 
              <strong className="text-blue-800"> [복수전공]</strong>이 유리하며, 
              기존 학과들 사이의 교집합(예: 핀테크, AI콘텐츠, 바이오빅데이터 등)을 자신만의 특화된 융합 경쟁력으로 내세우고 싶다면 
              <strong className="text-indigo-800"> [학생설계융합전공]</strong>이 압도적인 차별화 무기가 됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SSU_MULTI_MAJOR_SYSTEMS.map((sys) => (
              <div
                key={sys.type}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between hover:border-blue-300 transition-all shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{sys.title}</span>
                    </h4>
                    <span className="text-[10px] bg-blue-100 text-[#004B87] font-bold px-2 py-0.5 rounded-full">
                      {sys.badge}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mb-3">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">이수 학점:</span>
                      <strong className="text-slate-800">{sys.credits}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">학위 수여:</span>
                      <span className="text-right text-slate-800 font-medium">{sys.degreeNotice}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">신청 시기:</span>
                      <span className="text-slate-800">{sys.applicationPeriod}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs mb-3">
                    <div className="font-semibold text-emerald-800 flex items-center gap-1 text-[11px]">
                      <span>장점:</span>
                    </div>
                    {sys.pros.map((pro, pIdx) => (
                      <div key={pIdx} className="text-[11px] text-slate-600 flex items-start gap-1 pl-1">
                        <span className="text-emerald-500">✓</span>
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">포털 u-Saint 연동</span>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectTypeForChat(sys.title);
                    }}
                    className="text-xs font-bold text-[#004B87] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>이 제도로 질문하기</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
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
