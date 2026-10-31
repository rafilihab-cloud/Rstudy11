import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FileAttachment, GradeItem } from '../../types';
import {
  Award,
  BookOpenCheck,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Send,
  Plus,
  Minus,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wallet,
  Receipt,
  Calculator,
  Layers,
  TrendingUp,
} from 'lucide-react';

interface Props {
  onOpenReportCard: () => void;
  onNavigateToSchedule?: () => void;
}

export const StudentDashboard: React.FC<Props> = ({ onOpenReportCard, onNavigateToSchedule }) => {
  const {
    currentUser,
    students,
    grades,
    homeworkList,
    submitHomework,
    attendance,
    timetable,
    language,
    t,
    activeSchool,
  } = useSchool();

  const student = students.find((s) => s.id === currentUser.id) || students[0];
  const myGrades = grades.filter((g) => g.studentId === student.id);
  const myAttendance = attendance.filter((a) => a.studentId === student.id);

  // Tuition & Installment Payment Calculation (in USD)
  const totalTuition = student.totalTuitionFee ?? 2500;
  const paidTuition = student.paidTuitionFee ?? 1800;
  const remainingTuition = Math.max(0, totalTuition - paidTuition);
  const tuitionPaidPercent = Math.min(100, Math.round((paidTuition / totalTuition) * 100));

  // Semester / Term Division for Grades
  const [selectedSemesterTab, setSelectedSemesterTab] = useState<'first' | 'second' | 'final'>('first');

  // Semester 1 (النصف الأول)
  const sem1Grades = myGrades.filter(
    (g) => g.term === 'النصف الأول' || g.term === 'الفصل الأول' || g.semester === 'first'
  );
  const sem1Earned = sem1Grades.reduce((sum, g) => sum + g.score, 0);
  const sem1Possible = sem1Grades.reduce((sum, g) => sum + g.maxScore, 0);
  const sem1Average = sem1Possible > 0 ? ((sem1Earned / sem1Possible) * 100).toFixed(1) : '0';

  // Semester 2 (النصف الثاني)
  const sem2Grades = myGrades.filter(
    (g) => g.term === 'النصف الثاني' || g.term === 'الفصل الثاني' || g.semester === 'second'
  );
  const sem2Earned = sem2Grades.reduce((sum, g) => sum + g.score, 0);
  const sem2Possible = sem2Grades.reduce((sum, g) => sum + g.maxScore, 0);
  const sem2Average = sem2Possible > 0 ? ((sem2Earned / sem2Possible) * 100).toFixed(1) : '0';

  // Combined Final for Both Semesters (المجموع والمعدل النهائي للفصلين)
  const finalTotalEarned = sem1Earned + sem2Earned;
  const finalTotalPossible = sem1Possible + sem2Possible;
  const finalCombinedAverage =
    finalTotalPossible > 0 ? ((finalTotalEarned / finalTotalPossible) * 100).toFixed(1) : student.gpa;

  // Filter homework specifically assigned to this student's class
  const myClassHomework = homeworkList.filter(
    (hw) => !hw.className || hw.className === student.className
  );

  // --- Expand / Collapse state for Subject Grades (Accordion) ---
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

  // Grouping helper
  const groupGradesBySubject = (gradesList: GradeItem[]) => {
    const groups: Record<
      string,
      {
        subject: string;
        subjectEn?: string;
        items: GradeItem[];
        totalScore: number;
        maxScore: number;
        avgPercentage: number;
      }
    > = {};

    gradesList.forEach((g) => {
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
  };

  const sem1Groups = React.useMemo(() => groupGradesBySubject(sem1Grades), [sem1Grades]);
  const sem2Groups = React.useMemo(() => groupGradesBySubject(sem2Grades), [sem2Grades]);
  const allSubjectGroups = React.useMemo(() => groupGradesBySubject(myGrades), [myGrades]);

  // List of all unique subject names for comparison
  const allUniqueSubjects = React.useMemo(() => {
    const set = new Set<string>();
    myGrades.forEach((g) => set.add(g.subject));
    return Array.from(set);
  }, [myGrades]);

  // --- Homework submission state with File / Photo upload ---
  const [submittingHwId, setSubmittingHwId] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  // File Upload handler (reads as DataURL so images preview immediately)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const isImg = file.type.startsWith('image/');
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newAttachment: FileAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          url,
          type: isImg ? 'image' : 'file',
          size: `${(file.size / 1024).toFixed(0)} KB`,
        };
        setAttachedFiles((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Preset demo photo for quick testing without picking files
  const handleAddSampleNotebookPhoto = () => {
    const sampleAttachment: FileAttachment = {
      id: `att_sample_${Date.now()}`,
      name: language === 'ar' ? 'صورة_حل_الدفتر_المدرسي.jpg' : 'notebook_solution_photo.jpg',
      url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
      type: 'image',
      size: '1.4 MB',
    };
    setAttachedFiles((prev) => [...prev, sampleAttachment]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachedFiles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmitSolution = (hwId: string) => {
    if (!submissionContent.trim() && attachedFiles.length === 0) return;

    submitHomework(
      hwId,
      submissionContent,
      attachedFiles,
      attachedFiles[0]?.name || (language === 'ar' ? 'حل_الواجب_المدرسي' : 'homework_solution')
    );

    setSubmittingHwId(null);
    setSubmissionContent('');
    setAttachedFiles([]);
    setSubmitSuccessNotice(true);
    setTimeout(() => setSubmitSuccessNotice(false), 3500);
  };

  const totalPossible = myGrades.reduce((acc, g) => acc + g.maxScore, 0);
  const totalEarned = myGrades.reduce((acc, g) => acc + g.score, 0);
  const calculatedGpa = totalPossible > 0 ? ((totalEarned / totalPossible) * 100).toFixed(1) : student.gpa;

  return (
    <div className="space-y-6">
      {/* Student Hero Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
              />
              <span className="absolute -top-2 -right-2 p-1 px-2 rounded-lg bg-amber-400 text-blue-950 font-black text-[10px] shadow">
                {language === 'ar' ? `المركز ${student.rankInClass}` : `Rank #${student.rankInClass}`}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {activeSchool?.logo && (
                  <img
                    src={activeSchool.logo}
                    alt={activeSchool.name}
                    className="w-5 h-5 rounded-md object-cover border border-white/30"
                  />
                )}
                <span className="text-xs text-blue-200 font-bold">
                  {language === 'ar' ? activeSchool?.name : activeSchool?.nameEn || activeSchool?.name}
                </span>
                <span className="text-blue-400">•</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {t('studentWelcome')}
                </span>
                <span className="text-xs text-blue-300">
                  {language === 'ar' ? student.className : student.classNameEn || student.className}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                {language === 'ar' ? student.name : student.nameEn || student.name}
              </h1>
              <p className="text-xs text-blue-200 mt-1">
                {language === 'ar' ? 'الرقم الأكاديمي: ' : 'Academic ID: '}
                <span className="font-mono">{student.nationalId}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Print Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs text-center min-w-[90px]">
              <span className="text-2xl font-black block text-emerald-400">%{calculatedGpa}</span>
              <span className="text-[11px] text-blue-200">{t('gpa')}</span>
            </div>

            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs text-center min-w-[90px]">
              <span className="text-2xl font-black block text-amber-300">{student.totalAbsences}</span>
              <span className="text-[11px] text-blue-200">{t('absencesDays')}</span>
            </div>

            <button
              onClick={onOpenReportCard}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition active:scale-95"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>{t('printReportCard')}</span>
            </button>
          </div>
        </div>

        {/* Badges bar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs text-blue-300 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('honorBadges')}:</span>
          </span>
          {student.badges.map((b, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-xl bg-white/10 text-white text-xs font-semibold border border-white/10"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* TUITION & INSTALLMENTS PAYMENT STATUS CARD (حالة تسديد القسط والرسوم الدراسية) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shadow-xs shrink-0">
              <Wallet className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">
                  {language === 'ar' ? 'حالة القسط والرسوم الدراسية للمدرسة' : 'Tuition & School Fee Installments'}
                </h3>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    remainingTuition === 0
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : paidTuition > 0
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {remainingTuition === 0
                    ? (language === 'ar' ? 'مسدد بالكامل ✓' : 'Fully Paid ✓')
                    : paidTuition > 0
                    ? (language === 'ar' ? `سداد جزئي (${tuitionPaidPercent}%)` : `Partial Payment (${tuitionPaidPercent}%)`)
                    : (language === 'ar' ? 'بانتظار السداد' : 'Pending Payment')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar'
                  ? 'سجل المبالغ المسددة والمتبقية من إجمالي الرسوم المعتمدة بحسابك لدى إدارة المدرسة'
                  : 'Record of paid amounts and remaining installments verified by administration'}
              </p>
            </div>
          </div>
          <div className="text-xs font-bold text-slate-400 font-mono">
            {language === 'ar' ? 'العام الدراسي 2026' : 'Academic Year 2026'}
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
              <span>{language === 'ar' ? 'المبلغ المسدد للمدرسة:' : 'Amount Paid:'}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-950 font-sans flex items-baseline gap-1">
              <span className="text-emerald-700 text-lg">$</span>
              <span>{paidTuition.toLocaleString()}</span>
              <span className="text-xs font-bold text-emerald-700 mr-1">
                {language === 'ar' ? 'دولار' : 'USD'}
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
              {language === 'ar' ? `تم سداد نسبة ${tuitionPaidPercent}% من إجمالي القسط` : `${tuitionPaidPercent}% paid`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
            <div className="flex items-center justify-between text-xs text-blue-800 font-bold mb-1">
              <span>{language === 'ar' ? 'إجمالي القسط السنوي:' : 'Total Tuition Fee:'}</span>
              <Receipt className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-950 font-sans flex items-baseline gap-1">
              <span className="text-blue-700 text-lg">$</span>
              <span>{totalTuition.toLocaleString()}</span>
              <span className="text-xs font-bold text-blue-700 mr-1">
                {language === 'ar' ? 'دولار' : 'USD'}
              </span>
            </div>
            <span className="text-[10px] text-blue-700 font-semibold block mt-1">
              {language === 'ar' ? 'الرسوم الدراسية الشاملة' : 'Annual Comprehensive Fee'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-700 font-bold mb-1">
              <span>{language === 'ar' ? 'المبلغ المتبقي للسداد:' : 'Remaining Balance:'}</span>
              <Wallet className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-sans flex items-baseline gap-1">
              <span className="text-slate-500 text-lg">$</span>
              <span>{remainingTuition.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-500 mr-1">
                {language === 'ar' ? 'دولار' : 'USD'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold block mt-1">
              {remainingTuition === 0
                ? (language === 'ar' ? 'تم تسديد كامل الرسوم بنجاح' : 'No balance due')
                : (language === 'ar' ? 'مستحق السداد لإدارة المجمع' : 'Due to school finance')}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
            <span>{language === 'ar' ? 'نسبة إنجاز سداد الرسوم' : 'Payment Completion'}</span>
            <span className="font-mono text-emerald-700 font-black">%{tuitionPaidPercent}</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/80">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                tuitionPaidPercent >= 100
                  ? 'bg-emerald-500'
                  : tuitionPaidPercent >= 50
                  ? 'bg-blue-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${tuitionPaidPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* TODAY'S CLASSES CARD (الحصص التي سآخذها اليوم) */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-white border border-blue-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/25 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">
                  {language === 'ar'
                    ? 'حصصي الدراسية المقررة اليوم (الحصص التي سآخذها اليوم):'
                    : 'Classes You Are Attending Today (Wednesday):'}
                </h3>
                <span className="text-[10px] font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md border border-blue-200">
                  {timetable.filter((t) => t.day === 'الأربعاء' && t.className === student.className).length}{' '}
                  {language === 'ar' ? 'حصص مقررة' : 'classes'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {language === 'ar'
                  ? `الحصص المجدولة لفصلك [${student.className}] اليوم الأربعاء والقاعات المحددة لكل مادة`
                  : `Scheduled periods for your class [${student.className}] today with teachers and rooms`}
              </p>
            </div>
          </div>
          {onNavigateToSchedule && (
            <button
              onClick={onNavigateToSchedule}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'عرض تفاصيل الجدول' : 'View Full Schedule'}</span>
            </button>
          )}
        </div>

        {/* Classes Horizontal Carousel / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          {timetable
            .filter((t) => t.day === 'الأربعاء' && t.className === student.className)
            .sort((a, b) => a.period - b.period)
            .map((c, idx) => (
              <div
                key={c.id}
                className="p-3 rounded-2xl bg-white border border-blue-100 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                      #{c.period}
                    </span>
                    {idx === 0 ? (
                      <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.2 rounded animate-pulse">
                        {language === 'ar' ? 'الآن' : 'Now'}
                      </span>
                    ) : idx === 1 ? (
                      <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.2 rounded">
                        {language === 'ar' ? 'التالية' : 'Next'}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-mono">{c.timeSlot.split('-')[0]}</span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xs mb-1 line-clamp-1">{c.subject}</h4>
                  <div className="text-[10px] text-slate-500 truncate">
                    <span>{c.teacherName}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <span>{c.room}</span>
                  <span className="text-blue-600">{language === 'ar' ? 'حضور' : 'Attend'}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {submitSuccessNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{t('submittedSuccessfully')}</span>
        </div>
      )}

      {/* Main Content Grid: Grades & Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRADES SECTION WITH SEMESTER TABS & FINAL CUMULATIVE VIEW (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header & Semester Switcher Tabs */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {language === 'ar' ? 'سجل الدرجات والتقييمات الأكاديمية' : 'Academic Grades & Transcripts'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar'
                      ? 'عرض منفصل لدرجات ومعدل النصف الأول والنصف الثاني، بالإضافة للمجموع والمعدل النهائي للفصلين'
                      : 'Separate views for Semester 1 & 2 with total score, average, and final combined marks'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Prominent Semester Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedSemesterTab('first')}
                className={`py-2 px-2 sm:px-3 rounded-lg transition text-center flex items-center justify-center gap-1.5 ${
                  selectedSemesterTab === 'first'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{language === 'ar' ? 'النصف الأول' : 'Semester 1'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSemesterTab('second')}
                className={`py-2 px-2 sm:px-3 rounded-lg transition text-center flex items-center justify-center gap-1.5 ${
                  selectedSemesterTab === 'second'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{language === 'ar' ? 'النصف الثاني' : 'Semester 2'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSemesterTab('final')}
                className={`py-2 px-2 sm:px-3 rounded-lg transition text-center flex items-center justify-center gap-1.5 ${
                  selectedSemesterTab === 'final'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-900 hover:text-amber-950 hover:bg-amber-100/70'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 hidden sm:inline" />
                <span>{language === 'ar' ? 'النهائي (الفصلين معاً)' : 'Final (Both Semesters)'}</span>
              </button>
            </div>
          </div>

          {/* VIEW 1 & 2: INDIVIDUAL SEMESTERS (النصف الأول أو النصف الثاني) */}
          {(selectedSemesterTab === 'first' || selectedSemesterTab === 'second') && (() => {
            const isFirst = selectedSemesterTab === 'first';
            const currentEarned = isFirst ? sem1Earned : sem2Earned;
            const currentPossible = isFirst ? sem1Possible : sem2Possible;
            const currentAverage = isFirst ? sem1Average : sem2Average;
            const currentGroups = isFirst ? sem1Groups : sem2Groups;

            return (
              <div className="space-y-4 animate-fadeIn">
                {/* Total & Average Summary Card for this Semester */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    isFirst
                      ? 'bg-gradient-to-r from-blue-50 via-sky-50 to-white border-blue-200'
                      : 'bg-gradient-to-r from-purple-50 via-indigo-50 to-white border-purple-200'
                  }`}
                >
                  <div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border mb-1.5 inline-block ${
                        isFirst
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : 'bg-purple-100 text-purple-900 border-purple-300'
                      }`}
                    >
                      {isFirst
                        ? (language === 'ar' ? 'نتائج ومعدل النصف الأول' : 'Semester 1 Results')
                        : (language === 'ar' ? 'نتائج ومعدل النصف الثاني' : 'Semester 2 Results')}
                    </span>
                    <h4 className="font-black text-slate-900 text-lg">
                      {isFirst
                        ? (language === 'ar' ? 'ملخص درجات النصف الأول من السنة' : 'Semester 1 Academic Summary')
                        : (language === 'ar' ? 'ملخص درجات النصف الثاني من السنة' : 'Semester 2 Academic Summary')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {Object.keys(currentGroups).length}{' '}
                      {language === 'ar' ? 'مواد تم رصد اختباراتها وتقييماتها' : 'subjects assessed'}
                    </p>
                  </div>

                  {/* The Two Mandatory Numbers: المجموع + المعدل */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* المجموع */}
                    <div className="bg-white p-3 sm:px-4 rounded-xl border border-slate-200 shadow-2xs text-center min-w-[110px]">
                      <span className="text-[10px] text-slate-500 font-bold block mb-0.5">
                        {language === 'ar' ? 'مجموع الدرجات:' : 'Total Score:'}
                      </span>
                      <div className="text-lg font-black text-slate-900 font-sans">
                        {currentEarned}{' '}
                        <span className="text-xs text-slate-400 font-normal">/ {currentPossible}</span>
                      </div>
                    </div>

                    {/* المعدل */}
                    <div className="bg-white p-3 sm:px-4 rounded-xl border border-slate-200 shadow-2xs text-center min-w-[110px]">
                      <span className="text-[10px] text-slate-500 font-bold block mb-0.5">
                        {language === 'ar' ? 'معدل الفصل:' : 'Semester GPA:'}
                      </span>
                      <div
                        className={`text-lg font-black font-sans ${
                          Number(currentAverage) >= 90 ? 'text-emerald-700' : 'text-blue-700'
                        }`}
                      >
                        %{currentAverage}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subject Accordions */}
                {Object.keys(currentGroups).length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      {language === 'ar'
                        ? 'لم يتم تسجيل درجات بعد لهذه الفترة الدراسية.'
                        : 'No grades recorded yet for this semester.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.values(currentGroups).map((group) => {
                      const isExpanded = !!expandedSubjects[group.subject];
                      const isMath = group.subject === 'الرياضيات' || group.subject === 'Mathematics';

                      return (
                        <div
                          key={group.subject}
                          className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                            isExpanded
                              ? isFirst
                                ? 'border-blue-400 shadow-md ring-1 ring-blue-500/20'
                                : 'border-purple-400 shadow-md ring-1 ring-purple-500/20'
                              : 'border-slate-200 shadow-xs hover:border-slate-300'
                          }`}
                        >
                          {/* Subject Header Row with the (+) / (-) Button */}
                          <div
                            onClick={() => toggleSubjectExpanded(group.subject)}
                            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition"
                          >
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSubjectExpanded(group.subject);
                                }}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black transition-all shadow-xs ${
                                  isExpanded
                                    ? isFirst
                                      ? 'bg-blue-600 text-white shadow-blue-500/20'
                                      : 'bg-purple-600 text-white shadow-purple-500/20'
                                    : isMath
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 ring-2 ring-blue-400'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                                title={isExpanded ? t('hideGrades') : t('viewAllGrades')}
                              >
                                {isExpanded ? (
                                  <Minus className="w-5 h-5 stroke-[3]" />
                                ) : (
                                  <Plus className="w-5 h-5 stroke-[3]" />
                                )}
                              </button>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-slate-900 text-base">
                                    {language === 'ar' ? group.subject : group.subjectEn || group.subject}
                                  </h4>
                                </div>
                                <span className="text-xs text-slate-500">
                                  {group.items.length}{' '}
                                  {language === 'ar' ? 'اختبارات وتقييمات مسجلة' : 'assessments recorded'}
                                </span>
                              </div>
                            </div>

                            {/* Overall Subject Score & Average */}
                            <div className="flex items-center gap-3">
                              <div className="text-left">
                                <div className="font-black text-slate-900 text-base">
                                  {group.totalScore}{' '}
                                  <span className="text-slate-400 text-xs font-normal">
                                    / {group.maxScore}
                                  </span>
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    group.avgPercentage >= 90
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  %{group.avgPercentage}
                                </span>
                              </div>

                              <div className="text-slate-400">
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* EXPANDED ACCORDION: ALL GRADES FOR THIS SUBJECT */}
                          {isExpanded && (
                            <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 bg-white space-y-3 animate-fadeIn">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-3 pb-1 border-b border-slate-100">
                                <span>{t('allSubjectAssessments')}</span>
                                <span>{group.items.length} {language === 'ar' ? 'عناصر' : 'items'}</span>
                              </div>

                              <div className="divide-y divide-slate-100">
                                {group.items.map((item) => {
                                  const pct = ((item.score / item.maxScore) * 100).toFixed(0);
                                  return (
                                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-slate-900 text-sm">
                                            {item.examType}
                                          </span>
                                          <span className="text-[11px] text-slate-400 font-mono">
                                            • {item.date}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-black text-slate-900 text-sm">
                                            {item.score}{' '}
                                            <span className="text-slate-400 text-xs">/ {item.maxScore}</span>
                                          </span>
                                          <span
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                              Number(pct) >= 90
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-blue-100 text-blue-800'
                                            }`}
                                          >
                                            %{pct}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Progress bar */}
                                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all ${
                                            isFirst ? 'bg-blue-600' : 'bg-purple-600'
                                          }`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>

                                      {item.feedback && (
                                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60 mt-1">
                                          <strong className="text-blue-700">
                                            {language === 'ar' ? 'ملاحظة المعلم:' : 'Teacher note:'}{' '}
                                          </strong>
                                          {language === 'ar' ? item.feedback : item.feedbackEn || item.feedback}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* VIEW 3: FINAL COMBINED VIEW (المجموع والمعدل النهائي للفصلين الأول والثاني) */}
          {selectedSemesterTab === 'final' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Golden Hero Card for Combined Year Total & Final Average */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/30 text-slate-950 mb-2 border border-white/40">
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>{language === 'ar' ? 'النتيجة التراكمية السنوية المعتمدة' : 'Official Annual Cumulative Transcript'}</span>
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                      {language === 'ar' ? 'المجموع والمعدل النهائي للفصلين' : 'Final Total Score & Overall GPA'}
                    </h3>
                    <p className="text-xs font-bold text-slate-900/80 mt-1">
                      {language === 'ar'
                        ? 'حصيلة أداء الطالب يوسف بن سالم في النصف الأول والنصف الثاني للعام الدراسي 2026'
                        : 'Combined academic summary across Semester 1 & Semester 2 for the academic year'}
                    </p>
                  </div>

                  {/* Two Giant Hero Metrics: المجموع النهائي + المعدل النهائي */}
                  <div className="flex items-center gap-3">
                    {/* المجموع النهائي */}
                    <div className="p-4 rounded-2xl bg-white/90 text-slate-950 shadow-md text-center min-w-[130px] border border-white">
                      <span className="text-xs font-bold text-slate-600 block mb-0.5">
                        {language === 'ar' ? 'المجموع النهائي للفصلين:' : 'Final Total Score:'}
                      </span>
                      <div className="text-2xl font-black font-sans text-slate-950">
                        {finalTotalEarned}{' '}
                        <span className="text-xs text-slate-500 font-normal">/ {finalTotalPossible}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-bold block mt-0.5">
                        {language === 'ar' ? 'مجموع الفصلين' : 'Both Terms'}
                      </span>
                    </div>

                    {/* المعدل النهائي */}
                    <div className="p-4 rounded-2xl bg-slate-950 text-white shadow-md text-center min-w-[130px] border border-slate-900">
                      <span className="text-xs font-bold text-amber-300 block mb-0.5">
                        {language === 'ar' ? 'المعدل النهائي السنوي:' : 'Final Overall GPA:'}
                      </span>
                      <div className="text-2xl font-black font-sans text-amber-400">
                        %{finalCombinedAverage}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-black block mt-0.5">
                        {Number(finalCombinedAverage) >= 90
                          ? (language === 'ar' ? 'ممتاز مرتفع (A+)' : 'High Distinction')
                          : (language === 'ar' ? 'جيد جداً' : 'Very Good')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Breakdown Cards: النصف الأول vs النصف الثاني vs النهائي */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* النصف الأول */}
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900 mb-2">
                    <span>{language === 'ar' ? 'النصف الأول (الفصل الأول):' : 'Semester 1:'}</span>
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{language === 'ar' ? 'مجموع الدرجات:' : 'Total Score:'}</span>
                      <strong className="font-mono text-slate-900 font-bold">{sem1Earned} / {sem1Possible}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{language === 'ar' ? 'المعدل:' : 'Average:'}</span>
                      <strong className="text-blue-700 font-black text-sm">%{sem1Average}</strong>
                    </div>
                  </div>
                </div>

                {/* النصف الثاني */}
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900 mb-2">
                    <span>{language === 'ar' ? 'النصف الثاني (الفصل الثاني):' : 'Semester 2:'}</span>
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{language === 'ar' ? 'مجموع الدرجات:' : 'Total Score:'}</span>
                      <strong className="font-mono text-slate-900 font-bold">{sem2Earned} / {sem2Possible}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{language === 'ar' ? 'المعدل:' : 'Average:'}</span>
                      <strong className="text-purple-700 font-black text-sm">%{sem2Average}</strong>
                    </div>
                  </div>
                </div>

                {/* المجموع والمعدل النهائي */}
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-950 mb-2">
                    <span>{language === 'ar' ? 'المجموع والمعدل النهائي:' : 'Final Cumulative:'}</span>
                    <Award className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">{language === 'ar' ? 'المجموع النهائي:' : 'Final Total:'}</span>
                      <strong className="font-mono text-amber-950 font-black">{finalTotalEarned} / {finalTotalPossible}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">{language === 'ar' ? 'المعدل النهائي:' : 'Final GPA:'}</span>
                      <strong className="text-amber-900 font-black text-base">%{finalCombinedAverage}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprehensive Comparative Table by Subject */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-sm">
                    {language === 'ar' ? 'جدول مقارنة درجات المواد للفصلين الأول والثاني' : 'Subject Comparative Marks Matrix'}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-bold">
                    {allUniqueSubjects.length} {language === 'ar' ? 'مواد دراسية' : 'subjects'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">{t('subject')}</th>
                        <th className="py-3 px-3 text-center bg-blue-50/50 text-blue-900">{language === 'ar' ? 'مجموع النصف الأول' : 'Sem 1 Total'}</th>
                        <th className="py-3 px-3 text-center bg-blue-50/50 text-blue-900">{language === 'ar' ? 'معدل النصف الأول' : 'Sem 1 %'}</th>
                        <th className="py-3 px-3 text-center bg-purple-50/50 text-purple-900">{language === 'ar' ? 'مجموع النصف الثاني' : 'Sem 2 Total'}</th>
                        <th className="py-3 px-3 text-center bg-purple-50/50 text-purple-900">{language === 'ar' ? 'معدل النصف الثاني' : 'Sem 2 %'}</th>
                        <th className="py-3 px-3 text-center bg-amber-50 text-amber-950 font-black">{language === 'ar' ? 'المجموع النهائي' : 'Final Score'}</th>
                        <th className="py-3 px-3 text-center bg-amber-50 text-amber-950 font-black">{language === 'ar' ? 'المعدل النهائي' : 'Final %'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allUniqueSubjects.map((subName) => {
                        const s1 = sem1Groups[subName];
                        const s2 = sem2Groups[subName];

                        const s1Earned = s1?.totalScore ?? 0;
                        const s1Max = s1?.maxScore ?? 0;
                        const s1Pct = s1Max > 0 ? ((s1Earned / s1Max) * 100).toFixed(1) : '—';

                        const s2Earned = s2?.totalScore ?? 0;
                        const s2Max = s2?.maxScore ?? 0;
                        const s2Pct = s2Max > 0 ? ((s2Earned / s2Max) * 100).toFixed(1) : '—';

                        const combinedEarned = s1Earned + s2Earned;
                        const combinedMax = s1Max + s2Max;
                        const combinedPct = combinedMax > 0 ? ((combinedEarned / combinedMax) * 100).toFixed(1) : '—';

                        return (
                          <tr key={subName} className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-4 font-bold text-slate-900 text-xs">
                              {subName}
                            </td>
                            {/* Semester 1 */}
                            <td className="py-3 px-3 text-center font-mono text-slate-700 bg-blue-50/20">
                              {s1 ? `${s1Earned} / ${s1Max}` : '—'}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-blue-800 bg-blue-50/20">
                              {s1Pct !== '—' ? `%${s1Pct}` : '—'}
                            </td>
                            {/* Semester 2 */}
                            <td className="py-3 px-3 text-center font-mono text-slate-700 bg-purple-50/20">
                              {s2 ? `${s2Earned} / ${s2Max}` : '—'}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-purple-800 bg-purple-50/20">
                              {s2Pct !== '—' ? `%${s2Pct}` : '—'}
                            </td>
                            {/* Final Total & Average */}
                            <td className="py-3 px-3 text-center font-mono font-black text-slate-950 bg-amber-50/40">
                              {combinedEarned} / {combinedMax}
                            </td>
                            <td className="py-3 px-3 text-center bg-amber-50/40">
                              <span
                                className={`px-2 py-0.5 rounded-md font-black text-xs ${
                                  Number(combinedPct) >= 90
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {combinedPct !== '—' ? `%${combinedPct}` : '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* HOMEWORK SECTION WITH FILE AND PHOTO ATTACHMENTS (1 column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-black text-slate-900 text-base">{t('homeworkTab')}</h3>
                <span className="text-[11px] font-bold text-blue-700 block">
                  {language === 'ar' ? `المخصصة لصفك: ${student.className}` : `Assigned to: ${student.className}`}
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-blue-800 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
              {myClassHomework.length} {language === 'ar' ? 'واجبات' : 'items'}
            </span>
          </div>

          {myClassHomework.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{t('noHomeworkForClass')}</h4>
              <p className="text-xs text-slate-400">
                {language === 'ar'
                  ? `لا توجد تكليفات جديدة مسندة إلى (${student.className}) في الوقت الحالي.`
                  : `No new homework assignments currently due for (${student.className}).`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myClassHomework.map((hw) => {
              const mySubmission = hw.submissions.find((s) => s.studentId === student.id);
              const isSubmitted = !!mySubmission;

              return (
                <div
                  key={hw.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {hw.subject}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t('dueDate')}: {hw.dueDate}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{hw.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{hw.description}</p>
                  </div>

                  {/* Teacher's Attached Worksheet / Diagram */}
                  {hw.attachments && hw.attachments.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 block">
                        {t('attachedReferenceFile')}:
                      </span>
                      {hw.attachments.map((att) => (
                        <div
                          key={att.id}
                          onClick={() => setPreviewImageModal(att.url)}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-blue-400 transition"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="text-[11px] font-semibold text-blue-700 truncate">
                              {att.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">{att.size}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Submission Status or Interactive Submission Form */}
                  {isSubmitted ? (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold text-emerald-900">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {t('alreadySubmitted')}
                        </span>
                        {mySubmission.status === 'graded' ? (
                          <span className="text-emerald-800 font-black">
                            {mySubmission.score} / {mySubmission.maxScore}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold text-[11px]">
                            {t('pendingGrading')}
                          </span>
                        )}
                      </div>

                      {mySubmission.content && (
                        <p className="text-slate-700 bg-white/70 p-2 rounded-lg text-[11px]">
                          {mySubmission.content}
                        </p>
                      )}

                      {/* Display Submitted Files/Photos */}
                      {mySubmission.attachments && mySubmission.attachments.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-emerald-800 block">
                            {language === 'ar' ? 'الصور والمستندات المسلّمة:' : 'Submitted files & photos:'}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {mySubmission.attachments.map((att) => (
                              <div
                                key={att.id}
                                onClick={() => setPreviewImageModal(att.url)}
                                className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-white border border-emerald-300 text-[10px] font-bold text-emerald-900 cursor-pointer hover:shadow-xs"
                              >
                                <ImageIcon className="w-3 h-3 text-emerald-600" />
                                <span className="truncate max-w-[140px]">{att.name}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {mySubmission.teacherNotes && (
                        <p className="text-slate-600 text-[11px] italic bg-emerald-100/50 p-2 rounded-lg">
                          "{mySubmission.teacherNotes}"
                        </p>
                      )}
                    </div>
                  ) : submittingHwId === hw.id ? (
                    // Interactive Solver Form with Photo & File Upload
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                      <textarea
                        rows={3}
                        value={submissionContent}
                        onChange={(e) => setSubmissionContent(e.target.value)}
                        placeholder={t('solutionContent')}
                        className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      {/* File / Photo Upload Controls */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Real File Input */}
                          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg text-xs font-bold text-slate-700 cursor-pointer transition">
                            <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                            <span>{t('attachFile')}</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*,.pdf,.doc,.docx"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>

                          {/* Quick Preset: Add Sample Notebook Photo button for instant demo */}
                          <button
                            type="button"
                            onClick={handleAddSampleNotebookPhoto}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 rounded-lg text-[11px] font-bold transition"
                            title="إرفاق صورة تجريبية للحل"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                            <span>{language === 'ar' ? '+ صورة تجريبية للدفتر' : '+ Sample Notebook Photo'}</span>
                          </button>
                        </div>

                        {/* List of Attached Files/Images with Preview Thumbnail */}
                        {attachedFiles.length > 0 && (
                          <div className="space-y-1.5 p-2 bg-white rounded-lg border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-500 block">
                              {language === 'ar' ? 'الملفات المرفقة للحل:' : 'Attached solution files:'}
                            </span>
                            {attachedFiles.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {file.type === 'image' && file.url ? (
                                    <img
                                      src={file.url}
                                      alt={file.name}
                                      className="w-7 h-7 rounded object-cover border border-slate-300"
                                    />
                                  ) : (
                                    <FileText className="w-4 h-4 text-blue-600" />
                                  )}
                                  <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[150px]">
                                    {file.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400">({file.size})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAttachment(file.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSubmitSolution(hw.id)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{t('submitSolution')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSubmittingHwId(null);
                            setAttachedFiles([]);
                          }}
                          className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSubmittingHwId(hw.id)}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t('submitSolution')}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* ATTENDANCE CALENDAR SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-slate-900 text-base">{t('attendanceRecord')}</h3>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {t('attendanceRate')}: 97.5%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {myAttendance.map((rec) => (
            <div
              key={rec.id}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                rec.status === 'present'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : rec.status === 'absent'
                  ? 'bg-rose-50/60 border-rose-200'
                  : rec.status === 'late'
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-blue-50/60 border-blue-200'
              }`}
            >
              <div>
                <span className="font-bold text-slate-900 block">{rec.date}</span>
                <span className="text-[10px] text-slate-500">
                  {rec.notes || (language === 'ar' ? 'حضور نظامي' : 'Regular Attendance')}
                </span>
              </div>
              <span
                className={`font-black px-2 py-0.5 rounded text-[10px] ${
                  rec.status === 'present'
                    ? 'bg-emerald-200 text-emerald-900'
                    : rec.status === 'absent'
                    ? 'bg-rose-200 text-rose-900'
                    : rec.status === 'late'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-blue-200 text-blue-900'
                }`}
              >
                {t(rec.status as any)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Image Preview Lightbox Modal */}
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
