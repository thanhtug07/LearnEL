import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
const DashboardView = React.lazy(() => import('./components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const LearningPathView = React.lazy(() => import('./components/learning-path/LearningPathView').then(m => ({ default: m.LearningPathView })));
const CoursesView = React.lazy(() => import('./components/courses/CoursesView').then(m => ({ default: m.CoursesView })));
const VocabularyView = React.lazy(() => import('./components/vocabulary/VocabularyView').then(m => ({ default: m.VocabularyView })));
const GrammarView = React.lazy(() => import('./components/grammar/GrammarView').then(m => ({ default: m.GrammarView })));
const ListeningView = React.lazy(() => import('./components/listening/ListeningView').then(m => ({ default: m.ListeningView })));
const SpeakingView = React.lazy(() => import('./components/speaking/SpeakingView').then(m => ({ default: m.SpeakingView })));
const ReadingView = React.lazy(() => import('./components/reading/ReadingView').then(m => ({ default: m.ReadingView })));
const WritingView = React.lazy(() => import('./components/writing/WritingView').then(m => ({ default: m.WritingView })));
const PracticeTestsView = React.lazy(() => import('./components/practice-tests/PracticeTestsView').then(m => ({ default: m.PracticeTestsView })));
const IELTSPreparationView = React.lazy(() => import('./components/ielts/IELTSPreparationView').then(m => ({ default: m.IELTSPreparationView })));
const TOEICPreparationView = React.lazy(() => import('./components/toeic/TOEICPreparationView').then(m => ({ default: m.TOEICPreparationView })));
const AITutorView = React.lazy(() => import('./components/ai-tutor/AITutorView').then(m => ({ default: m.AITutorView })));
const AnalyticsView = React.lazy(() => import('./components/analytics/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const AchievementsView = React.lazy(() => import('./components/achievements/AchievementsView').then(m => ({ default: m.AchievementsView })));
const ProfileView = React.lazy(() => import('./components/profile/ProfileView').then(m => ({ default: m.ProfileView })));

const ViewLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs text-slate-500 font-medium">Đang tải dữ liệu...</span>
    </div>
  </div>
);

const MainContent: React.FC = () => {
  const { activeTab } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'learning-path':
        return <LearningPathView />;
      case 'courses':
        return <CoursesView />;
      case 'vocabulary':
        return <VocabularyView />;
      case 'grammar':
        return <GrammarView />;
      case 'listening':
        return <ListeningView />;
      case 'speaking':
        return <SpeakingView />;
      case 'reading':
        return <ReadingView />;
      case 'writing':
        return <WritingView />;
      case 'practice-tests':
        return <PracticeTestsView />;
      case 'ielts':
        return <IELTSPreparationView />;
      case 'toeic':
        return <TOEICPreparationView />;
      case 'ai-tutor':
        return <AITutorView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'achievements':
        return <AchievementsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <React.Suspense fallback={<ViewLoadingFallback />}>
            {renderActiveView()}
          </React.Suspense>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
