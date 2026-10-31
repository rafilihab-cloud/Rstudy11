import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { GradeItem } from '../../types';
import {
  Award,
  Pencil,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  X,
  User,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export const AdminGradesManager: React.FC = () => {
  const {
    students,
    grades,
    currentUser,
    addGrade,
    updateGrade,
    deleteGrade,
    language,
    t,
  } = useSchool();

  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for Editing / Adding
  const [editingGrade, setEditingGrade] = useState<GradeItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form State for Editing/Adding
  const [formStudentId, setFormStudentId] = useState<string>(students[0]?.id || 'std_1');
  const [formSubject, setFormSubject] = useState<string>('الرياضيات');
  const [formSubjectEn, setFormSubjectEn] = useState<string>('Mathematics');
  const [formExamType, setFormExamType] = useState<GradeItem['examType']>('اختبار نصفي');
  const [formScore, setFormScore] = useState<number>(20);
  const [formMaxScore, setFormMaxScore] = useState<number>(20);
  const [formTerm, setFormTerm] = useState<GradeItem['term']>('الفصل الأول');
  const [formFeedback, setFormFeedback] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenEdit = (grade: GradeItem) => {
    setEditingGrade(grade);
    setFormStudentId(grade.studentId);
    setFormSubject(grade.subject);
    setFormSubjectEn(grade.subjectEn || grade.subject);
    setFormExamType(grade.examType);
    setFormScore(grade.score);
    setFormMaxScore(grade.maxScore);
    setFormTerm(grade.term);
    setFormFeedback(grade.feedback || '');
    setFormDate(grade.date || new Date().toISOString().split('T')[0]);
  };

  const handleOpenAdd = () => {
    setIsAddModalOpen(true);
    setEditingGrade(null);
    setFormStudentId(students[0]?.id || 'std_1');
    setFormSubject('الرياضيات');
    setFormSubjectEn('Mathematics');
    setFormExamType('اختبار قصير');
    setFormScore(10);
    setFormMaxScore(10);
    setFormTerm('الفصل الأول');
    setFormFeedback('');
    setFormDate(new Date().toISOString().split('T')[0]);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;

    const student = students.find((s) => s.id === formStudentId);
    const studentName = student ? (language === 'ar' ? student.name : student.nameEn || student.name) : editingGrade.studentName;
    const className = student?.className || editingGrade.className;

    updateGrade(editingGrade.id, {
      studentId: formStudentId,
      studentName,
      className,
      subject: formSubject,
      subjectEn: formSubjectEn,
      examType: formExamType,
      score: Number(formScore),
      maxScore: Number(formMaxScore),
      term: formTerm,
      feedback: formFeedback,
      feedbackEn: formFeedback,
      date: formDate,
    });

    setEditingGrade(null);
    showToast(
      language === 'ar'
        ? `تم تحديث درجة الطالب (${studentName}) وتعديل المعدل الأكاديمي فوراً.`
        : 'Student grade updated successfully and GPA recalculated.'
    );
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();

    const student = students.find((s) => s.id === formStudentId) || students[0];
    const studentName = student ? (language === 'ar' ? student.name : student.nameEn || student.name) : 'طالب';
    const className = student?.className || 'الصف الثالث المتوسط';

    addGrade({
      studentId: formStudentId,
      studentName,
      className,
      subject: formSubject,
      subjectEn: formSubjectEn,
      examType: formExamType,
      score: Number(formScore),
      maxScore: Number(formMaxScore),
      term: formTerm,
      feedback: formFeedback,
      feedbackEn: formFeedback,
      date: formDate,
      gradedBy: currentUser.name,
    });

    setIsAddModalOpen(false);
    showToast(
      language === 'ar'
        ? `تم رصد وحفظ الدرجة الجديدة بنجاح في سجل الطالب (${studentName}).`
        : 'New grade successfully recorded in student transcript.'
    );
  };

  const handleDeleteGrade = (id: string, subject: string, examType: string) => {
    if (
      window.confirm(
        language === 'ar'
          ? `هل أنت متأكد من حذف درجة (${subject} - ${examType}) من السجل؟`
          : `Are you sure you want to delete this ${subject} grade?`
      )
    ) {
      deleteGrade(id);
      showToast(language === 'ar' ? 'تم حذف الدرجة من السجل الأكاديمي.' : 'Grade deleted from record.');
    }
  };

  // Filtered grades list
  const filteredGrades = grades.filter((g) => {
    const matchesStudent = selectedStudentFilter === 'all' || g.studentId === selectedStudentFilter;
    const matchesSubject = selectedSubjectFilter === 'all' || g.subject === selectedSubjectFilter;
    const student = students.find((s) => s.id === g.studentId);
    const studentName = student ? (language === 'ar' ? student.name : student.nameEn || student.name) : g.studentName;
    const matchesSearch =
      searchQuery === '' ||
      g.examType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStudent && matchesSubject && matchesSearch;
  });

  const uniqueSubjects = Array.from(new Set(grades.map((g) => g.subject)));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto z-50 sm:max-w-md bg-emerald-700 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-slideDown">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
          <p className="text-xs sm:text-sm font-bold flex-1">{toastMessage}</p>
          <button onClick={() => setToastMessage(null)} className="text-emerald-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-purple-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-500/30 text-purple-200 border border-purple-400/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span>{language === 'ar' ? 'صلاحية حصرية لمدير المدرسة' : 'Exclusive Principal Authority'}</span>
              </span>
              <span className="text-xs text-purple-300">
                {language === 'ar' ? 'تعديل وحذف وإضافة درجات الطلاب' : 'Grades Calibration & Control'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {language === 'ar' ? 'تعديل درجات الطلاب والاختبارات' : 'Edit Student Grades & Assessments'}
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'تتيح هذه الصفحة لمدير المدرسة حصراً تعديل أي درجة تم رصدها، تصحيح الأخطاء، أو إعادة احتساب الاختبارات، مع تحديث فوري للمعدل التراكمي للطالب وكشف الدرجات.'
                : 'Allows the principal to edit, calibrate, or remove recorded student grades. GPA and transcripts are recalculated in real time.'}
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition active:scale-95 shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addNewGradeBtn')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute top-3 right-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'البحث باسم الطالب، نوع الاختبار، أو المادة...'
                : 'Search student, exam type, or subject...'
            }
            className="w-full pr-9 pl-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Student Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">{language === 'ar' ? 'جميع الطلاب' : 'All Students'}</option>
              {students.map((std) => (
                <option key={std.id} value={std.id}>
                  {language === 'ar' ? std.name : std.nameEn || std.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">{language === 'ar' ? 'كافة المواد' : 'All Subjects'}</option>
              {uniqueSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <h3 className="font-black text-slate-900 text-base">
              {language === 'ar' ? 'سجل الدرجات القابل للتعديل' : 'Editable Grades Registry'}
            </h3>
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
              {filteredGrades.length} {language === 'ar' ? 'درجة' : 'records'}
            </span>
          </div>

          <span className="text-xs text-slate-400 hidden sm:block">
            {language === 'ar'
              ? 'انقر على زر "تعديل" لتغيير الدرجة أو تصحيحها فوراً'
              : 'Click "Edit" to modify any student evaluation'}
          </span>
        </div>

        {filteredGrades.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold">{language === 'ar' ? 'لا توجد درجات مطابقة للبحث' : 'No matching grades found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('studentRole')}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'المادة' : 'Subject'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'نوع التقييم' : 'Assessment'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'الدرجة المحرزة' : 'Score'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'النسبة والتقدير' : 'Percentage'}</th>
                  <th className="py-3 px-4">{language === 'ar' ? 'الفصل والتاريخ' : 'Term & Date'}</th>
                  <th className="py-3 px-4 text-center">{language === 'ar' ? 'إجراءات المدير' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGrades.map((grade) => {
                  const student = students.find((s) => s.id === grade.studentId);
                  const percentage = Math.round((grade.score / grade.maxScore) * 100);
                  const isMath = grade.subject.includes('الرياضيات') || grade.subject.includes('Math');

                  return (
                    <tr key={grade.id} className="hover:bg-purple-50/30 transition">
                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={student?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={student?.name}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {student ? (language === 'ar' ? student.name : student.nameEn || student.name) : grade.studentName}
                            </span>
                            <span className="text-[10px] text-slate-400">{student?.className || grade.className}</span>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isMath
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {language === 'ar' ? grade.subject : grade.subjectEn || grade.subject}
                        </span>
                      </td>

                      {/* Assessment Type & Feedback */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">
                          {grade.examType}
                        </span>
                        {grade.feedback && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                            {grade.feedback}
                          </span>
                        )}
                      </td>

                      {/* Score / MaxScore */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-sm text-slate-900">
                          {grade.score}
                        </span>
                        <span className="text-slate-400 text-xs"> / {grade.maxScore}</span>
                      </td>

                      {/* Percentage Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-black ${
                            percentage >= 90
                              ? 'bg-emerald-100 text-emerald-800'
                              : percentage >= 80
                              ? 'bg-blue-100 text-blue-800'
                              : percentage >= 60
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          %{percentage}
                        </span>
                      </td>

                      {/* Term & Date */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        <span className="font-medium block text-slate-700">{grade.term}</span>
                        <span className="text-[10px] font-mono text-slate-400">{grade.date}</span>
                      </td>

                      {/* Action Buttons (Edit & Delete) */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => handleOpenEdit(grade)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition shadow-xs active:scale-95"
                            title={language === 'ar' ? 'تعديل الدرجة' : 'Edit Grade'}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            onClick={() => handleDeleteGrade(grade.id, grade.subject, grade.examType)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition border border-rose-200 active:scale-95"
                            title={language === 'ar' ? 'حذف الدرجة' : 'Delete Grade'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT GRADE MODAL */}
      {editingGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    {language === 'ar' ? 'تعديل درجة الطالب (صلاحية المدير)' : 'Edit Student Grade (Principal)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar' ? 'تعديل الدرجة وتحديث السجل والمعدل مباشرة' : 'Update score and recalculate GPA immediately'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingGrade(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs">
              {/* Student selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'الطالب المستهدف' : 'Target Student'}
                </label>
                <select
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                >
                  {students.map((std) => (
                    <option key={std.id} value={std.id}>
                      {language === 'ar' ? std.name : std.nameEn || std.name} ({std.className})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'المادة (بالعربية)' : 'Subject (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'المادة (بالإنجليزية)' : 'Subject (English)'}
                  </label>
                  <input
                    type="text"
                    value={formSubjectEn}
                    onChange={(e) => setFormSubjectEn(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              {/* Evaluation Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'نوع التقييم' : 'Evaluation Type'}
                  </label>
                  <select
                    value={formExamType}
                    onChange={(e) => setFormExamType(e.target.value as GradeItem['examType'])}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="اختبار نصفي">اختبار نصفي</option>
                    <option value="اختبار نهائي">اختبار نهائي</option>
                    <option value="اختبار قصير">اختبار قصير</option>
                    <option value="واجب وتقييم مستمر">واجب وتقييم مستمر</option>
                    <option value="مشروع عملي">مشروع عملي</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الفصل الدراسي' : 'Term'}
                  </label>
                  <select
                    value={formTerm}
                    onChange={(e) => setFormTerm(e.target.value as GradeItem['term'])}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="النصف الأول">{language === 'ar' ? 'النصف الأول (الفصل الأول)' : 'First Semester / Half'}</option>
                    <option value="النصف الثاني">{language === 'ar' ? 'النصف الثاني (الفصل الثاني)' : 'Second Semester / Half'}</option>
                    <option value="الفصل الأول">الفصل الأول</option>
                    <option value="الفصل الثاني">الفصل الثاني</option>
                    <option value="الفصل الصيفي">الفصل الصيفي</option>
                  </select>
                </div>
              </div>

              {/* Scores: Score and MaxScore */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الدرجة المكتسبة (المعدلة)' : 'Earned Score (Edited)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formMaxScore}
                    step="0.5"
                    value={formScore}
                    onChange={(e) => setFormScore(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-purple-300 bg-purple-50/40 text-base font-black text-purple-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الدرجة العظمى (القصوى)' : 'Max Score'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formMaxScore}
                    onChange={(e) => setFormMaxScore(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-base font-black text-slate-700 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'تاريخ الرصد' : 'Date'}
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              {/* Feedback / Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'ملاحظات المعلم / الإدارة' : 'Teacher / Principal Notes'}
                </label>
                <textarea
                  value={formFeedback}
                  onChange={(e) => setFormFeedback(e.target.value)}
                  rows={2}
                  placeholder={language === 'ar' ? 'ملاحظة تشجيعية أو سبب تعديل الدرجة...' : 'Reason for edit or encouragement...'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black shadow-lg shadow-purple-700/20 transition active:scale-95"
                >
                  {language === 'ar' ? 'حفظ تعديلات الدرجة' : 'Save Grade Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW GRADE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    {language === 'ar' ? 'رصد درجة جديدة لطالب' : 'Record New Student Grade'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar' ? 'إضافة تقييم جديد مع احتساب المعدل تلقائياً' : 'Add assessment and recalculate GPA'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-4 mt-4 text-xs">
              {/* Student selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'اختر الطالب' : 'Select Student'}
                </label>
                <select
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  {students.map((std) => (
                    <option key={std.id} value={std.id}>
                      {language === 'ar' ? std.name : std.nameEn || std.name} ({std.className})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'المادة (بالعربية)' : 'Subject (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'المادة (بالإنجليزية)' : 'Subject (English)'}
                  </label>
                  <input
                    type="text"
                    value={formSubjectEn}
                    onChange={(e) => setFormSubjectEn(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Evaluation Type & Term */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'نوع التقييم' : 'Evaluation Type'}
                  </label>
                  <select
                    value={formExamType}
                    onChange={(e) => setFormExamType(e.target.value as GradeItem['examType'])}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="اختبار نصفي">اختبار نصفي</option>
                    <option value="اختبار نهائي">اختبار نهائي</option>
                    <option value="اختبار قصير">اختبار قصير</option>
                    <option value="واجب وتقييم مستمر">واجب وتقييم مستمر</option>
                    <option value="مشروع عملي">مشروع عملي</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الفصل الدراسي' : 'Term'}
                  </label>
                  <select
                    value={formTerm}
                    onChange={(e) => setFormTerm(e.target.value as GradeItem['term'])}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="النصف الأول">{language === 'ar' ? 'النصف الأول (الفصل الأول)' : 'First Semester / Half'}</option>
                    <option value="النصف الثاني">{language === 'ar' ? 'النصف الثاني (الفصل الثاني)' : 'Second Semester / Half'}</option>
                    <option value="الفصل الأول">الفصل الأول</option>
                    <option value="الفصل الثاني">الفصل الثاني</option>
                    <option value="الفصل الصيفي">الفصل الصيفي</option>
                  </select>
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الدرجة المستحقة' : 'Score Earned'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formMaxScore}
                    step="0.5"
                    value={formScore}
                    onChange={(e) => setFormScore(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-purple-300 bg-purple-50/40 text-base font-black text-purple-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الدرجة الكاملة' : 'Max Score'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formMaxScore}
                    onChange={(e) => setFormMaxScore(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-base font-black text-slate-700"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'تاريخ التقييم' : 'Date'}
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              {/* Feedback / Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'ملاحظات المعلم / التوجيه' : 'Feedback Notes'}
                </label>
                <textarea
                  value={formFeedback}
                  onChange={(e) => setFormFeedback(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black shadow-lg shadow-purple-700/20"
                >
                  {language === 'ar' ? 'رصد وحفظ الدرجة' : 'Record Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
