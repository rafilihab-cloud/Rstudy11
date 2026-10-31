import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  Bell,
  RefreshCw,
  Sparkles,
  Globe,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReportCard?: () => void;
  onOpenHonorRoll?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenReportCard,
  onOpenHonorRoll,
}) => {
  const {
    currentUser,
    currentRole,
    announcements,
    attendance,
    schools,
    activeSchool,
    resetToDefaults,
    logout,
    language,
    toggleLanguage,
    t,
    isFirebaseConnected,
  } = useSchool();

  const [showNotifications, setShowNotifications] = useState(false);

  // Compute urgent alerts
  const urgentAnnouncements = announcements.filter((a) => a.priority === 'urgent');
  const todayAbsences = attendance.filter((a) => a.date === '2026-10-28' && a.status === 'absent');

  const getRoleConfig = () => {
    switch (currentRole) {
      case 'super_admin':
        return { label: t('superAdminRole'), color: 'bg-amber-100 text-amber-900 border-amber-300 font-black' };
      case 'admin':
        return { label: t('adminRole'), color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'teacher':
        return { label: t('teacherRole'), color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'student':
        return { label: t('studentRole'), color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'parent':
        return { label: t('parentRole'), color: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
  };

  const roleConfig = getRoleConfig();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Platform Name - Rstudy */}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0 select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            {currentRole !== 'super_admin' && activeSchool?.logo ? (
              <div className="relative shrink-0">
                <img
                  src={activeSchool.logo}
                  alt={activeSchool.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-2 ring-blue-500/20 shadow-xs border border-slate-200"
                />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20 ring-2 ring-white/60 shrink-0">
                <span>R</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-blue-700 text-lg sm:text-xl tracking-tight font-sans">
                Rstudy
              </span>
              <span className="text-slate-300 font-light hidden xs:inline">|</span>
              <span className="text-slate-800 text-xs sm:text-sm font-bold truncate max-w-[120px] sm:max-w-[190px] md:max-w-[240px] hidden xs:inline">
                {currentRole === 'super_admin'
                  ? language === 'ar'
                    ? 'بوابة المالك'
                    : 'Super Admin'
                  : language === 'ar'
                  ? activeSchool.name
                  : activeSchool.nameEn || activeSchool.name}
              </span>
              <span className="hidden lg:inline-flex items-center px-1.5 py-0.2 text-[10px] font-black bg-blue-50 text-blue-700 rounded-md border border-blue-200/60">
                {t('pwaBadge')}
              </span>
            </div>
          </div>

          {/* Actions: Clean spacing, no clutter, no line wrap */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Switcher Button (Clean without flags) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/90 transition active:scale-95 shadow-2xs shrink-0"
              title={language === 'ar' ? 'تغيير اللغة' : 'Change Language'}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Honor Roll (Large screens) */}
            {onOpenHonorRoll && (
              <button
                onClick={onOpenHonorRoll}
                className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/70 hover:bg-amber-100 transition shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('honorRoll')}</span>
              </button>
            )}

            {/* PWA Install Button */}
            <div className="shrink-0">
              <PWAInstallButton />
            </div>

            {/* Notifications Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {urgentAnnouncements.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className={`absolute ${language === 'ar' ? 'left-0 sm:left-auto sm:right-0' : 'right-0 sm:right-auto sm:left-0'} mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 p-4 z-50 animate-fadeIn`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span>{language === 'ar' ? 'مركز التنبيهات الفورية' : 'Instant Alerts Center'}</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {language === 'ar' ? 'اليوم' : 'Today'}
                    </span>
                  </div>

                  <div className="space-y-2.5 my-3 max-h-72 overflow-y-auto">
                    {urgentAnnouncements.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
                          <span>{language === 'ar' ? a.title : a.titleEn || a.title}</span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                            {t('urgent')}
                          </span>
                        </div>
                        <p className="text-amber-800/90 leading-relaxed">
                          {language === 'ar' ? a.content : a.contentEn || a.content}
                        </p>
                      </div>
                    ))}

                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/70 text-xs">
                      <div className="font-bold text-blue-900 mb-0.5">
                        {language === 'ar' ? 'سجل الحضور اليومي مفعل' : 'Daily Attendance Active'}
                      </div>
                      <p className="text-blue-800">
                        {language === 'ar'
                          ? `تم رصد حضور اليوم بنجاح، وعدد المتغيبين ${todayAbsences.length} طلاب.`
                          : `Today's attendance recorded. ${todayAbsences.length} student(s) absent.`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-full py-1.5 text-center text-xs text-slate-500 hover:text-slate-700 font-semibold border-t border-slate-100"
                  >
                    {t('close')}
                  </button>
                </div>
              )}
            </div>

            {/* Active User Profile (Clean Display - No Switch Role) */}
            <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:px-2.5 rounded-xl sm:rounded-2xl bg-slate-100 border border-slate-200/80 shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl object-cover ring-2 ring-white shrink-0"
              />
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[100px] md:max-w-[130px]">
                    {language === 'ar' ? currentUser.name : currentUser.nameEn || currentUser.name}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md border ${roleConfig.color}`}
                  >
                    {roleConfig.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium block leading-tight truncate max-w-[130px]">
                  {currentUser.email || currentUser.phone || ''}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 transition active:scale-95 shadow-2xs shrink-0"
              title={t('logoutBtn')}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('logoutBtn')}</span>
            </button>

            {/* Reset data */}
            <button
              onClick={() => {
                if (window.confirm(t('resetConfirm'))) {
                  resetToDefaults();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition hidden xl:flex shrink-0"
              title={t('resetData')}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
