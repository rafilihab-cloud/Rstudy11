import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TimetableEntry } from '../../types';
import {
  Clock,
  Calendar,
  MapPin,
  User,
  BookOpen,
  Pencil,
  X,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Users,
  Sparkles,
  Layers,
  ArrowRight,
  BookOpenCheck,
  Check,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { DraggableScrollContainer } from './DraggableScrollContainer';

export const ScheduleView: React.FC = () => {
  const {
    timetable,
    currentRole,
    currentUser,
    students,
    activeChildId,
    setActiveChildId,
    homeworkList,
    updateTimetableEntry,
    language,
    t,
  } = useSchool();

  // Determine current day of week (0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu)
  const getTodayDayIndex = (): number => {
    const day = new Date().getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    if (day >= 0 && day <= 4) {
      return day;
    }
    // If weekend (Friday = 5, Saturday = 6), default to Sunday (0)
    return 0;
  };

  const todayIndex = getTodayDayIndex();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayIndex);
  const [viewMode, setViewMode] = useState<'personalized' | 'all'>('personalized');

  // Edit period modal state (Principal only)
  const [editingPeriod, setEditingPeriod] = useState<TimetableEntry | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editTeacher, setEditTeacher] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editTimeSlot, setEditTimeSlot] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const daysArabic = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const daysEnglish = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  const selectedDayAr = daysArabic[selectedDayIndex];
  const isSelectedDayToday = selectedDayIndex === todayIndex;

  // Active student/child for student & parent roles
  const activeStudent =
    currentRole === 'parent'
      ? students.find((s) => s.id === activeChildId) || students[0]
      : students.find((s) => s.id === currentUser.id) || students[0];

  const parentChildren =
    currentRole === 'parent'
      ? students.filter((s) => currentUser.childrenIds?.includes(s.id) || s.parentId === currentUser.id)
      : [];

  // Filter entries for the selected day
  const dayEntries = useMemo(() => {
    return timetable
      .filter((entry) => entry.day === selectedDayAr)
      .sort((a, b) => a.period - b.period);
  }, [timetable, selectedDayAr]);

  // Personalized filtering logic based on role
  const displayEntries = useMemo(() => {
    if (viewMode === 'all' || currentRole === 'admin' || currentRole === 'super_admin') {
      return dayEntries;
    }

    if (currentRole === 'teacher') {
      // Classes teacher will TEACH
      return dayEntries.filter((entry) => {
        const teacherName = currentUser.name || '';
        return (
          entry.teacherName.includes(teacherName) ||
          teacherName.includes(entry.teacherName) ||
          (entry.subject.includes('الرياضيات') && teacherName.includes('فاطمة'))
        );
      });
    }

    if (currentRole === 'student') {
      // Classes student will ATTEND in their classroom
      return dayEntries.filter((entry) => entry.className === activeStudent.className);
    }

    if (currentRole === 'parent') {
      // Classes child will ATTEND in their classroom
      return dayEntries.filter((entry) => entry.className === activeStudent.className);
    }

    return dayEntries;
  }, [dayEntries, viewMode, currentRole, currentUser.name, activeStudent.className]);

  const handleOpenEdit = (p: TimetableEntry) => {
    setEditingPeriod(p);
    setEditSubject(p.subject);
    setEditTeacher(p.teacherName);
    setEditRoom(p.room);
    setEditTimeSlot(p.timeSlot);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPeriod) return;

    updateTimetableEntry(editingPeriod.id, {
      subject: editSubject.trim(),
      subjectEn: editSubject.trim(),
      teacherName: editTeacher.trim(),
      room: editRoom.trim(),
      roomEn: editRoom.trim(),
      timeSlot: editTimeSlot.trim(),
    });

    setEditingPeriod(null);
    setToastMsg(language === 'ar' ? 'تم تحديث الحصة بنجاح' : 'Period updated successfully');
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Period status badge helper (mock realistic period flow: period 1 current, 2 upcoming)
  const getPeriodStatusBadge = (periodNumber: number) => {
    if (!isSelectedDayToday) return null;

    if (periodNumber === 1) {
      return {
        label: t('currentPeriodNow'),
        style: 'bg-emerald-500 text-white animate-pulse',
      };
    } else if (periodNumber === 2) {
      return {
        label: t('upcomingPeriod'),
        style: 'bg-blue-600 text-white',
      };
    } else {
      return {
        label: t('completedPeriod'),
        style: 'bg-slate-100 text-slate-500',
      };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ROLE-CUSTOMIZED HERO HEADER */}
      <div
        className={`p-6 sm:p-8 rounded-3xl shadow-xl text-white relative overflow-hidden ${
          currentRole === 'teacher'
            ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900'
            : currentRole === 'student'
            ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900'
            : currentRole === 'parent'
            ? 'bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900'
            : 'bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white border border-white/25 flex items-center gap-1.5 shadow-xs">
                {currentRole === 'teacher' ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{t('teacherWelcome')}</span>
                  </>
                ) : currentRole === 'student' ? (
                  <>
                    <BookOpen className="w-3.5 h-3.5 text-blue-300" />
                    <span>{t('studentWelcome')}</span>
                  </>
                ) : currentRole === 'parent' ? (
                  <>
                    <Users className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('parentWelcome')}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                    <span>{t('adminRole')}</span>
                  </>
                )}
              </span>

              {/* Today indicator */}
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 border border-white/15 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  {t('todayIs')} {daysArabic[todayIndex]} (28 {language === 'ar' ? 'أكتوبر 2026' : 'October 2026'})
                </span>
              </span>
            </div>

            {/* Main Headline customized by role */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentRole === 'teacher'
                ? t('teacherScheduleTitle')
                : currentRole === 'student'
                ? t('studentScheduleTitle')
                : currentRole === 'parent'
                ? `${t('parentScheduleTitle')} (${language === 'ar' ? activeStudent.name : activeStudent.nameEn || activeStudent.name})`
                : t('weeklyTimetable')}
            </h1>

            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-2xl leading-relaxed">
              {currentRole === 'teacher'
                ? t('teacherScheduleSubtitle')
                : currentRole === 'student'
                ? `${t('studentScheduleSubtitle')} [${activeStudent.className}]`
                : currentRole === 'parent'
                ? t('parentScheduleSubtitle')
                : language === 'ar'
                ? 'مواعيد الحصص اليومية، القاعات الدراسية، والمعلمون المشرفون'
                : 'Daily schedule periods, assigned rooms, and teachers'}
            </p>
          </div>

          {/* Quick Summary Pill on Header */}
          <div className="bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-xs text-center shrink-0 self-start md:self-auto min-w-[130px]">
            <span className="text-3xl font-black block text-amber-300 font-mono">
              {displayEntries.length}
            </span>
            <span className="text-xs text-white/90 font-bold block mt-0.5">
              {currentRole === 'teacher'
                ? language === 'ar'
                  ? 'حصص تدريسية اليوم'
                  : 'Classes to Teach'
                : currentRole === 'student'
                ? language === 'ar'
                  ? 'حصص مقررة لك اليوم'
                  : 'Classes to Attend'
                : language === 'ar'
                ? 'حصة دراسية مجدولة'
                : 'Scheduled Periods'}
            </span>
          </div>
        </div>

        {/* Parent child switcher if parent has multiple children */}
        {currentRole === 'parent' && parentChildren.length > 1 && (
          <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center gap-2">
            <span className="text-xs text-amber-200 font-bold">{t('selectChildToMonitor')}</span>
            {parentChildren.map((child) => (
              <button
                key={child.id}
                onClick={() => setActiveChildId(child.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeChildId === child.id
                    ? 'bg-white text-slate-900 shadow-md ring-2 ring-amber-400'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <img src={child.avatar} alt={child.name} className="w-5 h-5 rounded-full object-cover" />
                <span>{language === 'ar' ? child.name : child.nameEn || child.name}</span>
                <span className="text-[10px] opacity-75">({child.className})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DAYS NAVIGATION & VIEW MODE TOGGLE */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Days Tabs with "Today" indicator (Draggable on PC & Mobile) */}
        <DraggableScrollContainer className="pb-1 sm:pb-0" wrapperClassName="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 whitespace-nowrap px-2 py-0.5 min-w-max">
            {daysArabic.map((dayAr, index) => {
              const isSelected = selectedDayIndex === index;
              const isToday = index === todayIndex;
              return (
                <button
                  key={dayAr}
                  onClick={() => setSelectedDayIndex(index)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                    isSelected
                      ? currentRole === 'teacher'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
                  }`}
                >
                  <span>{language === 'ar' ? `يوم ${dayAr}` : daysEnglish[index]}</span>
                  {isToday && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {language === 'ar' ? 'اليوم' : 'Today'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </DraggableScrollContainer>

        {/* View Mode Toggle: [My Classes Only] vs [All School Schedule] */}
        {currentRole !== 'admin' && currentRole !== 'super_admin' && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0 self-end sm:self-auto border border-slate-200/80">
            <button
              onClick={() => setViewMode('personalized')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'personalized'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {currentRole === 'teacher'
                ? t('myTeachingClassesOnly')
                : currentRole === 'student'
                ? t('myAttendingClassesOnly')
                : language === 'ar'
                ? 'حصص الابن فقط'
                : "Child's Schedule"}
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('fullSchoolSchedule')}
            </button>
          </div>
        )}
      </div>

      {/* SCHEDULE PERIOD CARDS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">
              {currentRole === 'teacher' && viewMode === 'personalized'
                ? language === 'ar'
                  ? `الحصص التي ستقدمها يوم ${selectedDayAr}:`
                  : `Teaching periods on ${daysEnglish[selectedDayIndex]}:`
                : currentRole === 'student' && viewMode === 'personalized'
                ? language === 'ar'
                  ? `الحصص التي ستحضرها يوم ${selectedDayAr}:`
                  : `Classes you will attend on ${daysEnglish[selectedDayIndex]}:`
                : language === 'ar'
                ? `جميع حصص يوم ${selectedDayAr}:`
                : `All classes on ${daysEnglish[selectedDayIndex]}:`}
            </span>
            <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
              {displayEntries.length} {language === 'ar' ? 'حصص' : 'classes'}
            </span>
          </div>

          {isSelectedDayToday && (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'ar' ? 'الجدول المباشر لهذا اليوم' : 'Live Daily Schedule'}</span>
            </span>
          )}
        </div>

        {displayEntries.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">
              {currentRole === 'teacher'
                ? t('noTeachingClassesToday')
                : currentRole === 'student'
                ? t('noStudentClassesToday')
                : language === 'ar'
                ? 'لا توجد حصص مجدولة لهذا اليوم.'
                : 'No scheduled periods for today.'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {viewMode === 'personalized' && (
                <button
                  onClick={() => setViewMode('all')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  {language === 'ar'
                    ? 'اضغط هنا للاطلاع على جدول فصول المدرسة الأخرى'
                    : 'Click here to view all school classroom schedules'}
                </button>
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayEntries.map((period) => {
              const statusBadge = getPeriodStatusBadge(period.period);
              const isTeacherPeriod =
                currentRole === 'teacher' &&
                (period.teacherName.includes(currentUser.name || '') ||
                  (currentUser.name || '').includes(period.teacherName));

              // Check if any homework is assigned for this subject in student's class
              const subjectHomework = homeworkList.find(
                (hw) => hw.subject === period.subject && hw.className === period.className
              );

              return (
                <div
                  key={period.id}
                  className={`bg-white rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md group ${
                    currentRole === 'teacher' && isTeacherPeriod
                      ? 'border-emerald-300 hover:border-emerald-500'
                      : currentRole === 'student'
                      ? 'border-blue-200 hover:border-blue-400'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div>
                    {/* Header Row: Period # & Time Slot & Status */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-9 h-9 rounded-2xl font-black text-sm flex items-center justify-center border shadow-xs ${
                            currentRole === 'teacher'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                              : 'bg-blue-50 text-blue-800 border-blue-200/80'
                          }`}
                        >
                          {period.period}
                        </span>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">
                            {language === 'ar' ? `الحصة ${period.period}` : `Period ${period.period}`}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">{period.timeSlot}</span>
                        </div>
                      </div>

                      {statusBadge && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${statusBadge.style}`}>
                          {statusBadge.label}
                        </span>
                      )}
                    </div>

                    {/* ROLE-SPECIFIC BADGE (ما ستعطيه / ما ستأخذه) */}
                    <div className="mb-2.5">
                      {currentRole === 'teacher' ? (
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{t('teachingClass')}</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {language === 'ar' ? 'عطاء تدريسي' : 'Instructional'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-blue-100 text-blue-900 border border-blue-300">
                            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                            <span>{t('attendingClass')}</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {language === 'ar' ? 'حضور صفي' : 'Attendance'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Subject Title */}
                    <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-700 transition mb-3 flex items-center gap-2">
                      <BookOpen
                        className={`w-5 h-5 shrink-0 ${
                          currentRole === 'teacher' ? 'text-emerald-600' : 'text-blue-600'
                        }`}
                      />
                      <span>{language === 'ar' ? period.subject : period.subjectEn || period.subject}</span>
                    </h3>

                    {/* Details Box */}
                    <div className="space-y-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/70 text-xs">
                      {/* For TEACHER: Highlight target class prominently */}
                      {currentRole === 'teacher' ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold">{t('targetClass')}:</span>
                            <strong className="text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-black">
                              {period.className}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{t('room')}:</span>
                            </span>
                            <span className="font-bold text-slate-800">
                              {language === 'ar' ? period.room : period.roomEn || period.room}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">{language === 'ar' ? 'عدد الطلاب:' : 'Students:'}</span>
                            <span className="font-mono font-semibold text-slate-700">28 {language === 'ar' ? 'طالباً' : 'students'}</span>
                          </div>
                        </>
                      ) : (
                        /* For STUDENT & PARENT: Highlight subject teacher and room */
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{t('assignedTeacher')}:</span>
                            </span>
                            <strong className="text-slate-900 font-bold">
                              {period.teacherName}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{t('room')}:</span>
                            </span>
                            <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              {language === 'ar' ? period.room : period.roomEn || period.room}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">{t('class')}:</span>
                            <span className="font-semibold text-slate-700">{period.className}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Active Homework Alert for Student if exists */}
                    {currentRole === 'student' && subjectHomework && (
                      <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5 font-bold">
                        <BookOpenCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">
                          {language === 'ar' ? `واجب مستحق: ${subjectHomework.title}` : `Homework: ${subjectHomework.title}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {currentRole === 'teacher' ? (
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'ar' ? 'حصة معتمدة' : 'Confirmed'}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {period.className.split('-')[0]}
                        </span>
                      </div>
                    ) : currentRole === 'admin' ? (
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">{period.className}</span>
                        <button
                          onClick={() => handleOpenEdit(period)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition active:scale-95 shadow-xs"
                        >
                          <Pencil className="w-3 h-3 text-purple-600" />
                          <span>{language === 'ar' ? 'تعديل الحصة' : 'Edit Period'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'ar' ? 'حصة حضور أساسية' : 'Required Attendance'}</span>
                        </span>
                        <span className="font-mono text-slate-400">{selectedDayAr}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* QUICK EDIT PERIOD MODAL FOR PRINCIPAL */}
      {editingPeriod && currentRole === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {language === 'ar' ? 'تعديل الحصة (صلاحية مدير المدرسة)' : 'Edit Period (Principal)'}
                  </h3>
                  <span className="text-[11px] text-purple-700 font-bold">
                    {language === 'ar'
                      ? `الحصة ${editingPeriod.period} - يوم ${editingPeriod.day}`
                      : `Period ${editingPeriod.period} - ${editingPeriod.day}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingPeriod(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'اسم المادة' : 'Subject'}
                </label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'المعلم المشرف' : 'Teacher'}
                </label>
                <input
                  type="text"
                  value={editTeacher}
                  onChange={(e) => setEditTeacher(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'القاعة' : 'Room'}
                  </label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'التوقيت' : 'Time'}
                  </label>
                  <input
                    type="text"
                    value={editTimeSlot}
                    onChange={(e) => setEditTimeSlot(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPeriod(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-md shadow-purple-700/20"
                >
                  {language === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
