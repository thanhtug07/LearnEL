import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CEFRLevel, TargetExam } from '../../types';
import {
  Sliders,
  User,
  Target,
  Globe,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Clock,
  Sparkles,
  Award,
  Cloud,
  CloudCheck,
  Database,
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    user,
    updateUser,
    resetAllData,
    resetLocalData,
    resetUserProgress,
    language,
    toggleLanguage,
    firebaseUser,
    cloudSyncStatus,
    handleGoogleSignIn,
    handleSignOut
  } = useApp();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [level, setLevel] = useState<CEFRLevel>(user.level);
  const [targetExam, setTargetExam] = useState<TargetExam>(user.targetExam);
  const [targetScore, setTargetScore] = useState(user.targetScore);
  const [dailyMinutesGoal, setDailyMinutesGoal] = useState(user.dailyMinutesGoal);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetCloudOption, setResetCloudOption] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      level,
      targetExam,
      targetScore,
      dailyMinutesGoal
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const onGoogleLogin = async () => {
    try {
      setIsSigningIn(true);
      await handleGoogleSignIn();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleExportAllJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lingopeak_profile_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {language === 'vi' ? 'Hồ Sơ Cá Nhân & Cài Đặt Học Tập' : 'Profile & Study Settings'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {language === 'vi'
            ? 'Cá nhân hóa mục tiêu thi cử, lưu trữ tiến độ bền vững trên Google Cloud Firestore.'
            : 'Configure your proficiency targets, exam aspirations, and persistent cloud sync.'}
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Cài đặt và hồ sơ đã được lưu thành công vào cơ sở dữ liệu!</span>
        </div>
      )}

      {/* Cloud Firestore & Google Account Card */}
      <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white rounded-3xl p-6 border border-blue-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === 'vi' ? 'Đồng Bộ Hóa Google Cloud Firestore' : 'Google Cloud Firestore Sync'}
                </h3>
                {firebaseUser ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Live Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span>Local Mode</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {firebaseUser
                  ? `Đang lưu tự động dưới tài khoản: ${firebaseUser.email || firebaseUser.uid}`
                  : 'Đăng nhập Google để đồng bộ vĩnh viễn tiến độ học, từ vựng và lịch sử làm bài thi.'}
              </p>
            </div>
          </div>

          <div>
            {firebaseUser ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Đăng xuất' : 'Sign Out'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onGoogleLogin}
                disabled={isSigningIn}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-800 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>{isSigningIn ? 'Đang kết nối...' : 'Đăng nhập Google'}</span>
              </button>
            )}
          </div>
        </div>

        {firebaseUser && (
          <div className="pt-2 border-t border-blue-100 flex flex-wrap gap-4 text-[11px] text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">UID:</span>{' '}
              <code className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200 text-blue-700">
                {firebaseUser.uid}
              </code>
            </div>
            <div>
              <span className="font-semibold text-slate-800">Database ID:</span>{' '}
              <code className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                ai-studio-lingopeakpremium
              </code>
            </div>
            <div>
              <span className="font-semibold text-slate-800">Trạng thái:</span>{' '}
              <span className="text-emerald-700 font-bold">Tự động đồng bộ 2 chiều</span>
            </div>
          </div>
        )}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-4">
            <img
              src={firebaseUser?.photoURL || user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-500/20"
            />
            <div>
              <h2 className="text-lg font-bold text-slate-900">{firebaseUser?.displayName || user.name}</h2>
              <div className="text-xs text-slate-500">{firebaseUser?.email || user.email}</div>
              <div className="text-[11px] font-semibold text-blue-600 mt-0.5">
                Cấp độ hiện tại: {user.level} • {user.targetExam} ({user.targetScore})
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Họ và Tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Địa chỉ Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Goals & Preferences */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5 text-xs">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span>Mục Tiêu & Trình Độ Ngôn Ngữ</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Trình độ CEFR hiện tại</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="A1">A1 - Khởi động (Beginner)</option>
                <option value="A2">A2 - Sơ cấp (Elementary)</option>
                <option value="B1">B1 - Trung cấp (Intermediate)</option>
                <option value="B2">B2 - Trung cao cấp (Upper Intermediate)</option>
                <option value="C1">C1 - Cao cấp (Advanced)</option>
                <option value="C2">C2 - Thành thạo (Mastery)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Kỳ thi mục tiêu</label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="IELTS">IELTS Academic / General</option>
                <option value="TOEIC">TOEIC 4 Kỹ năng</option>
                <option value="COMMUNICATION">Giao tiếp công sở & Đời sống</option>
                <option value="GENERAL">Tiếng Anh tổng quát</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Điểm số kỳ vọng</label>
              <input
                type="text"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                placeholder="Ví dụ: Band 7.5 hoặc 850 TOEIC"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Thời gian học cam kết mỗi ngày: <span className="text-blue-600">{dailyMinutesGoal} phút</span>
            </label>
            <div className="flex items-center gap-2 pt-1">
              {[15, 20, 30, 45, 60].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDailyMinutesGoal(mins)}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
                    dailyMinutesGoal === mins
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interface Preferences */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Tùy Chọn Giao Diện & Âm Thanh</span>
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div>
              <div className="font-bold text-slate-800">Ngôn ngữ hiển thị (Interface Language)</div>
              <div className="text-slate-400 text-[11px]">Chuyển đổi giao diện song ngữ Tiếng Việt & Tiếng Anh</div>
            </div>
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-4 py-2 bg-white border border-slate-200 hover:border-blue-400 text-blue-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              {language === 'vi' ? 'Tiếng Việt (VI)' : 'English (EN)'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div>
              <div className="font-bold text-slate-800">Hiệu ứng âm thanh & Phát âm tự động</div>
              <div className="text-slate-400 text-[11px]">Bật/tắt giọng đọc TTS khi tương tác từ vựng</div>
            </div>
            <button
              type="button"
              onClick={() => updateUser({ soundEnabled: !user.soundEnabled })}
              className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
                user.soundEnabled
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {user.soundEnabled ? 'Bật (ON)' : 'Tắt (OFF)'}
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            Lưu thay đổi hồ sơ
          </button>
        </div>
      </form>

      {/* Data Backup & Reset */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-600" />
          <span>Sao Lưu & Quản Lý Dữ Liệu</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
          <div>
            <div className="font-bold text-slate-800">Xuất dữ liệu tiến độ (Export Backup)</div>
            <div className="text-slate-500 text-[11px]">Tải toàn bộ tiến độ học và lịch sử bài thi dưới dạng file JSON</div>
          </div>
          <button
            onClick={handleExportAllJSON}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            Tải file JSON
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-200">
          <div>
            <div className="font-bold text-red-900">Đặt lại toàn bộ dữ liệu (Reset Learning Data)</div>
            <div className="text-red-700 text-[11px]">Xóa toàn bộ lịch sử bài học và đưa nền tảng về trạng thái ban đầu</div>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            Đặt lại dữ liệu
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">Xác Nhận Đặt Lại Dữ Liệu?</h3>
            <p className="text-xs text-slate-500">
              Bạn có thể chọn đặt lại dữ liệu lưu trên thiết bị này hoặc đồng thời xóa toàn bộ tiến độ đã lưu trên Google Cloud.
            </p>

            {firebaseUser && (
              <label className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200/80 rounded-xl text-left cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetCloudOption}
                  onChange={(e) => setResetCloudOption(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-[11px] font-semibold text-red-900 leading-tight">
                  Xóa cả tiến độ và điểm số đã đồng bộ trên Firestore Cloud
                </span>
              </label>
            )}

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  setResetCloudOption(false);
                }}
                disabled={isResetting}
                className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={async () => {
                  try {
                    setIsResetting(true);
                    if (resetCloudOption && firebaseUser) {
                      await resetUserProgress({ cloud: true });
                    } else {
                      resetLocalData();
                    }
                    setShowResetConfirm(false);
                    setResetCloudOption(false);
                  } finally {
                    setIsResetting(false);
                  }
                }}
                disabled={isResetting}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isResetting ? 'Đang xử lý...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
