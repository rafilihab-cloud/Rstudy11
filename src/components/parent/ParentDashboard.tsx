import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  Award,
  CalendarCheck,
  BookOpenCheck,
  CheckCircle2,
  Send,
  Printer,
  MessageSquare,
  Clock,
  Plus,
  Minus,
  Paperclip,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  X,
  Wallet,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { DraggableScrollContainer } from '../shared/DraggableScrollContainer';

interface Props {
  onOpenReportCard: () => void;
  onNavigateToMessages: () => void;
}

export const ParentDashboard: React.FC<Props> = ({ onOpenReportCard, onNavigateToMessages }) => {
  const {
    currentUser,
    activeSchool,
    students,
    activeChildId,
    setActiveChildId,
    grades,
    homeworkList,
    attendance,
    timetable,
    leaveRequests,
    createLeaveRequest,
    language,
    t,
  } = useSchool();

  const parentChildren = students.filter(
    (s) => currentUser.childrenIds?.includes(s.id) || s.parentId === currentUser.id
  );

  const selectedChild =
    parentChildren.find((c) => c.id === activeChildId) || parentChildren[0] || students[0];

  const childGrades = grades.filter((g) => g.studentId === selectedChild.id);
  const childLeaves = leaveRequests.filter((l) => l.studentId === selectedChild.id);
  const childClassHomework = homeworkList.filter(
    (hw) => !hw.className || hw.className === selectedChild.className
  );

  const todayAttendance = attendance.find(
    (a) => a.studentId === selectedChild.id && a.date === '2026-10-28'
  );

  // Semester filtering & calculations
  const [gradeSemesterTab, setGradeSemesterTab] = useState<'first' | 'second' | 'both'>('first');

  const sem1Grades = useMemo(
    () =>
      childGrades.filter(
        (g) =>
          g.term === 'النصف الأول' ||
          g.term === 'الفصل الأول' ||
          g.semester === 'first' ||
          !g.term ||
          g.term === 'منتصف الفصل'
      ),
    [childGrades]
  );

  const sem2Grades = useMemo(
    () =>
      childGrades.filter(
        (g) =>
          g.term === 'النصف الثاني' ||
          g.term === 'الفصل الثاني' ||
          g.semester === 'second'
      ),
    [childGrades]
  );

  const sem1Total = sem1Grades.reduce((acc, g) => acc + g.score, 0);
  const sem1Max = sem1Grades.reduce((acc, g) => acc + g.maxScore, 0);
  const sem1Avg = sem1Max > 0 ? Number(((sem1Total / sem1Max) * 100).toFixed(1)) : 0;

  const sem2Total = sem2Grades.reduce((acc, g) => acc + g.score, 0);
  const sem2Max = sem2Grades.reduce((acc, g) => acc + g.maxScore, 0);
  const sem2Avg = sem2Max > 0 ? Number(((sem2Total / sem2Max) * 100).toFixed(1)) : 0;

  const combinedTotal = sem1Total + sem2Total;
  const combinedMax = sem1Max + sem2Max;
  const combinedFinalAvg =
    combinedMax > 0 ? Number(((combinedTotal / combinedMax) * 100).toFixed(1)) : 0;

  // Active grades according to tab
  const activeSemesterGrades = useMemo(() => {
    if (gradeSemesterTab === 'first') return sem1Grades;
    if (gradeSemesterTab === 'second') return sem2Grades;
    return childGrades;
  }, [gradeSemesterTab, sem1Grades, sem2Grades, childGrades]);

  // Group child grades by subject for (+) accordion
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({
    الرياضيات: true,
    Mathematics: true,
  });

  const toggleSubjectExpanded = (subject: string) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subject]: !prev[subject],
    }));
  };

  const childSubjectGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        subject: string;
        subjectEn?: string;
        items: typeof activeSemesterGrades;
        totalScore: number;
        maxScore: number;
        avgPercentage: number;
      }
    > = {};

    activeSemesterGrades.forEach((g) => {
      if (!groups[g.subject]) {
        groups[g.subject] = {
          subject: g.subject,
          subjectEn: g.subjectEn,
          items: [],
          totalScore: 0,
          maxScore: 0,
          avgPercentage: 0,
        };
      }
      groups[g.subject].items.push(g);
      groups[g.subject].totalScore += g.score;
      groups[g.subject].maxScore += g.maxScore;
    });

    Object.values(groups).forEach((group) => {
      group.avgPercentage =
        group.maxScore > 0 ? Number(((group.totalScore / group.maxScore) * 100).toFixed(1)) : 0;
    });

    return groups;
  }, [activeSemesterGrades]);

  // Leave request form
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState('2026-10-29');
  const [leaveEndDate, setLeaveEndDate] = useState('2026-10-29');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccessNotice, setLeaveSuccessNotice] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  const handleSendLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    createLeaveRequest({
      parentId: currentUser.id,
      parentName: currentUser.name,
      studentId: selectedChild.id,
      studentName: selectedChild.name,
      className: selectedChild.className,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      reason: leaveReason,
    });

    setShowLeaveModal(false);
    setLeaveReason('');
    setLeaveSuccessNotice(true);
    setTimeout(() => setLeaveSuccessNotice(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Parent Welcome & Children Switcher */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Active School Logo & Badge */}
        {activeSchool && (
          <div className="relative z-10 flex items-center gap-2.5 bg-black/25 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl border border-white/15 w-fit mb-3">
            {activeSchool.logo ? (
              <img
                src={activeSchool.logo}
                alt={activeSchool.name}
                className="w-7 h-7 rounded-lg object-contain bg-white/95 p-0.5 shadow-xs"
              />
            ) : (
              <Award className="w-5 h-5 text-amber-300" />
            )}
            <div>
              <span className="text-xs font-black text-amber-200 block leading-tight">
                {language === 'ar' ? activeSchool.name : activeSchool.nameEn || activeSchool.name}
              </span>
              <span className="text-[10px] text-amber-100/70">
                {language === 'ar' ? 'البوابة الرسمية لأولياء الأمور' : 'Official Parents Portal'}
              </span>
            </div>
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                {t('parentWelcome')}
              </span>
              <span className="text-xs text-amber-300">{t('appName')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {language === 'ar' ? currentUser.name : currentUser.nameEn || currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-1">
              {language === 'ar'
                ? 'متابعة مباشرة وشاملة للتحصيل الأكاديمي، سجلات الحضور والغياب، والواجبات المدرسية لأبنائك الكرام.'
                : 'Direct and comprehensive monitoring of your children academic progress, attendance, and homework.'}
            </p>
          </div>

          {/* Direct Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-amber-50 font-bold text-xs sm:text-sm shadow transition"
            >
              <Send className="w-4 h-4 text-amber-600" />
              <span>{t('requestLeaveBtn')}</span>
            </button>

            <button
              onClick={onNavigateToMessages}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('contactTeacherBtn')}</span>
            </button>
          </div>
        </div>

        {/* Child Selector Tabs (Draggable on PC & Mobile) */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <DraggableScrollContainer fadeColor="transparent" className="py-1" wrapperClassName="w-full">
            <div className="flex items-center gap-3 whitespace-nowrap px-2 py-0.5 min-w-max">
              <span className="text-xs font-bold text-amber-200 shrink-0">{t('selectChildToMonitor')}</span>
              {parentChildren.map((child) => {
                const isSelected = selectedChild.id === child.id;
                return (
                  <button
                    key={child.id}
                    onClick={() => setActiveChildId(child.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-md ring-2 ring-amber-400'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <img
                      src={child.avatar}
                      alt={child.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span>{language === 'ar' ? child.name : child.nameEn || child.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({child.className})
                    </span>
                  </button>
                );
              })}
            </div>
          </DraggableScrollContainer>
        </div>
      </div>

      {leaveSuccessNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{language === 'ar' ? 'تم إرسال طلب الاستئذان بنجاح إلى إدارة المعهد' : 'Leave request submitted successfully'}</span>
        </div>
      )}

      {/* TUITION & INSTALLMENTS PAYMENT STATUS CARD */}
      {(() => {
        const total = selectedChild.totalTuitionFee ?? 2500;
        const paid = selectedChild.paidTuitionFee ?? 1800;
        const remaining = Math.max(0, total - paid);
        const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 100;
        const isPaidInFull = paid >= total;
        const isPartial = paid > 0 && paid < total;

        return (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base sm:text-lg">
                      {language === 'ar' ? 'سجل الرسوم والأقساط المدرسية المسددة' : 'Tuition & School Fee Payments'}
                    </h3>
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                        isPaidInFull
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isPartial
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {isPaidInFull
                        ? language === 'ar'
                          ? 'تم السداد بالكامل ✓'
                          : 'Paid in Full'
                        : isPartial
                        ? language === 'ar'
                          ? `مسدد جزئياً (%${percent})`
                          : `Partial (${percent}%)`
                        : language === 'ar'
                        ? 'بانتظار السداد'
                        : 'Unpaid'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'ar'
                      ? `بيان الدفعات والأقساط المسددة من قبلكم لإدارة المدرسة للطالب (${language === 'ar' ? selectedChild.name : selectedChild.nameEn || selectedChild.name})`
                      : `Verified fee statement for ${selectedChild.nameEn || selectedChild.name}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                <span>{language === 'ar' ? 'نسبة السداد:' : 'Payment progress:'}</span>
                <span className="font-mono text-emerald-700 font-black">%{percent}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {/* Paid to school */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 block mb-1">
                  {language === 'ar' ? 'المبلغ المسدد للمدرسة حتى الآن' : 'Amount Paid to School'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-emerald-700">$</span>
                  <span className="text-2xl font-black text-emerald-900 font-mono">
                    {paid.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">{language === 'ar' ? 'دولار' : 'USD'}</span>
                </div>
                <span className="text-[11px] text-emerald-600 mt-1 block">
                  {language === 'ar' ? 'معتمد ومقيد في سجل الإدارة المالية' : 'Officially recorded'}
                </span>
              </div>

              {/* Total required */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-600 block mb-1">
                  {language === 'ar' ? 'إجمالي الرسوم الدراسية السنوية' : 'Total Annual Tuition'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-slate-500">$</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {total.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'دولار' : 'USD'}</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {language === 'ar' ? 'تشمل المقررات والأنشطة' : 'Inclusive fee'}
                </span>
              </div>

              {/* Remaining */}
              <div
                className={`p-4 rounded-2xl border ${
                  remaining > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span
                  className={`text-xs font-bold block mb-1 ${
                    remaining > 0 ? 'text-amber-800' : 'text-slate-500'
                  }`}
                >
                  {language === 'ar' ? 'المبلغ المتبقي' : 'Remaining Balance'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-amber-700">$</span>
                  <span
                    className={`text-2xl font-black font-mono ${
                      remaining > 0 ? 'text-amber-900' : 'text-emerald-700'
                    }`}
                  >
                    {remaining.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'دولار' : 'USD'}</span>
                </div>
                <span
                  className={`text-[11px] mt-1 block font-medium ${
                    remaining > 0 ? 'text-amber-700' : 'text-emerald-600'
                  }`}
                >
                  {remaining > 0
                    ? language === 'ar'
                      ? 'يمكن سداده عبر إدارة الحسابات بالمدرسة'
                      : 'Payable to finance office'
                    : language === 'ar'
                    ? 'لا توجد مستحقات متبقية'
                    : 'Zero balance due'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPaidInFull ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-amber-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* TODAY'S ATTENDANCE STATUS CARD */}
      <div
        className={`p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          todayAttendance?.status === 'absent'
            ? 'bg-rose-50 border-rose-300'
            : todayAttendance?.status === 'late'
            ? 'bg-amber-50 border-amber-300'
            : 'bg-emerald-50/80 border-emerald-200'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              todayAttendance?.status === 'absent'
                ? 'bg-rose-600 text-white'
                : todayAttendance?.status === 'late'
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <CalendarCheck className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-base">
                {t('todayAttendanceStatus')} ({selectedChild.name})
              </h3>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                  todayAttendance?.status === 'absent'
                    ? 'bg-rose-200 text-rose-900'
                    : todayAttendance?.status === 'late'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-emerald-200 text-emerald-900'
                }`}
              >
                {todayAttendance?.status === 'absent'
                  ? t('studentIsAbsent')
                  : todayAttendance?.status === 'late'
                  ? t('studentIsLate')
                  : t('studentIsPresent')}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {todayAttendance?.notes ||
                (language === 'ar'
                  ? 'الطالب متواجد في الفصل ويتابع الحصص الدراسية المقررة بانتظام.'
                  : 'Student is present and participating in scheduled classes.')}
            </p>
          </div>
        </div>

        <div className="text-left flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">
            {t('totalAbsences')}: <strong>{selectedChild.totalAbsences} {language === 'ar' ? 'أيام' : 'days'}</strong>
          </span>
        </div>
      </div>

      {/* CHILD'S TODAY SCHEDULE CARD (الحصص التي سيأخذها الابن اليوم) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                {language === 'ar'
                  ? `الحصص المقررة للابن (${selectedChild.name}) اليوم الأربعاء:`
                  : `Classes ${selectedChild.name} Will Attend Today (Wednesday):`}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? `الحصص الدراسية المقررة لفصله [${selectedChild.className}]، المعلم المشرف، ورقم القاعة`
                  : `Scheduled periods for class [${selectedChild.className}] with teachers and room numbers`}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 self-start sm:self-auto">
            {timetable.filter((t) => t.day === 'الأربعاء' && t.className === selectedChild.className).length}{' '}
            {language === 'ar' ? 'حصص دراسية' : 'classes'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {timetable
            .filter((t) => t.day === 'الأربعاء' && t.className === selectedChild.className)
            .sort((a, b) => a.period - b.period)
            .map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-amber-300 transition text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                      #{c.period}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{c.timeSlot.split('-')[0]}</span>
                  </div>
                  <strong className="block font-black text-slate-900 text-xs mb-1 line-clamp-1">{c.subject}</strong>
                  <span className="text-[10px] text-slate-500 block truncate">{c.teacherName}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600 font-semibold">
                  <span>{c.room}</span>
                  <span className="text-emerald-700 font-bold">{language === 'ar' ? 'مقررة' : 'Scheduled'}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Main Grid: Grades (with [+] expander) & Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Child Grades with (+) Button next to Mathematics & all subjects */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 text-base">
                  {language === 'ar' ? `درجات ${selectedChild.name} الأكاديمية` : `${selectedChild.name}'s Academic Grades`}
                </h3>
              </div>
              <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                {t('expandMathHint')}
              </p>
            </div>
            <button
              onClick={onOpenReportCard}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 self-start sm:self-auto"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('printReportCard')}</span>
            </button>
          </div>

          {/* Semester Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setGradeSemesterTab('first')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition ${
                gradeSemesterTab === 'first'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'النصف الأول' : 'Semester 1'}
            </button>
            <button
              onClick={() => setGradeSemesterTab('second')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition ${
                gradeSemesterTab === 'second'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'النصف الثاني' : 'Semester 2'}
            </button>
            <button
              onClick={() => setGradeSemesterTab('both')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition ${
                gradeSemesterTab === 'both'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'المجموع والمعدل النهائي' : 'Final Total & GPA'}
            </button>
          </div>

          {/* Semester Total & Average Banner */}
          {gradeSemesterTab === 'first' && (
            <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">{language === 'ar' ? 'نتائج النصف الأول:' : 'Semester 1 Results:'}</span>
                <span className="text-slate-500 font-mono">({sem1Grades.length} {language === 'ar' ? 'تقييم' : 'items'})</span>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block">{language === 'ar' ? 'المجموع:' : 'Total:'}</span>
                  <span className="font-black text-slate-900 font-mono text-sm">{sem1Total} / {sem1Max}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-700 block">{language === 'ar' ? 'المعدل:' : 'Average:'}</span>
                  <span className="font-black text-blue-700 font-mono text-sm">%{sem1Avg}</span>
                </div>
              </div>
            </div>
          )}

          {gradeSemesterTab === 'second' && (
            <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-900">{language === 'ar' ? 'نتائج النصف الثاني:' : 'Semester 2 Results:'}</span>
                <span className="text-slate-500 font-mono">({sem2Grades.length} {language === 'ar' ? 'تقييم' : 'items'})</span>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block">{language === 'ar' ? 'المجموع:' : 'Total:'}</span>
                  <span className="font-black text-slate-900 font-mono text-sm">{sem2Total} / {sem2Max}</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-700 block">{language === 'ar' ? 'المعدل:' : 'Average:'}</span>
                  <span className="font-black text-purple-700 font-mono text-sm">%{sem2Avg}</span>
                </div>
              </div>
            </div>
          )}

          {gradeSemesterTab === 'both' && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{language === 'ar' ? 'المجموع والمعدل النهائي للفصلين معاً' : 'Cumulative Annual Results (Semesters 1 & 2)'}</span>
                </span>
                <span className="font-mono font-bold text-amber-800 text-[11px]">
                  {childGrades.length} {language === 'ar' ? 'تقييماً كلياً' : 'total items'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-amber-200/60 text-center">
                <div className="p-2 rounded-xl bg-white border border-amber-200">
                  <span className="text-[10px] text-slate-500 block">{language === 'ar' ? 'مجموع الفصل 1' : 'Sem 1 Total'}</span>
                  <span className="font-bold text-slate-900 font-mono">{sem1Total}</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-amber-200">
                  <span className="text-[10px] text-slate-500 block">{language === 'ar' ? 'مجموع الفصل 2' : 'Sem 2 Total'}</span>
                  <span className="font-bold text-slate-900 font-mono">{sem2Total}</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-300">
                  <span className="text-[10px] text-amber-900 font-bold block">{language === 'ar' ? 'المجموع النهائي' : 'Final Total'}</span>
                  <span className="font-black text-amber-950 font-mono text-sm">{combinedTotal} / {combinedMax}</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-600 text-white shadow-xs">
                  <span className="text-[10px] text-amber-100 font-bold block">{language === 'ar' ? 'المعدل النهائي' : 'Final GPA'}</span>
                  <span className="font-black font-mono text-sm">%{combinedFinalAvg}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {Object.values(childSubjectGroups).map((group) => {
              const isExpanded = !!expandedSubjects[group.subject];
              const isMath = group.subject === 'الرياضيات' || group.subject === 'Mathematics';

              return (
                <div
                  key={group.subject}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isExpanded ? 'border-amber-400 bg-amber-50/20 shadow-xs' : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Header with (+) button */}
                  <div
                    onClick={() => toggleSubjectExpanded(group.subject)}
                    className="p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSubjectExpanded(group.subject);
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black transition ${
                          isExpanded
                            ? 'bg-amber-600 text-white'
                            : isMath
                            ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">
                            {language === 'ar' ? group.subject : group.subjectEn || group.subject}
                          </span>
                          {isMath && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                              (+)
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {group.items.length} {language === 'ar' ? 'تقييمات' : 'assessments'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">
                        {group.totalScore} / {group.maxScore}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          group.avgPercentage >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        %{group.avgPercentage}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-amber-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="p-3 pt-0 border-t border-slate-100 bg-white space-y-2 animate-fadeIn">
                      <span className="text-[10px] font-bold text-slate-500 block pt-2">
                        {t('allSubjectAssessments')}
                      </span>
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{item.examType}</span>
                            <span className="font-mono font-bold text-blue-700">
                              {item.score} / {item.maxScore}
                            </span>
                          </div>
                          {item.feedback && (
                            <p className="text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-200/60">
                              {language === 'ar' ? item.feedback : item.feedbackEn || item.feedback}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Child Homework Status with Solution Attachments View */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-black text-slate-900 text-base">{t('homeworkTab')}</h3>
                <span className="text-[11px] font-bold text-emerald-700 block">
                  {language === 'ar' ? `المخصصة لصف: ${selectedChild.className}` : `Assigned for: ${selectedChild.className}`}
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              {childClassHomework.length} {language === 'ar' ? 'واجبات' : 'tasks'}
            </span>
          </div>

          {childClassHomework.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-700">{t('noHomeworkForClass')}</p>
              <p className="text-[11px] text-slate-400">
                {language === 'ar'
                  ? `لا توجد واجبات معلقة حالياً لطلاب (${selectedChild.className})`
                  : `No pending homework currently assigned for (${selectedChild.className})`}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {childClassHomework.map((hw) => {
              const submission = hw.submissions.find((s) => s.studentId === selectedChild.id);
              const isSubmitted = !!submission;

              return (
                <div
                  key={hw.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{hw.title}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {hw.dueDate}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed text-[11px]">{hw.description}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">{hw.subject}</span>
                    {isSubmitted ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('alreadySubmitted')}{' '}
                        {submission.status === 'graded' && `(${submission.score}/${submission.maxScore})`}
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold">{t('pendingGrading')}</span>
                    )}
                  </div>

                  {/* Child's Submitted Attachment Photos */}
                  {isSubmitted && submission.attachments && submission.attachments.length > 0 && (
                    <div className="pt-1.5 flex flex-wrap gap-2">
                      {submission.attachments.map((att) => (
                        <div
                          key={att.id}
                          onClick={() => setPreviewImageModal(att.url)}
                          className="flex items-center gap-1.5 p-1 px-2 rounded-md bg-white border border-emerald-300 text-[10px] font-bold text-emerald-800 cursor-pointer hover:shadow-xs"
                        >
                          <ImageIcon className="w-3 h-3 text-emerald-600" />
                          <span className="truncate max-w-[130px]">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Leave Requests Log for Child */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-base">{t('submittedExcuses')}</h3>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            + {t('newLeaveRequest')}
          </button>
        </div>

        {childLeaves.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">
            {language === 'ar' ? 'لم يتم تقديم طلبات غياب سابقة.' : 'No previous leave requests filed.'}
          </p>
        ) : (
          <div className="space-y-2">
            {childLeaves.map((lr) => (
              <div
                key={lr.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{lr.reason}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {lr.startDate} {lr.startDate !== lr.endDate && `→ ${lr.endDate}`}
                    </span>
                  </div>
                  {lr.adminResponse && (
                    <p className="text-[11px] text-slate-600 mt-1">
                      {language === 'ar' ? 'رد الإدارة: ' : 'Admin note: '}
                      {lr.adminResponse}
                    </p>
                  )}
                </div>

                <span
                  className={`font-black px-2.5 py-1 rounded-lg text-xs self-start sm:self-auto ${
                    lr.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : lr.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {lr.status === 'approved'
                    ? t('leaveApproved')
                    : lr.status === 'rejected'
                    ? t('leaveRejected')
                    : t('leavePending')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Submit Leave Request */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="font-black text-slate-900 text-lg mb-1">{t('newLeaveRequest')}</h3>
            <p className="text-xs text-slate-500 mb-4">{t('parentWelcome')}</p>

            <form onSubmit={handleSendLeaveRequest} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('studentRole')}:
                </label>
                <input
                  type="text"
                  disabled
                  value={`${selectedChild.name} (${selectedChild.className})`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-100 text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('startDate')}:
                  </label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('endDate')}:</label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('leaveReason')}:
                </label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="سبب الاستئذان أو الموعد الطبي..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition"
                >
                  {t('submit')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {previewImageModal && (
        <div
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn"
        >
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-4 left-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageModal}
              alt="Preview"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
