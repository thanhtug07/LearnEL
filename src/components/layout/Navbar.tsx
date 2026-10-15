import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuthModal } from '../auth/AuthModal';
import {
  Flame,
  Globe,
  Search,
  Volume2,
  VolumeX,
  Menu,
  Sparkles,
  Cloud,
  CloudCheck,
  CloudUpload,
  LogIn,
  LogOut,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = React.memo(({ onToggleMobileSidebar }) => {
  const {
    user,
    updateUser,
    toggleLanguage,
    language,
    setActiveTab,
    firebaseUser,
    isLoggedIn,
    cloudSyncStatus,
    handleSignOut
  } = useApp();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const xpPercent = Math.min(100, Math.round((user.xp % 500) / 5));

  const isUserAuthenticated = isLoggedIn || Boolean(firebaseUser || (user.id && user.id !== 'user-guest-1' && user.email));

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Mobile menu & Quick search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-full px-3 py-1.5 text-xs text-slate-500 w-64 focus-within:border-blue-500 focus-within:bg-white transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'vi' ? 'Tìm bài học, từ vựng, ngữ pháp...' : 'Search lessons, vocabulary...'}
            className="bg-transparent border-none outline-none w-full text-slate-700 placeholder-slate-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setActiveTab('vocabulary');
              }
            }}
          />
        </div>
      </div>

      {/* Right side: Cloud Sync, Streak, XP, Language, Auth, Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Real Cloud Sync Status Badge */}
        {cloudSyncStatus === 'synced' && (
          <div
            className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full"
            title="Dữ liệu học tập được lưu trữ bền vững trên Google Cloud Firestore"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'vi' ? 'Đã lưu Cloud' : 'Cloud Synced'}</span>
          </div>
        )}

        {cloudSyncStatus === 'syncing' && (
          <div
            className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full animate-pulse"
            title="Đang đồng bộ hóa dữ liệu với Cloud Firestore"
          >
            <CloudUpload className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
            <span>{language === 'vi' ? 'Đang lưu...' : 'Syncing...'}</span>
          </div>
        )}

        {cloudSyncStatus === 'offline' && (
          <div
            className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full"
            title="Đang chạy ở chế độ ngoại tuyến (lưu trên thiết bị này)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>{language === 'vi' ? 'Lưu cục bộ (Offline)' : 'Offline mode'}</span>
          </div>
        )}

        {cloudSyncStatus === 'error' && (
          <div
            className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full"
            title="Lỗi đồng bộ Cloud Firestore"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>{language === 'vi' ? 'Lỗi Cloud' : 'Sync error'}</span>
          </div>
        )}

        {/* Streak Counter */}
        <div
          className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/70 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold"
          title="Chuỗi ngày học liên tục"
        >
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
          <span>{user.currentStreak} {language === 'vi' ? 'ngày' : 'days'}</span>
        </div>

        {/* XP Level progress */}
        <div className="hidden lg:flex items-center gap-2 bg-blue-50/70 border border-blue-100 px-3 py-1 rounded-full text-xs">
          <span className="font-bold text-blue-700">LVL {user.levelNumber}</span>
          <div className="w-14 h-2 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <span className="text-slate-500 text-[11px] font-medium">{user.xp % 500}/500 XP</span>
        </div>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Chuyển đổi ngôn ngữ giao diện"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>{language.toUpperCase()}</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => updateUser({ soundEnabled: !user.soundEnabled })}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title={user.soundEnabled ? 'Âm thanh bật' : 'Âm thanh tắt'}
        >
          {user.soundEnabled ? <Volume2 className="w-4 h-4 text-slate-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Authentication Button / User Profile */}
        {isUserAuthenticated ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 cursor-pointer group"
              title="Xem hồ sơ và cài đặt"
            >
              <img
                src={firebaseUser?.photoURL || user.avatar}
                alt={firebaseUser?.displayName || user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30 group-hover:ring-emerald-500 transition-all"
              />
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-blue-600">
                  {firebaseUser?.displayName || user.name}
                </div>
                <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{firebaseUser ? 'Google Sync' : 'Học viên'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="pl-1 border-l border-slate-200">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
              title="Đăng nhập tài khoản Học viên hoặc Google"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Đăng nhập' : 'Sign In'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal for Quick Learner & Google Sign-In */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
});

Navbar.displayName = 'Navbar';
