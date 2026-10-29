import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import { Printer, X, Award, Shield } from 'lucide-react';

interface Props {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportCardModal: React.FC<Props> = ({ student, isOpen, onClose }) => {
  const { grades, language, t } = useSchool();

  if (!isOpen) return null;

  const studentGrades = grades.filter((g) => g.studentId === student.id);
  const totalEarned = studentGrades.reduce((sum, g) => sum + g.score, 0);
  const totalPossible = studentGrades.reduce((sum, g) => sum + g.maxScore, 0);
  const percentage = totalPossible > 0 ? ((totalEarned / totalPossible) * 100).toFixed(1) : student.gpa;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-800 border border-slate-200 print:border-none print:shadow-none print:max-w-none print:p-0">
        {/* Controls - Hidden during print */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 no-print">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">{t('officialTranscriptTitle')}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>{t('print')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate / Official Report Card Content */}
        <div className="mt-4 p-6 sm:p-8 border-4 border-double border-blue-900/40 rounded-2xl bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 relative overflow-hidden">
          {/* Subtle watermark seal */}
          <div className="absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-5 pointer-events-none">
            <Shield className="w-96 h-96 text-blue-900" />
          </div>

          {/* School Header */}
          <div className="flex items-center justify-between pb-6 border-b-2 border-slate-300">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-blue-950">
                {language === 'ar' ? 'أكاديمية Rstudy التعليمية' : 'Rstudy Educational Academy'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {language === 'ar' ? 'قسم الشؤون التعليمية والتقويم الأكاديمي' : 'Department of Academic Assessment & Evaluation'}
              </p>
              <p className="text-[11px] text-slate-400">
                {language === 'ar' ? 'العام الدراسي 1448هـ / 2026م' : 'Academic Year 2026 / 1448 AH'}
              </p>
            </div>
            <div className="text-left">
              <div className="inline-block p-2 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <span className="block text-[10px] text-slate-500 font-bold">
                  {language === 'ar' ? 'الرقم الأكاديمي' : 'Academic ID'}
                </span>
                <span className="text-xs font-mono font-black text-blue-900">{student.nationalId}</span>
              </div>
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
            <div>
              <span className="text-slate-500 block">{language === 'ar' ? 'اسم الطالب:' : 'Student Name:'}</span>
              <strong className="text-slate-900 font-bold text-sm">
                {language === 'ar' ? student.name : student.nameEn || student.name}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">{t('class')}:</span>
              <strong className="text-slate-900 font-bold">{student.className}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">{t('academicRank')}:</span>
              <strong className="text-emerald-700 font-bold">
                {language === 'ar' ? `المركز ${student.rankInClass}` : `Rank #${student.rankInClass}`}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">{t('gpa')}:</span>
              <strong className="text-blue-700 font-bold text-sm">%{percentage}</strong>
            </div>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">{t('subject')}</th>
                  <th className="py-2.5 px-3">{t('examType')}</th>
                  <th className="py-2.5 px-3 text-center">{t('score')}</th>
                  <th className="py-2.5 px-3 text-center">{t('maxScore')}</th>
                  <th className="py-2.5 px-3 text-center">{t('percentage')}</th>
                  <th className="py-2.5 px-3">{t('feedback')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentGrades.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      {language === 'ar' ? 'لا توجد درجات مرصودة لهذا الطالب حتى الآن.' : 'No grades recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  studentGrades.map((g) => {
                    const pct = ((g.score / g.maxScore) * 100).toFixed(0);
                    return (
                      <tr key={g.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {language === 'ar' ? g.subject : g.subjectEn || g.subject}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{g.examType}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-blue-700">{g.score}</td>
                        <td className="py-2.5 px-3 text-center text-slate-500">{g.maxScore}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
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
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-[200px] truncate">
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
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end text-center">
            <div>
              <p className="text-xs text-slate-500 mb-1">
                {language === 'ar' ? 'المرشد الطلابي' : 'Student Counselor'}
              </p>
              <div className="font-handwriting font-bold text-sm text-slate-700">أ. فهد الشمري</div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">
                {language === 'ar' ? 'ختم الإدارة المدرسية' : 'Official Seal'}
              </p>
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-blue-900/50 flex items-center justify-center text-blue-950 font-bold text-[10px]">
                {language === 'ar' ? 'معتمد رسمي' : 'VERIFIED'}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">
                {language === 'ar' ? 'مدير المعهد والمدرسة' : 'Principal & Director'}
              </p>
              <div className="font-handwriting font-bold text-sm text-slate-900">د. عبد الرحمن السعدي</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
