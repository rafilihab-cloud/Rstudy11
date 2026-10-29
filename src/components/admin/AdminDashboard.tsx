import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolAnnouncement } from '../../types';
import { AdminGradesManager } from './AdminGradesManager';
import { AdminScheduleManager } from './AdminScheduleManager';
import { AdminAccountsManager } from './AdminAccountsManager';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  CalendarCheck,
  Bell,
  Award,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  Pencil,
  UserPlus,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    teachers,
    attendance,
    announcements,
    addAnnouncement,
    leaveRequests,
    updateLeaveRequestStatus,
    language,
    t,
  } = useSchool();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'accounts' | 'grades' | 'schedule' | 'directory' | 'announcements' | 'leaves'
  >('overview');

  // Stats calculation
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const todayAttendance = attendance.filter((a) => a.date === '2026-10-28');
  const todayPresents = todayAttendance.filter((a) => a.status === 'present').length;
  const todayAbsents = todayAttendance.filter((a) => a.status === 'absent');
  const attendanceRate = todayAttendance.length > 0 ? ((todayPresents / todayAttendance.length) * 100).toFixed(1) : '95.0';
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');

  // New Announcement Modal state
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<SchoolAnnouncement['category']>('إعلان عام');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) return;

    addAnnouncement({
      title: annTitle,
      content: annContent,
      category: annCategory,
      priority: annPriority,
      targetRole: 'all',
      author: currentUser.name,
    });

    setShowAnnModal(false);
    setAnnTitle('');
    setAnnContent('');
  };

  return (
    <div className="space-y-6">
      {/* Admin Hero Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
                {t('adminWelcome')}
              </span>
              <span className="text-xs text-purple-300">{t('appName')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {language === 'ar' ? currentUser.name : currentUser.nameEn || currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-xl">
              {language === 'ar'
                ? 'إدارة العمليات المدرسية الشاملة، متابعة نسب الحضور والغياب اليومية، رصد التقييمات، واعتماد إجازات وأعذار الطلاب.'
                : 'School-wide operations management, attendance monitoring, academic performance, and student leave approval.'}
            </p>
          </div>

          <button
            onClick={() => setShowAnnModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg transition active:scale-95 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('postNewAnnouncement')}</span>
          </button>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
            <span className="text-2xl font-black block text-purple-200">{totalStudents}</span>
            <span className="text-[11px] text-purple-200">{t('enrolledStudents')}</span>
          </div>
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
            <span className="text-2xl font-black block text-purple-200">{totalTeachers}</span>
            <span className="text-[11px] text-purple-200">{t('teachingStaff')}</span>
          </div>
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
            <span className="text-2xl font-black block text-emerald-300">%{attendanceRate}</span>
            <span className="text-[11px] text-purple-200">{t('todayAttendanceRate')}</span>
          </div>
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
            <span className="text-2xl font-black block text-amber-300">{pendingLeaves.length}</span>
            <span className="text-[11px] text-purple-200">{t('pendingExcuses')}</span>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeAdminTab === 'overview'
              ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{t('todayAbsencesSummary')}</span>
        </button>

        {/* TAB: ACCOUNTS PROVISIONING (TEACHERS, STUDENTS, PARENTS) */}
        <button
          onClick={() => setActiveAdminTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeAdminTab === 'accounts'
              ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4 text-purple-400" />
          <span>{t('manageAccountsTab')}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-900 font-black">
            {language === 'ar' ? 'إنشاء وربط' : 'New'}
          </span>
        </button>

        {/* TAB: EDIT STUDENT GRADES */}
        <button
          onClick={() => setActiveAdminTab('grades')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeAdminTab === 'grades'
              ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>{t('manageGradesTab')}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-black">
            {language === 'ar' ? 'تعديل' : 'Edit'}
          </span>
        </button>

        {/* TAB: EDIT TIMETABLE */}
        <button
          onClick={() => setActiveAdminTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeAdminTab === 'schedule'
              ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-blue-500" />
          <span>{t('manageScheduleTab')}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-black">
            {language === 'ar' ? 'تعديل' : 'Edit'}
          </span>
        </button>

        <button
          onClick={() => setActiveAdminTab('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeAdminTab === 'directory'
              ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('staffAndStudentsDir')}</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('announcements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeAdminTab === 'announcements'
              ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{t('schoolAnnouncements')} ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeAdminTab === 'leaves'
              ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{t('parentLeaveRequests')} ({pendingLeaves.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ATTENDANCE LOG */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Absences Alert Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {t('todayAbsencesSummary')} (28 {language === 'ar' ? 'أكتوبر 2026' : 'October 2026'})
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'ar' ? 'قائمة بالطلاب الذين لم يسجلوا حضوراً كاملاً اليوم' : 'Students absent or late today'}
                </p>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                {todayAbsents.length} {language === 'ar' ? 'حالات غياب' : 'absences'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{t('studentRole')}</th>
                    <th className="py-3 px-4">{t('class')}</th>
                    <th className="py-3 px-4">{t('status')}</th>
                    <th className="py-3 px-4">{t('notes')}</th>
                    <th className="py-3 px-4">{t('teacherRole')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayAttendance
                    .filter((a) => a.status !== 'present')
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{item.studentName}</td>
                        <td className="py-3 px-4 text-slate-500">{item.className}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                              item.status === 'absent'
                                ? 'bg-rose-100 text-rose-800'
                                : item.status === 'late'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {t(item.status as any)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.notes || '—'}</td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">{item.recordedBy}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ACCOUNTS PROVISIONING (TEACHERS, STUDENTS, PARENTS) */}
      {activeAdminTab === 'accounts' && <AdminAccountsManager />}

      {/* TAB: EDIT STUDENT GRADES */}
      {activeAdminTab === 'grades' && <AdminGradesManager />}

      {/* TAB: EDIT TIMETABLE */}
      {activeAdminTab === 'schedule' && <AdminScheduleManager />}

      {/* TAB 2: DIRECTORY */}
      {activeAdminTab === 'directory' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Teachers Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-black text-slate-900 text-base mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <span>{t('teachingStaff')} ({teachers.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {teachers.map((tItem) => (
                <div
                  key={tItem.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition text-xs space-y-2"
                >
                  <img
                    src={tItem.avatar}
                    alt={tItem.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-xs"
                  />
                  <h4 className="font-bold text-slate-900 text-sm">
                    {language === 'ar' ? tItem.name : tItem.nameEn || tItem.name}
                  </h4>
                  <p className="text-purple-700 font-semibold">
                    {language === 'ar' ? tItem.subject : tItem.subjectEn || tItem.subject}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {language === 'ar' ? `الخبرة: ${tItem.experienceYears} سنوات` : `Exp: ${tItem.experienceYears} yrs`}
                  </p>
                  <p className="text-slate-400 font-mono text-[10px]">{tItem.phone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Students Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-black text-slate-900 text-base mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>{t('enrolledStudents')} ({students.length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">{t('studentRole')}</th>
                    <th className="py-2.5 px-3">{t('class')}</th>
                    <th className="py-2.5 px-3">{t('gpa')}</th>
                    <th className="py-2.5 px-3">{t('parentRole')}</th>
                    <th className="py-2.5 px-3">{t('notes')}</th>
                    <th className="py-2.5 px-3 text-center">{t('absencesDays')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                        <img src={s.avatar} alt={s.name} className="w-7 h-7 rounded-full object-cover" />
                        <span>{language === 'ar' ? s.name : s.nameEn || s.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{s.className}</td>
                      <td className="py-2.5 px-3 font-black text-blue-700">%{s.gpa}</td>
                      <td className="py-2.5 px-3 text-slate-700">{s.parentName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{s.parentPhone}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                        {s.totalAbsences}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANNOUNCEMENTS */}
      {activeAdminTab === 'announcements' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-black text-slate-900 text-base">{t('schoolAnnouncements')}</h3>
              <p className="text-xs text-slate-500">
                {language === 'ar' ? 'تظهر التعاميم في بوابات المعلمين والطلاب وأولياء الأمور' : 'Circulars broadcast to all school portals'}
              </p>
            </div>
            <button
              onClick={() => setShowAnnModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('postNewAnnouncement')}</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        ann.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {ann.category}
                    </span>
                    {ann.priority === 'urgent' && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {t('urgent')}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{ann.date}</span>
                </div>

                <h4 className="font-black text-slate-900 text-base">
                  {language === 'ar' ? ann.title : ann.titleEn || ann.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'ar' ? ann.content : ann.contentEn || ann.content}
                </p>

                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100">
                  {language === 'ar' ? 'صادر عن:' : 'Issued by:'}{' '}
                  <strong className="text-slate-600">{ann.author}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE REQUESTS APPROVAL */}
      {activeAdminTab === 'leaves' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-black text-slate-900 text-base">
              {t('parentLeaveRequests')}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ar' ? 'الموافقة على الأعذار الطبية والغيابات أو رفضها' : 'Review and approve/reject medical leaves'}
            </p>
          </div>

          <div className="space-y-3">
            {leaveRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {req.studentName} ({req.className})
                    </h4>
                    <span className="text-slate-400 text-[11px]">
                      {language === 'ar' ? `بطلب من: ${req.parentName}` : `Requested by: ${req.parentName}`}
                    </span>
                  </div>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong>{language === 'ar' ? 'السبب: ' : 'Reason: '}</strong> {req.reason}
                  </p>
                  <p className="text-slate-400 text-[11px] font-mono">
                    {req.startDate} {req.startDate !== req.endDate && `→ ${req.endDate}`}
                  </p>
                  {req.adminResponse && (
                    <p className="text-emerald-700 font-semibold text-[11px]">
                      {language === 'ar' ? 'رد الإدارة: ' : 'Admin note: '} {req.adminResponse}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {req.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => updateLeaveRequestStatus(req.id, 'approved')}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('approveExcuse')}</span>
                      </button>
                      <button
                        onClick={() => updateLeaveRequestStatus(req.id, 'rejected')}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{t('rejectExcuse')}</span>
                      </button>
                    </>
                  ) : (
                    <span
                      className={`font-black px-3 py-1.5 rounded-xl text-xs ${
                        req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {req.status === 'approved' ? t('leaveApproved') : t('leaveRejected')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Post School Announcement */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="font-black text-slate-900 text-lg mb-1">{t('postNewAnnouncement')}</h3>
            <p className="text-xs text-slate-500 mb-4">
              {language === 'ar' ? 'سيظهر التعميم لجميع المعلمين والطلاب وأولياء الأمور' : 'Broadcast to all users'}
            </p>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('announcementTitle')}:
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="عنوان التعميم..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('examType')}:</label>
                  <select
                    value={annCategory}
                    onChange={(e) =>
                      setAnnCategory(e.target.value as SchoolAnnouncement['category'])
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                  >
                    <option value="إعلان عام">إعلان عام / General</option>
                    <option value="اختبارات">اختبارات / Exams</option>
                    <option value="فعاليات">فعاليات / Events</option>
                    <option value="عطلة رسمية">عطلة رسمية / Holiday</option>
                    <option value="تنبيه إداري">تنبيه إداري / Administrative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('priority')}:</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as 'normal' | 'urgent')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                  >
                    <option value="normal">{t('normal')}</option>
                    <option value="urgent">{t('urgent')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('announcementContent')}:
                </label>
                <textarea
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="نص وتفاصيل التعميم..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow transition"
                >
                  {t('submit')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
