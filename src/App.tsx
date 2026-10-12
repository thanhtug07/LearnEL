import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { LearningPathView } from './components/learning-path/LearningPathView';
import { CoursesView } from './components/courses/CoursesView';
import { VocabularyView } from './components/vocabulary/VocabularyView';
import { GrammarView } from './components/grammar/GrammarView';
import { ListeningView } from './components/listening/ListeningView';
import { SpeakingView } from './components/speaking/SpeakingView';
import { ReadingView } from './components/reading/ReadingView';
import { WritingView } from './components/writing/WritingView';
import { PracticeTestsView } from './components/practice-tests/PracticeTestsView';
import { IELTSPreparationView } from './components/ielts/IELTSPreparationView';
import { TOEICPreparationView } from './components/toeic/TOEICPreparationView';
import { AITutorView } from './components/ai-tutor/AITutorView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { ProfileView } from './components/profile/ProfileView';

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
          {renderActiveView()}
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
