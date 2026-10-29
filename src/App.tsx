import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Navbar } from './components/layout/Navbar';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { ScheduleView } from './components/shared/ScheduleView';
import { MessagingView } from './components/shared/MessagingView';
import { ReportCardModal } from './components/shared/ReportCardModal';
import { HonorRollModal } from './components/shared/HonorRollModal';
import { LoginPage } from './components/auth/LoginPage';
import { Sparkles, Crown } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentRole, students, currentUser, activeChildId, isAuthenticated, language, t, isFirebaseConnected } = useSchool();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [isHonorRollOpen, setIsHonorRollOpen] = useState(false);

  // Student to show on report card
  const activeStudent =
    currentRole === 'parent'
      ? students.find((s) => s.id === activeChildId) || students[0]
      : students.find((s) => s.id === currentUser.id) || students[0];

  const renderContent = () => {
    // Super Admin has full central command dashboard
    if (currentRole === 'super_admin') {
      if (activeTab === 'messages') {
        return <MessagingView />;
      }
      return <SuperAdminDashboard />;
    }

    // If user clicked direct tab
    if (activeTab === 'schedule') {
      return <ScheduleView />;
    }
    if (activeTab === 'messages') {
      return <MessagingView />;
    }

    // Role specific dashboard
    switch (currentRole) {
      case 'teacher':
        return <TeacherDashboard />;
      case 'student':
        return (
          <StudentDashboard
            onOpenReportCard={() => setIsReportCardOpen(true)}
            onNavigateToSchedule={() => setActiveTab('schedule')}
          />
        );
      case 'parent':
        return (
          <ParentDashboard
            onOpenReportCard={() => setIsReportCardOpen(true)}
            onNavigateToMessages={() => setActiveTab('messages')}
          />
        );
      case 'admin':
      default:
        return <AdminDashboard />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* PWA Offline indicator */}
      <OfflineIndicator />

      {/* Main Global Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportCard={() => setIsReportCardOpen(true)}
        onOpenHonorRoll={() => setIsHonorRollOpen(true)}
      />

      {/* Quick Role Navigation Subheader for Tablet/Desktop */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2 hidden md:block no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {currentRole === 'super_admin' ? t('superAdminPortal') : t('home')}
            </button>
            {currentRole !== 'super_admin' && (
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'schedule'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {t('schedule')}
              </button>
            )}
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'messages'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {t('messages')}
            </button>
            {currentRole === 'super_admin' && (
              <span className="mx-2 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-black flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600" />
                <span>{language === 'ar' ? 'صلاحيات المالك الكاملة' : 'Full Owner Privileges'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isFirebaseConnected
                ? (language === 'ar' ? 'متصل سحابياً (Firebase Live)' : 'Firebase Cloud Live')
                : t('onlineSync')}
            </span>
            <button
              onClick={() => setIsHonorRollOpen(true)}
              className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('honorRoll')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area with Pure Fluid Responsive Layout (Mobile, Tablet, Desktop) */}
      <main className="flex-1 w-full p-2.5 sm:p-4 md:p-6 pb-28 md:pb-12">
        <div className="w-full max-w-7xl mx-auto">{renderContent()}</div>
      </main>

      {/* Native PWA Bottom Tab Bar for Mobile screens */}
      <MobileTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Printable Report Card Modal */}
      <ReportCardModal
        student={activeStudent}
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
      />

      {/* Honor Roll Modal */}
      <HonorRollModal isOpen={isHonorRollOpen} onClose={() => setIsHonorRollOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainAppContent />
    </SchoolProvider>
  );
}
