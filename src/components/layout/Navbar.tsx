import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    user,
    updateUser,
    toggleLanguage,
    language,
    setActiveTab,
    firebaseUser,
    cloudSyncStatus,
    handleGoogleSignIn,
    handleSignOut
  } = useApp();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const xpPercent = Math.min(100, Math.round((user.xp % 500) / 5));

  const onSignInClick = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      await handleGoogleSignIn();
    } catch (err: any) {
      setAuthError(err?.message || 'Đăng nhập không thành công');
      setTimeout(() => setAuthError(null), 4000);
    } finally {
      setIsSigningIn(false);
    }
  };

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

        {/* Google Authentication Button / User Profile */}
        {firebaseUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 cursor-pointer group"
              title="Xem hồ sơ và cài đặt"
            >
              <img
                src={firebaseUser.photoURL || user.avatar}
                alt={firebaseUser.displayName || user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30 group-hover:ring-emerald-500 transition-all"
              />
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-blue-600">
                  {firebaseUser.displayName || user.name}
                </div>
                <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Google Sync</span>
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
              onClick={onSignInClick}
              disabled={isSigningIn}
              className="flex items-center gap-1.5 bg-white border border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Đăng nhập tài khoản Google để lưu trữ tiến độ lên đám mây"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.41 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.41l4.03-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.59 1.25 6.59l4.03 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                />
              </svg>
              <span>{isSigningIn ? (language === 'vi' ? 'Đang kết nối...' : 'Connecting...') : (language === 'vi' ? 'Đăng nhập Google' : 'Google Sign-In')}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
