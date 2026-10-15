import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CEFRLevel, TargetExam } from '../../types';
import {
  X,
  LogIn,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  User,
  Mail,
  Target,
  GraduationCap,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    handleGoogleSignIn,
    loginAsLearner,
    language
  } = useApp();

  const [activeTab, setActiveTab] = useState<'quick' | 'google'>('quick');
  const [name, setName] = useState(user.name && user.name !== 'Học viên' ? user.name : 'Thanh Tùng');
  const [email, setEmail] = useState(user.email || 'thanhtung@example.com');
  const [selectedExam, setSelectedExam] = useState<TargetExam>(user.targetExam || 'IELTS');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(user.level || 'B1');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<{ code?: string; message: string } | null>(null);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'thanhtug07.github.io';

  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsLearner(name, email, selectedExam, selectedLevel);
    onClose();
  };

  const handleOneClickLogin = (presetName: string, presetEmail: string, exam: TargetExam, level: CEFRLevel) => {
    setName(presetName);
    setEmail(presetEmail);
    setSelectedExam(exam);
    setSelectedLevel(level);
    loginAsLearner(presetName, presetEmail, exam, level);
    onClose();
  };

  const onGoogleSubmit = async () => {
    try {
      setIsGoogleLoading(true);
      setGoogleError(null);
      await handleGoogleSignIn();
      onClose();
    } catch (err: any) {
      console.error('Google Sign In caught in AuthModal:', err);
      const code = err?.code || '';
      let message = err?.message || 'Đăng nhập Google thất bại.';

      if (code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        message = `Tên miền "${currentHost}" chưa được thêm vào mục Authorized Domains trên Firebase Console của dự án iconic-timer-5hl8x.`;
      } else if (code === 'auth/popup-blocked') {
        message = 'Trình duyệt đã chặn cửa sổ đăng nhập Popup. Vui lòng cho phép mở popup trên thanh địa chỉ.';
      } else if (code === 'auth/popup-closed-by-user') {
        message = 'Cửa sổ đăng nhập đã bị đóng trước khi hoàn tất.';
      }

      setGoogleError({ code, message });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>LingoPeak Authentication</span>
          </div>

          <h2 className="text-xl font-bold">
            {language === 'vi' ? 'Đăng Nhập Vào LingoPeak' : 'Sign In to LingoPeak'}
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            {language === 'vi'
              ? 'Lưu trữ tiến độ bài học, điểm số đề thi và chuỗi học tập liên tục (Streak).'
              : 'Save your study progress, exam scores, and learning streak.'}
          </p>

          {/* Navigation Tabs */}
          <div className="flex bg-black/20 p-1 rounded-xl mt-5 gap-1">
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'quick'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Đăng nhập nhanh' : 'Quick Login'}</span>
              <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                100% OK
              </span>
            </button>

            <button
              onClick={() => setActiveTab('google')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'google'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                />
                <path
                  fill="currentColor"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.41 7.33 24 12 24z"
                />
                <path
                  fill="currentColor"
                  d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.41l4.03-3.13z"
                />
                <path
                  fill="currentColor"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.59 1.25 6.59l4.03 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                />
              </svg>
              <span>Google Cloud</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'quick' && (
            <form onSubmit={handleQuickLogin} className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-2xl flex items-start gap-2.5 text-xs text-blue-800">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold">Đăng nhập tài khoản Học viên:</span> Hoạt động ngay lập tức 100% trên mọi tên miền (GitHub Pages, Vercel, localhost). Lưu toàn bộ bài học, từ vựng và lịch sử thi cử bền vững trên thiết bị của bạn.
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn nhanh tài khoản có sẵn:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOneClickLogin('Thanh Tùng', 'thanhtung@lingopeak.io', 'IELTS', 'B2')}
                    className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      T
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">
                        Thanh Tùng
                      </div>
                      <div className="text-[10px] text-slate-500">IELTS Band 7.5+</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOneClickLogin('Học Viên Pro', 'hocvien@lingopeak.io', 'TOEIC', 'B1')}
                    className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      H
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate">
                        Học Viên Pro
                      </div>
                      <div className="text-[10px] text-slate-500">TOEIC 850+</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và Tên người học <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên của bạn (ví dụ: Thanh Tùng)"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Exam & Level selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mục tiêu kỳ thi
                  </label>
                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value as TargetExam)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                  >
                    <option value="IELTS">IELTS</option>
                    <option value="TOEIC">TOEIC</option>
                    <option value="COMMUNICATION">Giao tiếp</option>
                    <option value="GENERAL">Tiếng Anh Tổng Quát</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trình độ hiện tại
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value as CEFRLevel)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                  >
                    <option value="A1">A1 (Beginner)</option>
                    <option value="A2">A2 (Elementary)</option>
                    <option value="B1">B1 (Intermediate)</option>
                    <option value="B2">B2 (Upper-Int)</option>
                    <option value="C1">C1 (Advanced)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập & Bắt đầu học ngay</span>
              </button>
            </form>
          )}

          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Đăng nhập qua Google OAuth
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Đồng bộ dữ liệu học tập trực tiếp lên Google Cloud Firestore cho tài khoản Google của bạn.
                </p>
              </div>

              {/* Google Error Notification */}
              {googleError && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-xs text-amber-900 animate-fadeIn">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-amber-800">
                        {googleError.code === 'auth/unauthorized-domain'
                          ? 'Tên miền chưa được cấp quyền trên Firebase'
                          : 'Thông báo xác thực'}
                      </div>
                      <div className="text-amber-700 mt-0.5 leading-relaxed">
                        {googleError.message}
                      </div>
                    </div>
                  </div>

                  {googleError.code === 'auth/unauthorized-domain' && (
                    <div className="pt-2 border-t border-amber-200/80 space-y-2">
                      <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                        <div className="font-semibold text-slate-800 text-[11px] mb-1">
                          👉 Giải pháp nhanh nhất không cần chờ:
                        </div>
                        <p className="text-[11px] text-slate-600 mb-2">
                          Bạn có thể dùng ngay tab <strong>Đăng nhập nhanh</strong> để học, làm bài thi và lưu điểm số ngay trên thiết bị này.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('quick');
                            setGoogleError(null);
                          }}
                          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Chuyển sang Đăng nhập nhanh ngay</span>
                        </button>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}
                          className="text-[11px] text-blue-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>{showFirebaseGuide ? 'Ẩn hướng dẫn Firebase Console' : 'Xem cách thêm tên miền vào Firebase Console'}</span>
                        </button>

                        {showFirebaseGuide && (
                          <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1.5">
                            <p className="font-bold text-slate-800">Các bước thêm domain trên Firebase:</p>
                            <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                              <li>Truy cập <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">Firebase Console</a>.</li>
                              <li>Chọn dự án của bạn (ví dụ: <code className="bg-slate-100 px-1 rounded">iconic-timer-5hl8x</code>).</li>
                              <li>Vào mục <strong>Authentication</strong> &rarr; thẻ <strong>Settings</strong>.</li>
                              <li>Chọn <strong>Authorized domains</strong> &rarr; bấm <strong>Add domain</strong>.</li>
                              <li>Nhập tên miền: <code className="bg-slate-100 px-1 rounded text-blue-700 font-bold">{currentHost}</code> rồi bấm <strong>Save</strong>.</li>
                            </ol>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Google Button */}
              <button
                type="button"
                onClick={onGoogleSubmit}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
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
                <span>
                  {isGoogleLoading
                    ? (language === 'vi' ? 'Đang mở cửa sổ Google...' : 'Connecting to Google...')
                    : (language === 'vi' ? 'Tiếp tục với Google' : 'Continue with Google')}
                </span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('quick')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  &larr; Không muốn dùng Google? Dùng Đăng nhập nhanh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
