import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import { Printer, X, Award, Shield, CheckCircle2 } from 'lucide-react';

interface Props {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportCardModal: React.FC<Props> = ({ student, isOpen, onClose }) => {
  const { grades, activeSchool, language, t } = useSchool();

  if (!isOpen) return null;

  const studentGrades = grades.filter((g) => g.studentId === student.id);

  // Semester breakdowns
  const sem1Grades = studentGrades.filter(
    (g) =>
      g.term === 'النصف الأول' ||
      g.term === 'الفصل الأول' ||
      g.semester === 'first' ||
      !g.term ||
      g.term === 'منتصف الفصل'
  );
  const sem2Grades = studentGrades.filter(
    (g) =>
      g.term === 'النصف الثاني' ||
      g.term === 'الفصل الثاني' ||
      g.semester === 'second'
  );

  const sem1Total = sem1Grades.reduce((sum, g) => sum + g.score, 0);
  const sem1Possible = sem1Grades.reduce((sum, g) => sum + g.maxScore, 0);
  const sem1Percentage = sem1Possible > 0 ? ((sem1Total / sem1Possible) * 100).toFixed(1) : '—';

  const sem2Total = sem2Grades.reduce((sum, g) => sum + g.score, 0);
  const sem2Possible = sem2Grades.reduce((sum, g) => sum + g.maxScore, 0);
  const sem2Percentage = sem2Possible > 0 ? ((sem2Total / sem2Possible) * 100).toFixed(1) : '—';

  const totalEarned = studentGrades.reduce((sum, g) => sum + g.score, 0);
  const totalPossible = studentGrades.reduce((sum, g) => sum + g.maxScore, 0);
  const finalPercentage = totalPossible > 0 ? ((totalEarned / totalPossible) * 100).toFixed(1) : student.gpa;

  const handlePrint = () => {
    window.print();
  };

  const schoolNameDisplay = activeSchool
    ? language === 'ar'
      ? activeSchool.name
      : activeSchool.nameEn || activeSchool.name
    : language === 'ar'
    ? 'أكاديمية Rstudy التعليمية'
    : 'Rstudy Educational Academy';

