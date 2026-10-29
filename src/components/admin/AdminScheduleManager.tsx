import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { TimetableEntry } from '../../types';
import {
  Clock,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  User,
  MapPin,
  BookOpen,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';

export const AdminScheduleManager: React.FC = () => {
  const {
    timetable,
    teachers,
    updateTimetableEntry,
    addTimetableEntry,
    deleteTimetableEntry,
    language,
    t,
  } = useSchool();

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const daysArabic: Array<TimetableEntry['day']> = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const daysEnglish = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const activeDayAr = daysArabic[selectedDayIndex];

  // Modal State
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form State
  const [formDay, setFormDay] = useState<TimetableEntry['day']>(activeDayAr);
  const [formPeriod, setFormPeriod] = useState<number>(1);
  const [formTimeSlot, setFormTimeSlot] = useState<string>('08:00 - 08:45');
  const [formSubject, setFormSubject] = useState<string>('الرياضيات');
  const [formSubjectEn, setFormSubjectEn] = useState<string>('Mathematics');
  const [formTeacherName, setFormTeacherName] = useState<string>(teachers[0]?.name || 'أ. فهد الشمري');
  const [formRoom, setFormRoom] = useState<string>('قاعة 101');
  const [formRoomEn, setFormRoomEn] = useState<string>('Hall 101');
  const [formClassName, setFormClassName] = useState<string>('الصف الثالث الثانوي - أ');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setFormDay(entry.day);
    setFormPeriod(entry.period);
    setFormTimeSlot(entry.timeSlot);
    setFormSubject(entry.subject);
    setFormSubjectEn(entry.subjectEn || entry.subject);
    setFormTeacherName(entry.teacherName);
    setFormRoom(entry.room);
    setFormRoomEn(entry.roomEn || entry.room);
    setFormClassName(entry.className);
  };

  const handleOpenAdd = () => {
    setIsAddModalOpen(true);
    setEditingEntry(null);
    setFormDay(activeDayAr);
    setFormPeriod((filteredEntries.length || 0) + 1);
    setFormTimeSlot('08:00 - 08:45');
    setFormSubject('الرياضيات');
    setFormSubjectEn('Mathematics');
    setFormTeacherName(teachers[0]?.name || 'أ. فهد الشمري');
    setFormRoom('قاعة 101');
    setFormRoomEn('Hall 101');
    setFormClassName('الصف الثالث الثانوي - أ');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    updateTimetableEntry(editingEntry.id, {
      day: formDay,
      period: Number(formPeriod),
      timeSlot: formTimeSlot.trim(),
      subject: formSubject.trim(),
      subjectEn: formSubjectEn.trim() || formSubject.trim(),
      teacherName: formTeacherName.trim(),
      room: formRoom.trim(),
      roomEn: formRoomEn.trim() || formRoom.trim(),
      className: formClassName.trim(),
    });

    setEditingEntry(null);
    showToast(
      language === 'ar'
        ? `تم تحديث الحصة (${formSubject}) في جدول يوم ${formDay} بنجاح.`
        : `Class period (${formSubject}) updated successfully in timetable.`
    );
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();

    addTimetableEntry({
      day: formDay,
      period: Number(formPeriod),
      timeSlot: formTimeSlot.trim(),
      subject: formSubject.trim(),
      subjectEn: formSubjectEn.trim() || formSubject.trim(),
      teacherName: formTeacherName.trim(),
      room: formRoom.trim(),
      roomEn: formRoomEn.trim() || formRoom.trim(),
      className: formClassName.trim(),
    });

    setIsAddModalOpen(false);
    showToast(
      language === 'ar'
        ? `تمت إضافة حصة (${formSubject}) إلى جدول يوم ${formDay}.`
        : `New class period added to timetable.`
    );
  };

  const handleDelete = (id: string, subject: string) => {
    if (
      window.confirm(
        language === 'ar'
          ? `هل أنت متأكد من حذف حصة "${subject}" من الجدول الدراسي؟`
          : `Are you sure you want to delete "${subject}" period from the timetable?`
      )
    ) {
      deleteTimetableEntry(id);
      showToast(
        language === 'ar' ? 'تم حذف الحصة من الجدول المدرسي.' : 'Period removed from timetable.'
      );
    }
  };

  const filteredEntries = timetable
    .filter((entry) => entry.day === activeDayAr)
    .sort((a, b) => a.period - b.period);

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
                <span>{language === 'ar' ? 'صلاحية حصرية لمدير المدرسة' : 'Principal Authority'}</span>
              </span>
              <span className="text-xs text-purple-300">
                {language === 'ar' ? 'إدارة الحصص والقاعات والمعلمين' : 'Schedule & Room Control'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {language === 'ar' ? 'تعديل الجدول المدرسي وتوزيع الحصص' : 'Edit School Timetable & Classes'}
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'يستطيع مدير المدرسة حصراً تعديل مواعيد الحصص، تبديل المواد، إسناد المعلمين البدلاء، ونقل القاعات الدراسية في حال حدوث أي تغييرات أو انتدابات.'
                : 'Allows the principal to modify period timings, swap subjects, assign substitute teachers, and relocate classrooms.'}
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition active:scale-95 shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addScheduleEntry')}</span>
          </button>
        </div>
      </div>

      {/* Days Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
        {daysArabic.map((dayAr, index) => {
          const isSelected = selectedDayIndex === index;
          return (
            <button
              key={dayAr}
              onClick={() => setSelectedDayIndex(index)}
              className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all text-center ${
                isSelected
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              {language === 'ar' ? `يوم ${dayAr}` : daysEnglish[index]}
            </button>
          );
        })}
      </div>

      {/* Timetable Period Cards for Active Day */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-700" />
            <span className="font-black text-slate-900 text-sm">
              {language === 'ar' ? `حصص يوم ${activeDayAr}` : `${daysEnglish[selectedDayIndex]} Schedule`}
            </span>
            <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">
              {filteredEntries.length} {language === 'ar' ? 'حصص مجدولة' : 'periods'}
            </span>
          </div>

          <span className="text-xs text-slate-400">
            {language === 'ar'
              ? 'انقر على "تعديل الحصة" لتغيير المادة أو المعلم أو القاعة'
              : 'Click "Edit Period" to change teacher, room or subject'}
          </span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold">
              {language === 'ar' ? 'لا توجد حصص مجدولة لهذا اليوم.' : 'No periods scheduled for this day.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl hover:bg-purple-100 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة حصة دراسية الآن' : 'Add Period Now'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((period) => {
              const isMath = period.subject.includes('الرياضيات') || period.subject.includes('Math');

              return (
                <div
                  key={period.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-purple-300 hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    {/* Period header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 font-black text-sm flex items-center justify-center border border-purple-200/60">
                          {period.period}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {language === 'ar' ? `الحصة ${period.period}` : `Period ${period.period}`}
                          </span>
                          <span className="text-[10px] text-slate-400">{period.className}</span>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
                        {period.timeSlot}
                      </span>
                    </div>

                    {/* Period Details */}
                    <div className="space-y-2.5">
                      <h4 className="font-black text-slate-900 text-base flex items-center gap-2 group-hover:text-purple-700 transition">
                        <BookOpen
                          className={`w-4 h-4 shrink-0 ${
                            isMath ? 'text-blue-600' : 'text-purple-600'
                          }`}
                        />
                        <span>{language === 'ar' ? period.subject : period.subjectEn || period.subject}</span>
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          <strong className="text-slate-800">{t('teacherRole')}:</strong> {period.teacherName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          <strong className="text-slate-800">{t('classroom')}:</strong>{' '}
                          {language === 'ar' ? period.room : period.roomEn || period.room}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Principal */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* EDIT PERIOD BUTTON */}
                    <button
                      onClick={() => handleOpenEdit(period)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs border border-purple-200 transition active:scale-95 shadow-xs"
                      title={language === 'ar' ? 'تعديل بيانات الحصة' : 'Edit Class Period'}
                    >
                      <Pencil className="w-3.5 h-3.5 text-purple-600" />
                      <span>{language === 'ar' ? 'تعديل الحصة' : 'Edit Period'}</span>
                    </button>

                    {/* DELETE PERIOD BUTTON */}
                    <button
                      onClick={() => handleDelete(period.id, period.subject)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition border border-rose-200 active:scale-95"
                      title={language === 'ar' ? 'حذف الحصة' : 'Delete Period'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT PERIOD MODAL */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    {language === 'ar' ? 'تعديل بيانات الحصة (صلاحية المدير)' : 'Edit Class Period (Principal)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar' ? 'تحديث المادة، المعلم، القاعة والتوقيت' : 'Update period details, teacher, and room'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingEntry(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs">
              {/* Day and Period Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اليوم' : 'Day'}
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as TimetableEntry['day'])}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  >
                    {daysArabic.map((d, idx) => (
                      <option key={d} value={d}>
                        {language === 'ar' ? `يوم ${d}` : daysEnglish[idx]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رقم الحصة' : 'Period Number'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-black text-purple-900"
                  />
                </div>
              </div>

              {/* Time Slot */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'توقيت الحصة (من - إلى)' : 'Time Slot'}
                </label>
                <input
                  type="text"
                  value={formTimeSlot}
                  onChange={(e) => setFormTimeSlot(e.target.value)}
                  required
                  placeholder="08:00 - 08:45"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              {/* Subject (Arabic & English) */}
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

              {/* Teacher Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'المعلم المشرف على الحصة' : 'Assigned Teacher'}
                </label>
                <input
                  type="text"
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              {/* Classroom / Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'القاعة / المكان' : 'Room (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'القاعة (بالإنجليزية)' : 'Room (English)'}
                  </label>
                  <input
                    type="text"
                    value={formRoomEn}
                    onChange={(e) => setFormRoomEn(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Class Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'الصف الدراسي / الشعبة' : 'Class / Grade Section'}
                </label>
                <input
                  type="text"
                  value={formClassName}
                  onChange={(e) => setFormClassName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black shadow-lg shadow-purple-700/20 transition active:scale-95"
                >
                  {language === 'ar' ? 'حفظ تعديلات الحصة' : 'Save Period Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PERIOD MODAL */}
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
                    {language === 'ar' ? 'إضافة حصة دراسية جديدة' : 'Add New Class Period'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar' ? `إدراج حصة جديدة في جدول يوم ${formDay}` : `Insert period in ${formDay} schedule`}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اليوم' : 'Day'}
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as TimetableEntry['day'])}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  >
                    {daysArabic.map((d, idx) => (
                      <option key={d} value={d}>
                        {language === 'ar' ? `يوم ${d}` : daysEnglish[idx]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رقم الحصة' : 'Period Number'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-black text-purple-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'توقيت الحصة' : 'Time Slot'}
                </label>
                <input
                  type="text"
                  value={formTimeSlot}
                  onChange={(e) => setFormTimeSlot(e.target.value)}
                  required
                  placeholder="08:00 - 08:45"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

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

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'المعلم المشرف' : 'Teacher'}
                </label>
                <input
                  type="text"
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'القاعة / المكان' : 'Room (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'القاعة (بالإنجليزية)' : 'Room (English)'}
                  </label>
                  <input
                    type="text"
                    value={formRoomEn}
                    onChange={(e) => setFormRoomEn(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'الصف / الشعبة' : 'Class / Section'}
                </label>
                <input
                  type="text"
                  value={formClassName}
                  onChange={(e) => setFormClassName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

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
                  {language === 'ar' ? 'إدراج الحصة في الجدول' : 'Insert Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
