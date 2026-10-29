import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  BookOpenCheck,
  MessageSquare,
  Users,
  Bell,
  Clock,
  Send,
  Building2,
  Crown,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileTabBar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { currentRole, language, t } = useSchool();

  const getTabs = () => {
    switch (currentRole) {
      case 'super_admin':
        return [
          { id: 'dashboard', label: language === 'ar' ? 'الرئيسية' : 'Overview', icon: LayoutDashboard },
          { id: 'schools', label: language === 'ar' ? 'المدارس' : 'Schools', icon: Building2 },
          { id: 'broadcasts', label: language === 'ar' ? 'تعاميم عامة' : 'Broadcast', icon: Bell },
          { id: 'messages', label: t('messages'), icon: MessageSquare },
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: t('home'), icon: LayoutDashboard },
          { id: 'schedule', label: language === 'ar' ? 'حصصي اليوم' : 'My Classes', icon: Clock },
          { id: 'attendance', label: language === 'ar' ? 'الغياب' : 'Attendance', icon: CalendarCheck },
          { id: 'grades', label: language === 'ar' ? 'الدرجات' : 'Grades', icon: Award },
          { id: 'homework', label: language === 'ar' ? 'الواجبات' : 'Homework', icon: BookOpenCheck },
        ];
      case 'student':
        return [
          { id: 'dashboard', label: t('home'), icon: LayoutDashboard },
          { id: 'schedule', label: language === 'ar' ? 'حصصي اليوم' : 'My Classes', icon: Clock },
          { id: 'grades', label: language === 'ar' ? 'درجاتي' : 'My Grades', icon: Award },
          { id: 'homework', label: language === 'ar' ? 'واجباتي' : 'Homework', icon: BookOpenCheck },
          { id: 'messages', label: t('messages'), icon: MessageSquare },
        ];
      case 'parent':
        return [
          { id: 'dashboard', label: language === 'ar' ? 'المتابعة' : 'Children', icon: LayoutDashboard },
          { id: 'attendance', label: language === 'ar' ? 'الغياب' : 'Attendance', icon: CalendarCheck },
          { id: 'grades', label: language === 'ar' ? 'الدرجات' : 'Grades', icon: Award },
          { id: 'leave', label: language === 'ar' ? 'إذن غياب' : 'Leave', icon: Send },
          { id: 'messages', label: t('messages'), icon: MessageSquare },
        ];
      case 'admin':
      default:
        return [
          { id: 'dashboard', label: t('home'), icon: LayoutDashboard },
          { id: 'directory', label: language === 'ar' ? 'الأفراد' : 'Directory', icon: Users },
          { id: 'announcements', label: language === 'ar' ? 'التعاميم' : 'Circulars', icon: Bell },
          { id: 'leaves', label: language === 'ar' ? 'الإجازات' : 'Leaves', icon: CalendarCheck },
          { id: 'schedule', label: t('schedule'), icon: Clock },
        ];
    }
  };

  const tabs = getTabs();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg no-print md:hidden pb-safe">
      <div className="grid grid-flow-col auto-cols-fr max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 text-center transition-all ${
                isActive
                  ? 'text-blue-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