  return (
    <div className="certificate-print-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-fadeIn print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="certificate-print-card relative w-full max-w-2xl lg:max-w-3xl bg-white rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-800 border border-slate-200 print:border-none print:shadow-none print:max-w-none print:p-0 print:m-0">
        {/* Controls - Hidden during print */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                {t('officialTranscriptTitle')}
              </h3>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{language === 'ar' ? 'مقاس متناسق مع صفحة A4 قياسية' : 'Standard A4 Proportional Fit'}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95"
              title={language === 'ar' ? 'طباعة الشهادة بحجم صفحة A4 متناسق' : 'Print Certificate (A4 Page Fit)'}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'طباعة الشهادة (A4)' : 'Print (A4)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              title={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate / Official Report Card Content */}
        <div className="certificate-document-frame mt-3 p-4 sm:p-5 border-2 sm:border-3 border-double border-blue-900/40 rounded-2xl bg-gradient-to-b from-slate-50/40 via-white to-slate-50/40 relative overflow-hidden print:p-3 print:m-0 print:border-2 print:border-blue-950">
          {/* Subtle watermark seal safely centered with zero horizontal displacement */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none overflow-hidden">
            <Shield className="w-56 h-56 text-blue-950" />
          </div>

          {/* School Header with Logo */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-300 relative z-10">
            <div className="flex items-center gap-3">
              {activeSchool?.logo && (
                <img
                  src={activeSchool.logo}
                  alt={schoolNameDisplay}
                  className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-xs"
                />
              )}
              <div>
                <h2 className="text-base sm:text-lg font-black text-blue-950 leading-snug">
                  {schoolNameDisplay}
                </h2>
                <p className="text-[11px] text-slate-600">
                  {language === 'ar' ? 'قسم الشؤون التعليمية والتقويم الأكاديمي' : 'Department of Academic Assessment & Evaluation'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {language === 'ar' ? 'العام الدراسي 1448هـ / 2026م • وثيقة كشف الدرجات الرسمية' : 'Academic Year 2026 / 1448 AH • Official Academic Transcript'}
                </p>
              </div>
            </div>
            <div className="text-left rtl:text-right">
              <div className="inline-block p-2 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <span className="block text-[9px] text-slate-500 font-bold">
                  {language === 'ar' ? 'الرقم الأكاديمي' : 'Academic ID'}
                </span>
                <span className="text-xs font-mono font-black text-blue-900">{student.nationalId}</span>
              </div>
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs relative z-10 print:my-2 print:p-2 print:bg-slate-50">
            <div>
              <span className="text-slate-500 block text-[10px]">{language === 'ar' ? 'اسم الطالب:' : 'Student Name:'}</span>
              <strong className="text-slate-900 font-bold text-xs">
                {language === 'ar' ? student.name : student.nameEn || student.name}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">{t('class')}:</span>
              <strong className="text-slate-900 font-bold text-xs">{student.className}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">{t('academicRank')}:</span>
              <strong className="text-emerald-700 font-bold text-xs">
                {language === 'ar' ? `المركز ${student.rankInClass}` : `Rank #${student.rankInClass}`}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">{language === 'ar' ? 'المعدل التراكمي النهائي:' : 'Final Cumulative GPA:'}</span>
              <strong className="text-blue-700 font-bold text-xs">%{finalPercentage}</strong>
            </div>
          </div>

          {/* Semesters 1 & 2 Summary Box */}
          <div className="grid grid-cols-3 gap-2 p-2 bg-white rounded-xl border border-blue-200 text-center text-xs mb-3 relative z-10 print:mb-2 print:p-1.5">
            <div className="p-1.5 bg-blue-50/50 rounded-lg">
              <span className="text-[9px] text-slate-500 block">{language === 'ar' ? 'النصف الأول (مجموع / معدل)' : 'Semester 1'}</span>
              <strong className="text-blue-900 font-bold font-mono text-[11px]">
                {sem1Total} / {sem1Possible} (%{sem1Percentage})
              </strong>
            </div>
            <div className="p-1.5 bg-purple-50/50 rounded-lg">
              <span className="text-[9px] text-slate-500 block">{language === 'ar' ? 'النصف الثاني (مجموع / معدل)' : 'Semester 2'}</span>
              <strong className="text-purple-900 font-bold font-mono text-[11px]">
                {sem2Total} / {sem2Possible} (%{sem2Percentage})
              </strong>
            </div>
            <div className="p-1.5 bg-emerald-50/50 rounded-lg">
              <span className="text-[9px] text-emerald-800 font-bold block">{language === 'ar' ? 'المجموع والمعدل النهائي' : 'Final Overall'}</span>
              <strong className="text-emerald-950 font-black font-mono text-[11px]">
                {totalEarned} / {totalPossible} (%{finalPercentage})
              </strong>
            </div>
          </div>

          {/* Grades Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 mb-3 relative z-10 print:mb-2">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] sm:text-[11px]">
                <tr>
                  <th className="py-1.5 px-2.5">{t('subject')}</th>
                  <th className="py-1.5 px-2">{language === 'ar' ? 'الفصل' : 'Term'}</th>
                  <th className="py-1.5 px-2">{t('examType')}</th>
                  <th className="py-1.5 px-2 text-center">{t('score')}</th>
                  <th className="py-1.5 px-2 text-center">{t('maxScore')}</th>
                  <th className="py-1.5 px-2 text-center">{t('percentage')}</th>
                  <th className="py-1.5 px-2">{t('feedback')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[10px] sm:text-[11px]">
                {studentGrades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-slate-400">
                      {language === 'ar' ? 'لا توجد درجات مرصودة لهذا الطالب حتى الآن.' : 'No grades recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  studentGrades.map((g) => {
                    const pct = ((g.score / g.maxScore) * 100).toFixed(0);
                    const isSem2 = g.term === 'النصف الثاني' || g.term === 'الفصل الثاني' || g.semester === 'second';
                    return (
                      <tr key={g.id} className="hover:bg-slate-50/60">
                        <td className="py-1.5 px-2.5 font-bold text-slate-900">
                          {language === 'ar' ? g.subject : g.subjectEn || g.subject}
                        </td>
                        <td className="py-1.5 px-2">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                              isSem2
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {g.term || (language === 'ar' ? 'النصف الأول' : 'Semester 1')}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-slate-600">{g.examType}</td>
                        <td className="py-1.5 px-2 text-center font-bold text-blue-700">{g.score}</td>
                        <td className="py-1.5 px-2 text-center text-slate-500">{g.maxScore}</td>
                        <td className="py-1.5 px-2 text-center">
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
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
                        <td className="py-1.5 px-2 text-slate-500 text-[10px] max-w-[160px] truncate print:max-w-none print:whitespace-normal">
                          {language === 'ar' ? g.feedback : g.feedbackEn || g.feedback || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Academic Standing & Signatures */}
          <div className="pt-2.5 border-t border-slate-200 grid grid-cols-3 gap-3 items-end text-center relative z-10 avoid-break print:pt-2">
            <div>
              <p className="text-[10px] text-slate-500 mb-0.5">
                {language === 'ar' ? 'المرشد الطلابي' : 'Student Counselor'}
              </p>
              <div className="font-bold text-xs text-slate-700">أ. فهد الشمري</div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-0.5">
                {language === 'ar' ? 'ختم الإدارة المدرسية' : 'Official Seal'}
              </p>
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-dashed border-blue-900/60 flex items-center justify-center text-blue-950 font-black text-[9px] bg-blue-50/30">
                {language === 'ar' ? 'معتمد رسمي' : 'VERIFIED'}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-0.5">
                {language === 'ar' ? 'مدير المعهد والمدرسة' : 'Principal & Director'}
              </p>
              <div className="font-bold text-xs text-slate-900">د. عبد الرحمن السعدي</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
