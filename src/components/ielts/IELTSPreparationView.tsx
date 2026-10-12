import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  BookOpen,
  Mic,
  PenTool,
  Headphones,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const IELTSPreparationView: React.FC = () => {
  const { setActiveTab, setActiveExamId, language } = useApp();

  const [activeSkill, setActiveSkill] = useState<'writing' | 'speaking' | 'reading' | 'listening'>('writing');

  const bandDescriptors = [
    { band: 'Band 8.0 - 9.0', desc: 'Sử dụng ngôn ngữ lưu loát, tự nhiên. Từ vựng học thuật hiếm gặp (rare lexical items), ngữ pháp đa dạng không có lỗi sai cơ bản.' },
    { band: 'Band 7.0 - 7.5', desc: 'Kiểm soát tốt cấu trúc ngữ pháp phức tạp. Mạch lạc rõ ràng (Cohesion & Coherence), thỉnh thoảng có lỗi nhỏ về collocation nhưng không ảnh hưởng hiểu bài.' },
    { band: 'Band 6.0 - 6.5', desc: 'Đáp ứng đủ yêu cầu đề bài. Vẫn còn lặp từ hoặc sai sót nhỏ về giới từ, mạo từ.' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-xs rounded-lg text-xs font-bold uppercase tracking-wider text-blue-200">
              IELTS MASTERCLASS
            </span>
            <span className="text-xs text-blue-300">Target Band 7.0 - 8.5</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            IELTS Academic & General Strategy
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Nắm chắc 4 tiêu chí chấm điểm của giám khảo quốc tế. Luyện viết Task 1 & Task 2, phản xạ Speaking Part 1-3 và bứt phá điểm số với chiến thuật PEEL.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-40 shrink-0">
          <div className="text-3xl font-black text-amber-300">BAND 7.5+</div>
          <div className="text-[10px] text-blue-200 font-bold uppercase mt-1">LỘ TRÌNH MỤC TIÊU</div>
          <button
            onClick={() => setActiveTab('writing')}
            className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Luyện Viết Task 2 →
          </button>
        </div>
      </div>

      {/* 4 Skills Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'writing', label: 'Writing Task 1 & 2', icon: PenTool, tabTarget: 'writing' },
          { id: 'speaking', label: 'Speaking Parts 1-3', icon: Mic, tabTarget: 'speaking' },
          { id: 'reading', label: 'Academic Reading', icon: BookOpen, tabTarget: 'reading' },
          { id: 'listening', label: 'Academic Listening', icon: Headphones, tabTarget: 'listening' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.tabTarget)}
              className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl w-fit group-hover:scale-105 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs sm:text-sm text-slate-800 mt-2">{item.label}</div>
              <div className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
                <span>Vào luyện ngay</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Band Descriptors Guide */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" />
          <span>Khung Tiêu Chí Chấm Điểm IELTS (Band Descriptors)</span>
        </h3>

        <div className="space-y-3">
          {bandDescriptors.map((b, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
              <div className="font-bold text-blue-800 text-sm">{b.band}</div>
              <p className="text-slate-600 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
