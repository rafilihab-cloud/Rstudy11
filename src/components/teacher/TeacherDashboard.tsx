import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceStatus, GradeItem, Homework, FileAttachment } from '../../types';
import {
  CalendarCheck,
  Award,
  BookOpenCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  UserX,
  AlertTriangle,
  Check,
  Trash2,
  Eye,
  Paperclip,
  Image as ImageIcon,
  ExternalLink,
  X,
  Users,
  Bell,
} from 'lucide-react';
import { ScheduleView } from '../shared/ScheduleView';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    grades,
    addGrade,
    deleteGrade,
    homeworkList,
    addHomework,
    gradeHomeworkSubmission,
    addAnnouncement,
    attendance,
    batchRecordAttendance,
    timetable,
    language,
    t,
  } = useSchool();

  const [activeSection, setActiveSection] = useState<'attendance' | 'grades' | 'homework' | 'schedule'>(
    'attendance'
  );

  // Available classes across the system
  const allClasses = Array.from(
    new Set([
      'الصف الثالث المتوسط - أ',
      'الصف الثالث المتوسط - ب',
      'الصف الأول المتوسط - ب',
      'الصف الأول المتوسط - أ',
      'الصف الثاني المتوسط - أ',
      'الصف الأول الثانوي - علمي',
      ...students.map((s) => s.className).filter(Boolean),
    ])
  );

  // Selected class for attendance/grades
  const [selectedClass, setSelectedClass] = useState<string>('الصف الثالث المتوسط - أ');

  // Filtered students for class
  const classStudents = students.filter((s) => s.className === selectedClass);

  // --- Attendance State ---
  const todayStr = '2026-10-28';
  const [attendanceDate, setAttendanceDate] = useState<string>(todayStr);

  const [localAttendance, setLocalAttendance] = useState<
    Record<string, { status: AttendanceStatus; notes: string }>
  >(() => {
    const map: Record<string, { status: AttendanceStatus; notes: string }> = {};
    classStudents.forEach((std) => {
      const existing = attendance.find((a) => a.studentId === std.id && a.date === todayStr);
      map[std.id] = {
        status: existing ? existing.status : 'present',
        notes: existing?.notes || '',
      };
    });
    return map;
  });

  const [attendanceSavedToast, setAttendanceSavedToast] = useState(false);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setLocalAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setLocalAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    classStudents.forEach((std) => {
      updated[std.id] = {
        status: 'present',
        notes: '',
      };
    });
    setLocalAttendance(updated);
  };

  const handleSaveAttendance = () => {
    const records = classStudents.map((std) => ({
      date: attendanceDate,
      studentId: std.id,
      studentName: std.name,
      className: selectedClass,
      status: localAttendance[std.id]?.status || 'present',
      notes: localAttendance[std.id]?.notes || '',
      recordedBy: currentUser.name,
    }));

    batchRecordAttendance(records);
    setAttendanceSavedToast(true);
    setTimeout(() => setAttendanceSavedToast(false), 3500);
  };

  // --- Grades Publishing State ---
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradeStudentId, setGradeStudentId] = useState(classStudents[0]?.id || 'std_1');
  const [gradeSubject, setGradeSubject] = useState('الرياضيات');
  const [gradeExamType, setGradeExamType] = useState<GradeItem['examType']>('اختبار نصفي');
  const [gradeScore, setGradeScore] = useState<number>(18);
  const [gradeMaxScore, setGradeMaxScore] = useState<number>(20);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradeSearch, setGradeSearch] = useState('');

  const handlePublishGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === gradeStudentId);
    if (!student) return;

    addGrade({
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      subject: gradeSubject,
      examType: gradeExamType,
      score: Number(gradeScore),
      maxScore: Number(gradeMaxScore),
      term: 'الفصل الأول',
      date: new Date().toISOString().split('T')[0],
      feedback: gradeFeedback,
      gradedBy: currentUser.name,
    });

    setIsGradeModalOpen(false);
    setGradeFeedback('');
  };

  // --- Homework Management State with File/Photo Attachments ---
  const [isNewHwModalOpen, setIsNewHwModalOpen] = useState(false);
  const [hwTitle, setHwTitle] = useState('');
  const [hwDescription, setHwDescription] = useState('');
  const [hwSubject, setHwSubject] = useState('الرياضيات');
  const [hwTargetClass, setHwTargetClass] = useState<string>('الصف الثالث المتوسط - أ');
  const [hwDueDate, setHwDueDate] = useState('2026-11-04');
  const [hwMaxScore, setHwMaxScore] = useState(10);
  const [hwAttachments, setHwAttachments] = useState<FileAttachment[]>([]);
  const [hwFilterClass, setHwFilterClass] = useState<string>('all');
  const [hwBroadcastSuccessToast, setHwBroadcastSuccessToast] = useState<string | null>(null);

  const [selectedHwForSubmissions, setSelectedHwForSubmissions] = useState<Homework | null>(null);
  const [submissionsModalTab, setSubmissionsModalTab] = useState<'submitted' | 'unsubmitted'>('submitted');
  const [remindedStudentIds, setRemindedStudentIds] = useState<string[]>([]);
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(10);
  const [gradingTeacherNotes, setGradingTeacherNotes] = useState('');
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  // File upload for new homework
  const handleTeacherFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const isImg = file.type.startsWith('image/');
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newAttachment: FileAttachment = {
          id: `att_hw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          url,
          type: isImg ? 'image' : 'file',
          size: `${(file.size / 1024).toFixed(0)} KB`,
        };
        setHwAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddSampleWorksheet = () => {
    setHwAttachments((prev) => [
      ...prev,
      {
        id: `att_sample_${Date.now()}`,
        name: language === 'ar' ? 'ورقة_عمل_المعادلات_والتمارين.png' : 'worksheet_equations.png',
        url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
        type: 'image',
        size: '1.2 MB',
      },
    ]);
  };

  const handleSendReminder = (studentId: string) => {
    setRemindedStudentIds((prev) => [...new Set([...prev, studentId])]);
  };

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim()) return;

    const assignedClass = hwTargetClass || selectedClass;
    const recipients = students.filter((s) => s.className === assignedClass);

    addHomework({
      title: hwTitle,
      description: hwDescription,
      subject: hwSubject,
      className: assignedClass,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: hwDueDate,
      maxScore: Number(hwMaxScore),
      attachments: hwAttachments,
    });

    // Notify all students in this class and their parents
    addAnnouncement({
      title: `واجب منزلي جديد: ${hwTitle}`,
      titleEn: `New Homework: ${hwTitle}`,
      content: `قام الأستاذ (${currentUser.name}) بتكليف طلاب (${assignedClass}) بواجب جديد في مادة ${hwSubject}. عدد الطلاب المكلفين: ${recipients.length}، وموعد التسليم النهائي: ${hwDueDate}.`,
      contentEn: `Teacher (${currentUser.name}) assigned a new homework to (${assignedClass}) in ${hwSubject}. Due date: ${hwDueDate}.`,
      category: 'إعلان عام',
      priority: 'normal',
      author: currentUser.name,
      targetRole: 'all',
    });

    setHwBroadcastSuccessToast(
      language === 'ar'
        ? `تم إرسال الواجب بنجاح إلى جميع طلاب (${assignedClass}) وعددهم ${recipients.length} طالباً!`
        : `Homework sent successfully to all ${recipients.length} students in (${assignedClass})!`
    );
    setTimeout(() => setHwBroadcastSuccessToast(null), 5000);

    setIsNewHwModalOpen(false);
    setHwTitle('');
    setHwDescription('');
    setHwAttachments([]);
  };

  const handleGradeSubmission = (hwId: string, subId: string) => {
    gradeHomeworkSubmission(hwId, subId, Number(gradingScore), gradingTeacherNotes);
    setGradingSubmissionId(null);
    setGradingTeacherNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                {t('teacherWelcome')}
              </span>
              <span className="text-xs text-emerald-300">{t('appName')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {language === 'ar' ? currentUser.name : currentUser.nameEn || currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
              {language === 'ar' ? currentUser.title : currentUser.titleEn || currentUser.title}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-xs text-center">
            <div className="px-3 py-1 border-l border-white/20">
              <span className="text-lg font-black block">{classStudents.length}</span>
              <span className="text-[10px] text-emerald-200">{t('class')}</span>
            </div>
            <div className="px-3 py-1 border-l border-white/20">
              <span className="text-lg font-black block">{homeworkList.length}</span>
              <span className="text-[10px] text-emerald-200">{t('homeworkTab')}</span>
            </div>
            <div className="px-3 py-1">
              <span className="text-lg font-black block">{grades.length}</span>
              <span className="text-[10px] text-emerald-200">{t('publishGradesTab')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick glance ribbon for today's teaching classes (ما سأعطيه اليوم) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm">
                {language === 'ar'
                  ? 'الحصص التي ستقدمها اليوم (الأربعاء):'
                  : 'Classes You Are Teaching Today (Wednesday):'}
              </h3>
              <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                {
                  timetable.filter(
                    (t) =>
                      t.day === 'الأربعاء' &&
                      (t.teacherName.includes(currentUser.name || '') ||
                        (currentUser.name || '').includes(t.teacherName) ||
                        (t.subject.includes('الرياضيات') && (currentUser.name || '').includes('فاطمة')))
                  ).length
                }{' '}
                {language === 'ar' ? 'حصص تدريسية' : 'classes'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 flex flex-wrap gap-2">
              {timetable
                .filter(
                  (t) =>
                    t.day === 'الأربعاء' &&
                    (t.teacherName.includes(currentUser.name || '') ||
                      (currentUser.name || '').includes(t.teacherName) ||
                      (t.subject.includes('الرياضيات') && (currentUser.name || '').includes('فاطمة')))
                )
                .sort((a, b) => a.period - b.period)
                .map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-emerald-300 text-[11px] font-bold text-emerald-900 shadow-xs"
                  >
                    <span className="font-mono text-emerald-700">#{c.period}</span>
                    <span>{c.subject}</span>
                    <span className="text-slate-400 font-normal">({c.className})</span>
                  </span>
                ))}
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveSection('schedule')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 active:scale-95 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'عرض جدول الحصص بالكامل' : 'View Full Schedule'}</span>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSection('schedule')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeSection === 'schedule'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>{language === 'ar' ? 'حصصي اليوم (ما سأعطيه)' : 'Classes I Teach Today'}</span>
        </button>

        <button
          onClick={() => setActiveSection('attendance')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeSection === 'attendance'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{t('recordAttendanceTab')}</span>
        </button>

        <button
          onClick={() => setActiveSection('grades')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeSection === 'grades'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{t('publishGradesTab')}</span>
        </button>

        <button
          onClick={() => setActiveSection('homework')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
            activeSection === 'homework'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpenCheck className="w-4 h-4" />
          <span>{t('homeworkTab')}</span>
        </button>
      </div>

      {/* SECTION: TODAY'S TEACHING SCHEDULE */}
      {activeSection === 'schedule' && (
        <div className="animate-fadeIn">
          <ScheduleView />
        </div>
      )}

      {/* SECTION 1: ATTENDANCE RECORDING */}
      {activeSection === 'attendance' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  {t('class')}:
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="الصف الثالث المتوسط - أ">الصف الثالث المتوسط - أ</option>
                  <option value="الصف الثالث المتوسط - ب">الصف الثالث المتوسط - ب</option>
                  <option value="الصف الأول المتوسط - ب">الصف الأول المتوسط - ب</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('date')}:</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                {t('markAllPresent')}
              </button>

              <button
                onClick={handleSaveAttendance}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition shadow-emerald-500/20 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t('saveAttendance')}</span>
              </button>
            </div>
          </div>

          {attendanceSavedToast && (
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('attendanceSavedSuccess')}</span>
            </div>
          )}

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{t('studentRole')}</th>
                    <th className="py-3 px-4 text-center">{t('status')}</th>
                    <th className="py-3 px-4">{t('notes')}</th>
                    <th className="py-3 px-4 text-center">{t('totalAbsences')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((std) => {
                    const currentStatus = localAttendance[std.id]?.status || 'present';
                    const currentNotes = localAttendance[std.id]?.notes || '';

                    return (
                      <tr key={std.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={std.avatar}
                              alt={std.name}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">
                                {language === 'ar' ? std.name : std.nameEn || std.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {std.parentPhone}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Present */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(std.id, 'present')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t('present')}</span>
                            </button>

                            {/* Absent */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(std.id, 'absent')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                currentStatus === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                              }`}
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>{t('absent')}</span>
                            </button>

                            {/* Late */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(std.id, 'late')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                currentStatus === 'late'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{t('late')}</span>
                            </button>

                            {/* Excused */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(std.id, 'excused')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                currentStatus === 'excused'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{t('excused')}</span>
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={currentNotes}
                            onChange={(e) => handleNotesChange(std.id, e.target.value)}
                            placeholder={t('notes')}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white"
                          />
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                              std.totalAbsences > 3
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {std.totalAbsences} {language === 'ar' ? 'أيام' : 'days'}
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

      {/* SECTION 2: GRADES PUBLISHING */}
      {activeSection === 'grades' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Header & New Grade Button */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gradeSearch}
                onChange={(e) => setGradeSearch(e.target.value)}
                placeholder={t('search')}
                className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => setIsGradeModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{t('publishNewGrade')}</span>
            </button>
          </div>

          {/* Grades List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{t('studentRole')}</th>
                    <th className="py-3 px-4">{t('class')}</th>
                    <th className="py-3 px-4">{t('subject')}</th>
                    <th className="py-3 px-4">{t('examType')}</th>
                    <th className="py-3 px-4 text-center">{t('score')}</th>
                    <th className="py-3 px-4 text-center">{t('percentage')}</th>
                    <th className="py-3 px-4">{t('feedback')}</th>
                    <th className="py-3 px-4 text-center">{t('delete')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades
                    .filter(
                      (g) =>
                        g.studentName.includes(gradeSearch) ||
                        g.subject.includes(gradeSearch) ||
                        g.examType.includes(gradeSearch as any)
                    )
                    .map((item) => {
                      const pct = ((item.score / item.maxScore) * 100).toFixed(0);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">{item.studentName}</td>
                          <td className="py-3 px-4 text-slate-500">{item.className}</td>
                          <td className="py-3 px-4 font-semibold text-emerald-800">
                            {language === 'ar' ? item.subject : item.subjectEn || item.subject}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{item.examType}</td>
                          <td className="py-3 px-4 text-center font-black text-slate-900 text-sm">
                            {item.score} <span className="text-slate-400 text-xs">/ {item.maxScore}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                Number(pct) >= 90
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : Number(pct) >= 75
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              %{pct}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">
                            {language === 'ar' ? item.feedback : item.feedbackEn || item.feedback || '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => deleteGrade(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                              title={t('delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* SECTION 3: HOMEWORK & SUBMISSIONS WITH CLASS-BASED ASSIGNMENT */}
      {activeSection === 'homework' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Broadcast Success Toast */}
          {hwBroadcastSuccessToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{hwBroadcastSuccessToast}</span>
              </div>
              <button
                onClick={() => setHwBroadcastSuccessToast(null)}
                className="text-emerald-700 hover:text-emerald-950 font-black px-2 py-0.5 rounded-lg"
              >
                ✕
              </button>
            </div>
          )}

          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-emerald-600" />
                <span>{t('homeworkTab')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'إرسال الواجبات المخصصة حسب الصف الدراسي، وتتبع تسليمات الطلاب والتصحيح الفوري'
                  : 'Assign class-targeted homework with attachments and track submissions per class'}
              </p>
            </div>
            <button
              onClick={() => {
                setHwTargetClass(selectedClass);
                setIsNewHwModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition shadow-emerald-500/20 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{t('createNewHomework')}</span>
            </button>
          </div>

          {/* Class Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setHwFilterClass('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                hwFilterClass === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t('allClasses')} ({homeworkList.length})
            </button>
            {allClasses.map((cls) => {
              const count = homeworkList.filter((h) => h.className === cls).length;
              const studentCount = students.filter((s) => s.className === cls).length;
              return (
                <button
                  key={cls}
                  onClick={() => setHwFilterClass(cls)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                    hwFilterClass === cls
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{cls}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      hwFilterClass === cls
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count} واجب • {studentCount} طلاب
                  </span>
                </button>
              );
            })}
          </div>

          {/* Homework Cards Grid */}
          {(() => {
            const filteredHomework =
              hwFilterClass === 'all'
                ? homeworkList
                : homeworkList.filter((h) => h.className === hwFilterClass);

            if (filteredHomework.length === 0) {
              return (
                <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <BookOpenCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{t('noHomeworkForClass')}</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {language === 'ar'
                      ? 'لم يتم إرسال أي واجبات منزلية لهذا الصف بعد. اضغط على "إرسال واجب منزلي جديد" لتكليف الطلاب.'
                      : 'No homework has been assigned for this class yet. Click "Assign New Homework" to create one.'}
                  </p>
                  <button
                    onClick={() => {
                      if (hwFilterClass !== 'all') {
                        setHwTargetClass(hwFilterClass);
                      }
                      setIsNewHwModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('createNewHomework')}</span>
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHomework.map((hw) => {
                  const pendingCount = hw.submissions.filter((s) => s.status === 'pending').length;
                  const targetClassName = hw.className || selectedClass;
                  const enrolledStudents = students.filter((s) => s.className === targetClassName);
                  const enrolledCount = enrolledStudents.length;
                  const submittedCount = hw.submissions.length;
                  const percentage =
                    enrolledCount > 0 ? Math.round((submittedCount / enrolledCount) * 100) : 0;

                  return (
                    <div
                      key={hw.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-500/50 transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Subject & Due Date */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {hw.subject}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t('dueDate')}: {hw.dueDate}
                          </span>
                        </div>

                        {/* Target Class Badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            <span>{targetClassName}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            ({enrolledCount} {language === 'ar' ? 'طلاب مستلمين' : 'enrolled'})
                          </span>
                        </div>

                        <h4 className="font-black text-slate-900 text-base mb-1">{hw.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">{hw.description}</p>

                        {/* Submission Rate Bar for this Class */}
                        <div className="mb-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                            <span className="flex items-center gap-1">
                              <BookOpenCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t('submissionRate')}:</span>
                            </span>
                            <span className="text-emerald-700 font-black">
                              {submittedCount} / {enrolledCount} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            />
                          </div>
                        </div>

                        {/* Attached files by teacher */}
                        {hw.attachments && hw.attachments.length > 0 && (
                          <div className="mb-3 p-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                            <span className="text-[10px] font-bold text-slate-500 block mb-1">
                              {t('attachedReferenceFile')}:
                            </span>
                            {hw.attachments.map((att) => (
                              <div
                                key={att.id}
                                onClick={() => setPreviewImageModal(att.url)}
                                className="flex items-center justify-between p-1 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-blue-400"
                              >
                                <span className="text-[11px] font-semibold text-blue-700 truncate">
                                  📎 {att.name}
                                </span>
                                <span className="text-[10px] text-slate-400">{att.size}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-500">
                          {t('submissions')}: <span className="font-bold text-slate-900">{hw.submissions.length}</span>
                          {pendingCount > 0 && (
                            <span className="text-amber-600 font-bold mr-2">
                              ({pendingCount} {t('pendingGrading')})
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setSelectedHwForSubmissions(hw);
                            setSubmissionsModalTab('submitted');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('reviewSubmissions')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* MODAL: Publish New Grade */}
      {isGradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="font-black text-slate-900 text-lg mb-1">{t('publishNewGrade')}</h3>
            <p className="text-xs text-slate-500 mb-4">
              {language === 'ar'
                ? 'سيتم نشر هذه الدرجة فوراً في حساب الطالب وحساب ولي أمره'
                : 'This score will immediately appear in the student & parent portals'}
            </p>

            <form onSubmit={handlePublishGrade} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('studentRole')}:
                </label>
                <select
                  value={gradeStudentId}
                  onChange={(e) => setGradeStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('subject')}:</label>
                  <select
                    value={gradeSubject}
                    onChange={(e) => setGradeSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                  >
                    <option value="الرياضيات">{t('math')}</option>
                    <option value="العلوم الطبيعية">{t('science')}</option>
                    <option value="اللغة الإنجليزية">{t('english')}</option>
                    <option value="اللغة العربية">{t('arabic')}</option>
                    <option value="الحاسب والذكاء الاصطناعي">{t('computerScience')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('examType')}:</label>
                  <select
                    value={gradeExamType}
                    onChange={(e) => setGradeExamType(e.target.value as GradeItem['examType'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                  >
                    <option value="اختبار نصفي">{t('midtermExam')}</option>
                    <option value="اختبار نهائي">{t('finalExam')}</option>
                    <option value="اختبار قصير">{t('quiz')}</option>
                    <option value="واجب وتقييم مستمر">{t('continuousEvaluation')}</option>
                    <option value="مشروع عملي">{t('project')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('score')}:</label>
                  <input
                    type="number"
                    min="0"
                    max={gradeMaxScore}
                    step="0.5"
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('maxScore')}:</label>
                  <input
                    type="number"
                    min="1"
                    value={gradeMaxScore}
                    onChange={(e) => setGradeMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('feedback')}:</label>
                <textarea
                  rows={2}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="ملاحظات المعلم وتوجيهه..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                >
                  {t('publishNewGrade')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsGradeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create New Homework with Target Class Assignment & Broadcast */}
      {isNewHwModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-slate-900 text-lg mb-1">{t('createNewHomework')}</h3>
            <p className="text-xs text-slate-500 mb-4">
              {language === 'ar'
                ? 'تكليف الطلاب بواجب جديد مخصص لصف دراسي محدد مع إمكانية إرفاق أوراق عمل وصور توضيحية'
                : 'Assign class-specific homework with worksheet attachments or diagrams'}
            </p>

            <form onSubmit={handleCreateHomework} className="space-y-3.5">
              {/* TARGET CLASS SELECTION */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    {t('targetClass')} *:
                  </label>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    {students.filter((s) => s.className === hwTargetClass).length}{' '}
                    {language === 'ar' ? 'طلاب سيستلمون هذا الواجب' : 'recipients'}
                  </span>
                </div>
                <select
                  value={hwTargetClass}
                  onChange={(e) => setHwTargetClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold bg-emerald-50/50 text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {allClasses.map((cls) => {
                    const count = students.filter((s) => s.className === cls).length;
                    return (
                      <option key={cls} value={cls}>
                        {cls} — ({count} {language === 'ar' ? 'طلاب مقيدين' : 'students'})
                      </option>
                    );
                  })}
                </select>

                {/* Recipient Students Preview */}
                <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      {t('enrolledStudentsInClass')}:
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {language === 'ar' ? 'إرسال جماعي فوري' : 'Direct Broadcast'}
                    </span>
                  </div>
                  {students.filter((s) => s.className === hwTargetClass).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-0.5">
                      {students
                        .filter((s) => s.className === hwTargetClass)
                        .map((std) => (
                          <span
                            key={std.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-800 shadow-2xs"
                          >
                            <img
                              src={std.avatar}
                              alt=""
                              className="w-3.5 h-3.5 rounded-full object-cover"
                            />
                            <span>{std.name}</span>
                          </span>
                        ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-amber-700 font-bold">
                      ⚠️ {language === 'ar' ? 'لا يوجد طلاب مسجلين في هذا الصف حالياً' : 'No students in this class yet'}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 pt-0.5 leading-tight">
                    💡 {t('targetClassHint')}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('homeworkTitle')}:
                </label>
                <input
                  type="text"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  placeholder="مثال: حل تمارين الدوال والرسوم البيانية"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('homeworkDesc')}:
                </label>
                <textarea
                  rows={3}
                  value={hwDescription}
                  onChange={(e) => setHwDescription(e.target.value)}
                  placeholder="اكتب التوجيهات والصفحات المطلوبة..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  required
                />
              </div>

              {/* ATTACH FILES / PHOTOS BY TEACHER */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  {t('attachments')}:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-lg text-xs font-bold text-slate-700 cursor-pointer transition">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('attachFile')}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleTeacherFileChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleAddSampleWorksheet}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'ar' ? '+ إرفاق ورقة عمل تجريبية' : '+ Sample Worksheet'}</span>
                  </button>
                </div>

                {hwAttachments.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {hwAttachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200 text-xs"
                      >
                        <span className="font-semibold text-slate-800 truncate text-[11px]">
                          📎 {file.name} ({file.size})
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setHwAttachments((prev) => prev.filter((a) => a.id !== file.id))
                          }
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('subject')}:</label>
                  <select
                    value={hwSubject}
                    onChange={(e) => setHwSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                  >
                    <option value="الرياضيات">{t('math')}</option>
                    <option value="العلوم الطبيعية">{t('science')}</option>
                    <option value="اللغة الإنجليزية">{t('english')}</option>
                    <option value="اللغة العربية">{t('arabic')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('dueDate')}:</label>
                  <input
                    type="date"
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('maxScore')}:</label>
                  <input
                    type="number"
                    min="1"
                    value={hwMaxScore}
                    onChange={(e) => setHwMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>
                    {language === 'ar'
                      ? `إرسال الواجب لجميع طلاب (${hwTargetClass})`
                      : `Broadcast to All Students in (${hwTargetClass})`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewHwModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Review & Grade Student Submissions with Class Breakdown */}
      {selectedHwForSubmissions && (() => {
        const targetClassName = selectedHwForSubmissions.className || selectedClass;
        const enrolledClassStudents = students.filter((s) => s.className === targetClassName);
        const submittedMap = new Map(
          selectedHwForSubmissions.submissions.map((sub) => [sub.studentId, sub])
        );
        const missingClassStudents = enrolledClassStudents.filter((s) => !submittedMap.has(s.id));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-blue-50 text-blue-900 border border-blue-200">
                      {targetClassName}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {selectedHwForSubmissions.subject}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base">
                    {selectedHwForSubmissions.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('submissionRate')}:{' '}
                    <span className="font-bold text-emerald-700">
                      {selectedHwForSubmissions.submissions.length} / {enrolledClassStudents.length} طلاب
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedHwForSubmissions(null)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  {t('close')}
                </button>
              </div>

              {/* Submissions vs Missing Students Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                <button
                  onClick={() => setSubmissionsModalTab('submitted')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    submissionsModalTab === 'submitted'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ar' ? 'الطلاب الذين سلّموا الواجب' : 'Submitted Students'} (
                    {selectedHwForSubmissions.submissions.length})
                  </span>
                </button>

                <button
                  onClick={() => setSubmissionsModalTab('unsubmitted')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    submissionsModalTab === 'unsubmitted'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {t('notSubmittedYet')} ({missingClassStudents.length})
                  </span>
                </button>
              </div>

              {/* Tab 1: Submitted List */}
              {submissionsModalTab === 'submitted' && (
                <div>
                  {selectedHwForSubmissions.submissions.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-xl space-y-1">
                      <Clock className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-bold text-slate-600">{t('noSubmissionsYet')}</p>
                      <p className="text-[11px] text-slate-400">
                        {language === 'ar'
                          ? `لم يقم أي طالب من طلاب صف (${targetClassName}) بتسليم الحل بعد.`
                          : `No students from (${targetClassName}) have submitted yet.`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedHwForSubmissions.submissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{sub.studentName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {sub.submittedAt}
                            </span>
                          </div>

                          {/* Student text answer */}
                          {sub.content && (
                            <div className="p-3 rounded-lg bg-white border border-slate-200/80 text-slate-700 leading-relaxed">
                              {sub.content}
                            </div>
                          )}

                          {/* Solution Attachments */}
                          {sub.attachments && sub.attachments.length > 0 && (
                            <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2">
                              <span className="text-[10px] font-bold text-blue-900 block">
                                {language === 'ar'
                                  ? 'الصور والملفات المرفقة من الطالب:'
                                  : 'Student attached solution images & files:'}
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {sub.attachments.map((att) => (
                                  <div
                                    key={att.id}
                                    onClick={() => setPreviewImageModal(att.url)}
                                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-200 cursor-pointer hover:border-blue-400 hover:shadow-xs transition"
                                  >
                                    {att.type === 'image' && att.url ? (
                                      <img
                                        src={att.url}
                                        alt={att.name}
                                        className="w-10 h-10 rounded-md object-cover border border-slate-200 shrink-0"
                                      />
                                    ) : (
                                      <Paperclip className="w-5 h-5 text-blue-600 shrink-0" />
                                    )}
                                    <div className="truncate flex-1">
                                      <span className="font-bold text-blue-900 text-xs truncate block">
                                        {att.name}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {att.size} • انقر للمعاينة
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Grading row */}
                          {sub.status === 'graded' ? (
                            <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-200">
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                {t('gradedSuccess')}: {sub.score} / {sub.maxScore}
                              </span>
                              <span className="text-slate-500 italic">"{sub.teacherNotes}"</span>
                            </div>
                          ) : gradingSubmissionId === sub.id ? (
                            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2 mt-2">
                              <div className="flex items-center gap-2">
                                <label className="font-bold text-slate-700">{t('score')}:</label>
                                <input
                                  type="number"
                                  max={sub.maxScore}
                                  min="0"
                                  value={gradingScore}
                                  onChange={(e) => setGradingScore(Number(e.target.value))}
                                  className="w-20 px-2 py-1 rounded border border-slate-300 font-bold"
                                />
                                <span className="text-slate-400">/ {sub.maxScore}</span>
                              </div>
                              <input
                                type="text"
                                value={gradingTeacherNotes}
                                onChange={(e) => setGradingTeacherNotes(e.target.value)}
                                placeholder={t('feedback')}
                                className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleGradeSubmission(selectedHwForSubmissions.id, sub.id)
                                  }
                                  className="px-3 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700"
                                >
                                  {t('save')}
                                </button>
                                <button
                                  onClick={() => setGradingSubmissionId(null)}
                                  className="px-3 py-1 bg-slate-200 text-slate-700 rounded font-bold"
                                >
                                  {t('cancel')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setGradingSubmissionId(sub.id);
                                setGradingScore(sub.maxScore);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                            >
                              {t('gradeSubmission')}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Missing / Not Submitted Yet List */}
              {submissionsModalTab === 'unsubmitted' && (
                <div className="space-y-2.5">
                  {missingClassStudents.length === 0 ? (
                    <div className="py-10 text-center text-emerald-800 bg-emerald-50 rounded-xl space-y-2 border border-emerald-200">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <h4 className="font-bold text-sm">
                        {language === 'ar'
                          ? '🎉 ممتاز! جميع طلاب هذا الصف قاموا بتسليم الواجب بالكامل.'
                          : '🎉 Excellent! All students in this class have submitted.'}
                      </h4>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">
                        {language === 'ar'
                          ? `الطلاب المسجلون في (${targetClassName}) الذين لم يقدموا الحل حتى الآن:`
                          : `Students enrolled in (${targetClassName}) who haven't submitted yet:`}
                      </p>
                      <div className="space-y-2">
                        {missingClassStudents.map((std) => {
                          const isReminded = remindedStudentIds.includes(std.id);
                          return (
                            <div
                              key={std.id}
                              className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={std.avatar}
                                  alt=""
                                  className="w-9 h-9 rounded-xl object-cover border border-amber-200"
                                />
                                <div>
                                  <span className="font-bold text-slate-900 block">{std.name}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {language === 'ar' ? 'الرقم الأكاديمي' : 'Academic ID'}:{' '}
                                    <span className="font-mono font-bold text-slate-700">
                                      {std.nationalId}
                                    </span>{' '}
                                    • {std.parentPhone}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleSendReminder(std.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                  isReminded
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                }`}
                              >
                                {isReminded ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{language === 'ar' ? 'تم إرسال تذكير' : 'Reminded'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Bell className="w-3.5 h-3.5 text-amber-700" />
                                    <span>{language === 'ar' ? 'تذكير ولي الأمر' : 'Remind Parent'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

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
