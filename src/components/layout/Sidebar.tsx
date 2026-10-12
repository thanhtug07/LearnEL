import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Compass,
  GraduationCap,
  Layers,
  BookMarked,
  Headphones,
  Mic,
  BookOpen,
  PenTool,
  FileCheck2,
  Award,
  BarChart3,
  Bot,
  UserCheck,
  Trophy,
  Sliders,
  ChevronRight,
  Sparkles,
  BookAudio
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { activeTab, setActiveTab, user, language } = useApp();

  const navGroups = [
    {
      groupTitleVi: 'CỐT LÕI',
      groupTitleEn: 'CORE',
      items: [
        { id: 'dashboard', labelVi: 'Tổng quan', labelEn: 'Dashboard', icon: LayoutDashboard },
        { id: 'learning-path', labelVi: 'Lộ trình học tập', labelEn: 'Learning Path', icon: Compass },
        { id: 'courses', labelVi: 'Khóa học & Bài học', labelEn: 'Courses & Lessons', icon: GraduationCap },
        { id: 'vocabulary', labelVi: 'Từ vựng Flashcards', labelEn: 'Vocabulary Hub', icon: Layers },
        { id: 'grammar', labelVi: 'Kho Ngữ pháp', labelEn: 'Grammar Center', icon: BookMarked },
      ]
    },
    {
      groupTitleVi: '4 KỸ NĂNG & THI CỬ',
      groupTitleEn: 'SKILLS & EXAMS',
      items: [
        { id: 'listening', labelVi: 'Luyện Nghe', labelEn: 'Listening Lab', icon: Headphones },
        { id: 'speaking', labelVi: 'Luyện Nói (Mic)', labelEn: 'Speaking Practice', icon: Mic },
        { id: 'reading', labelVi: 'Luyện Đọc hiểu', labelEn: 'Reading Hub', icon: BookOpen },
        { id: 'writing', labelVi: 'Luyện Viết AI', labelEn: 'Writing Workspace', icon: PenTool },
        { id: 'practice-tests', labelVi: 'Trung tâm luyện đề', labelEn: 'Exam Center', icon: FileCheck2 },
        { id: 'ielts', labelVi: 'Luyện thi IELTS', labelEn: 'IELTS Master', icon: Award },
        { id: 'toeic', labelVi: 'Luyện thi TOEIC', labelEn: 'TOEIC Pro', icon: BookAudio },
      ]
    },
    {
      groupTitleVi: 'THÔNG MINH & TIẾN ĐỘ',
      groupTitleEn: 'SMART & PROGRESS',
      items: [
        { id: 'ai-tutor', labelVi: 'AI English Tutor', labelEn: 'AI English Tutor', icon: Bot, highlight: true },
        { id: 'analytics', labelVi: 'Tiến độ & Phân tích', labelEn: 'Analytics', icon: BarChart3 },
        { id: 'achievements', labelVi: 'Thành tựu', labelEn: 'Achievements', icon: Trophy },
        { id: 'profile', labelVi: 'Hồ sơ & Cài đặt', labelEn: 'Profile & Settings', icon: Sliders },
      ]
    }
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleSelect('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-blue-500/20">
              L
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>LingoPeak</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Learn Smarter. Speak Confidently.</p>
            </div>
          </div>
        </div>

        {/* User Mini Card matching Reference Image #1 */}
        <div className="p-3 mx-3 my-2 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 truncate">{user.name}</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-1.5 rounded">
                {user.level}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{user.xp} XP</span>
              <span className="text-slate-300">•</span>
              <span>Streak {user.currentStreak}d</span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 custom-scroll">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {language === 'vi' ? group.groupTitleVi : group.groupTitleEn}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : item.highlight
                        ? 'bg-blue-50/70 text-blue-700 hover:bg-blue-100/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-blue-600' : 'text-slate-500'}`} />
                      <span>{language === 'vi' ? item.labelVi : item.labelEn}</span>
                    </div>
                    {item.highlight && !isActive && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Guide Mode Footer Card matching Image #1 */}
        <div className="p-3 border-t border-slate-100">
          <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-blue-100/60">
            <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 mb-1 uppercase tracking-wider">
              <span>{language === 'vi' ? 'LỜI NHẮC HÔM NAY' : 'DAILY GUIDE'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {language === 'vi'
                ? 'Chỉ cần 15 phút mỗi ngày để duy trì phản xạ ngôn ngữ vững vàng.'
                : 'One small step at a time. Keep the session light and consistent.'}
            </p>
            <button
              onClick={() => handleSelect('learning-path')}
              className="mt-2 text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:gap-1.5 transition-all"
            >
              <span>{language === 'vi' ? 'Tiếp tục lộ trình' : 'Resume study'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
