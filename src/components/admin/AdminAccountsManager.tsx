import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Teacher, Student, ParentAccount, UserRole } from '../../types';
import {
  Users,
  GraduationCap,
  ShieldCheck,
  UserPlus,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Mail,
  Phone,
  BookOpen,
  Award,
  Sparkles,
  Link as LinkIcon,
  X,
  Key,
  Wallet,
  Receipt,
  Eye,
  EyeOff,
  RefreshCw,
  Edit3,
  Printer,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { DraggableScrollContainer } from '../shared/DraggableScrollContainer';

export const AdminAccountsManager: React.FC = () => {
  const {
    students,
    teachers,
    parents,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addStudentWithParent,
    updateStudent,
    updateStudentTuitionFee,
    deleteStudent,
    addParent,
    deleteParent,
    bulkDeleteAccounts,
    activeSchool,
    language,
    t,
  } = useSchool();

  const [activeAccountTab, setActiveAccountTab] = useState<'all' | 'teachers' | 'students' | 'parents'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);

  // Edit Student State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentNameAr, setEditStudentNameAr] = useState('');
  const [editStudentNameEn, setEditStudentNameEn] = useState('');
  const [editStudentNationalId, setEditStudentNationalId] = useState('');
  const [editStudentPassword, setEditStudentPassword] = useState('');
  const [showEditStudentPassword, setShowEditStudentPassword] = useState(false);
  const [editStudentClass, setEditStudentClass] = useState('الصف الثالث المتوسط - أ');
  const [editStudentGpa, setEditStudentGpa] = useState<number>(95);
  const [editStudentTotalTuition, setEditStudentTotalTuition] = useState<number>(2500);
  const [editStudentPaidTuition, setEditStudentPaidTuition] = useState<number>(0);
  const [editStudentAvatar, setEditStudentAvatar] = useState('');

  // Edit Teacher State
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editTeacherNameAr, setEditTeacherNameAr] = useState('');
  const [editTeacherNameEn, setEditTeacherNameEn] = useState('');
  const [editTeacherEmail, setEditTeacherEmail] = useState('');
  const [editTeacherPhone, setEditTeacherPhone] = useState('');
  const [editTeacherPassword, setEditTeacherPassword] = useState('');
  const [showEditTeacherPassword, setShowEditTeacherPassword] = useState(false);
  const [editTeacherSubject, setEditTeacherSubject] = useState('الرياضيات');
  const [editTeacherClass, setEditTeacherClass] = useState('الصف الثالث المتوسط - أ');
  const [editTeacherExp, setEditTeacherExp] = useState<number>(5);
  const [editTeacherAvatar, setEditTeacherAvatar] = useState('');

  // Bulk Delete Accounts State
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<'students' | 'teachers' | 'all'>('students');
  const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState('');

  // Single Deletion In-App Confirmation (no window.confirm)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [deletingParent, setDeletingParent] = useState<ParentAccount | null>(null);

  // Print Slip State
  interface PrintSlipItem {
    role: 'student' | 'teacher';
    id: string;
    name: string;
    username: string;
    password: string;
    className?: string;
    subject?: string;
    phone?: string;
    avatar?: string;
  }
  const [printingSlip, setPrintingSlip] = useState<PrintSlipItem | null>(null);
  const [batchPrintRole, setBatchPrintRole] = useState<'students' | 'teachers' | 'all' | null>(null);

  // Toast notification state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Success Credentials Dialog
  const [createdCredentials, setCreatedCredentials] = useState<{
    student?: Student;
    parent?: ParentAccount;
    teacher?: Teacher;
    isNewParent?: boolean;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Auto-generation ID helpers
  const generateStudentAcademicId = () => {
    const year = '2026';
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `${year}${rand}`;
  };

  const generateParentCivilId = () => {
    const rand = Math.floor(10000000 + Math.random() * 90000000);
    return `10${rand}`;
  };

  const generateStudentPassword = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `Std@${rand}`;
  };

  // Student + Parent Form State
  const [studentNameAr, setStudentNameAr] = useState('');
  const [studentNameEn, setStudentNameEn] = useState('');
  const [studentNationalId, setStudentNationalId] = useState(() => generateStudentAcademicId());
  const [studentPassword, setStudentPassword] = useState(() => generateStudentPassword());
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [studentClass, setStudentClass] = useState('الصف الثالث المتوسط - أ');
  const [studentGpa, setStudentGpa] = useState<number>(96.5);
  const [studentAvatar, setStudentAvatar] = useState(
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  );
  const [studentTotalTuition, setStudentTotalTuition] = useState<number>(2500);
  const [studentPaidTuition, setStudentPaidTuition] = useState<number>(0);

  // Student Tuition Editing Modal
  const [editingTuitionStudent, setEditingTuitionStudent] = useState<Student | null>(null);
  const [tuitionPaidInput, setTuitionPaidInput] = useState<number>(0);
  const [tuitionTotalInput, setTuitionTotalInput] = useState<number>(2500);

  // Automated Parent Section State
  const [parentMode, setParentMode] = useState<'new' | 'existing'>('new');
  const [existingParentId, setExistingParentId] = useState(parents[0]?.id || '');
  const [parentNameAr, setParentNameAr] = useState('');
  const [parentNameEn, setParentNameEn] = useState('');
  const [parentPhone, setParentPhone] = useState('+966 50 ');
  const [parentEmail, setParentEmail] = useState('');
  const [parentNationalId, setParentNationalId] = useState(() => generateParentCivilId());
  const [parentRelationship, setParentRelationship] = useState('ولي أمر (أب)');

  // Teacher Form State
  const generateTeacherPassword = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `Tch@${rand}`;
  };

  const [teacherNameAr, setTeacherNameAr] = useState('');
  const [teacherNameEn, setTeacherNameEn] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('+966 54 ');
  const [teacherPassword, setTeacherPassword] = useState(() => generateTeacherPassword());
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [teacherSubject, setTeacherSubject] = useState('الرياضيات');
  const [teacherClass, setTeacherClass] = useState('الصف الثالث المتوسط - أ');
  const [teacherExp, setTeacherExp] = useState<number>(6);
  const [teacherAvatar, setTeacherAvatar] = useState(
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  );

  // Independent Parent Form State
  const [indParentName, setIndParentName] = useState('');
  const [indParentPhone, setIndParentPhone] = useState('+966 50 ');
  const [indParentEmail, setIndParentEmail] = useState('');
  const [indParentNationalId, setIndParentNationalId] = useState(() => generateParentCivilId());
  const [indParentRelation, setIndParentRelation] = useState('ولي أمر (أب)');
  const [selectedChildrenForIndParent, setSelectedChildrenForIndParent] = useState<string[]>([]);

  // Sample Avatar Presets
  const studentAvatars = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  ];

  const teacherAvatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  ];

  // Submit Student with Automated Parent Account
  const handleCreateStudentWithParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNameAr.trim()) return;

    if (parentMode === 'new' && (!parentNameAr.trim() || !parentPhone.trim())) {
      alert(language === 'ar' ? 'يرجى إدخال اسم ورقم جوال ولي الأمر لإنشاء حسابه' : 'Please provide parent name and mobile number');
      return;
    }

    const result = addStudentWithParent(
      {
        name: studentNameAr,
        nameEn: studentNameEn || studentNameAr,
        nationalId: studentNationalId || `ID-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        password: studentPassword.trim() || generateStudentPassword(),
        className: studentClass,
        classNameEn: studentClass,
        avatar: studentAvatar,
        gpa: Number(studentGpa),
        rankInClass: Math.floor(Math.random() * 5) + 1,
        totalTuitionFee: Number(studentTotalTuition) || 8500,
        paidTuitionFee: Number(studentPaidTuition) || 0,
      },
      {
        isExistingParent: parentMode === 'existing',
        existingParentId: parentMode === 'existing' ? existingParentId : undefined,
        parentName: parentMode === 'new' ? parentNameAr : '',
        parentNameEn: parentMode === 'new' ? parentNameEn || parentNameAr : '',
        parentPhone: parentMode === 'new' ? parentPhone : '',
        parentEmail:
          parentMode === 'new'
            ? parentEmail || `parent.${Date.now()}@rstudy.edu`
            : '',
        parentNationalId: parentMode === 'new' ? (parentNationalId || generateParentCivilId()) : undefined,
        relationship: parentRelationship,
      }
    );

    // Close form and open Credentials success modal
    setIsStudentModalOpen(false);
    setCreatedCredentials({
      student: result.student,
      parent: result.parent,
      isNewParent: result.isNewParent,
    });

    // Reset fields with freshly auto-generated IDs & password
    setStudentNameAr('');
    setStudentNameEn('');
    setStudentNationalId(generateStudentAcademicId());
    setStudentPassword(generateStudentPassword());
    setShowStudentPassword(false);
    setStudentTotalTuition(8500);
    setStudentPaidTuition(0);
    setParentNameAr('');
    setParentNameEn('');
    setParentPhone('+966 50 ');
    setParentEmail('');
    setParentNationalId(generateParentCivilId());
  };

  // Submit Teacher
  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherNameAr.trim() || !teacherEmail.trim()) return;

    const newT = addTeacher({
      name: teacherNameAr,
      nameEn: teacherNameEn || teacherNameAr,
      email: teacherEmail,
      phone: teacherPhone,
      password: teacherPassword.trim() || generateTeacherPassword(),
      subject: teacherSubject,
      subjectEn: teacherSubject,
      classes: [teacherClass],
      avatar: teacherAvatar,
      experienceYears: Number(teacherExp),
    });

    setIsTeacherModalOpen(false);
    setCreatedCredentials({ teacher: newT });

    // Reset
    setTeacherNameAr('');
    setTeacherNameEn('');
    setTeacherEmail('');
    setTeacherPhone('+966 54 ');
    setTeacherPassword(generateTeacherPassword());
    setShowTeacherPassword(false);
  };

  // Submit Independent Parent
  const handleCreateIndependentParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indParentName.trim() || !indParentPhone.trim()) return;

    const newP = addParent({
      name: indParentName,
      nameEn: indParentName,
      email: indParentEmail || `parent.${Date.now()}@rstudy.edu`,
      phone: indParentPhone,
      nationalId: indParentNationalId || generateParentCivilId(),
      childrenIds: selectedChildrenForIndParent,
      relationship: indParentRelation,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    setIsParentModalOpen(false);
    setCreatedCredentials({ parent: newP, isNewParent: true });

    setIndParentName('');
    setIndParentPhone('+966 50 ');
    setIndParentEmail('');
    setIndParentNationalId(generateParentCivilId());
    setSelectedChildrenForIndParent([]);
  };

  // Copy credentials helper
  const copyCredentialsText = () => {
    if (!createdCredentials) return;
    let text = `=== بيانات الحسابات المدرسية المعتمدة ===\n`;
    if (createdCredentials.student) {
      text += `[بيانات حساب الطالب]:\nالاسم: ${createdCredentials.student.name}\nالرقم الأكاديمي / الهوية: ${createdCredentials.student.nationalId}\nالصف: ${createdCredentials.student.className}\nكلمة مرور الطالب لتسليمها له: ${createdCredentials.student.password || 'Std@2026'}\n\n`;
    }
    if (createdCredentials.parent) {
      text += `[بيانات حساب ولي الأمر]:\nالاسم: ${createdCredentials.parent.name}\nالجوال: ${createdCredentials.parent.phone}\nالبريد: ${createdCredentials.parent.email}\nكلمة المرور: ${createdCredentials.parent.password || 'Parent@2026'}\n\n`;
    }
    if (createdCredentials.teacher) {
      text += `[بيانات حساب المعلم]:\nالاسم: ${createdCredentials.teacher.name}\nالمادة: ${createdCredentials.teacher.subject}\nالبريد: ${createdCredentials.teacher.email}\nالجوال: ${createdCredentials.teacher.phone}\nكلمة مرور المعلم للدخول: ${createdCredentials.teacher.password || 'Teach@2026'}\n\n`;
    }
    text += `منظومة Rstudy الذكية - بوابة المدارس والطلاب`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Filter calculations
  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nationalId.includes(searchQuery) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parentPhone.includes(searchQuery)
  );

  const filteredParents = parents.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nationalId && p.nationalId.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-purple-100 text-purple-800 border border-purple-200">
                {language === 'ar' ? 'صلاحية الإدارة المدرسية' : 'Principal Authority'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {teachers.length + students.length + parents.length} {language === 'ar' ? 'حساب نشط' : 'Total Accounts'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t('manageAccountsTab')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {t('accountsSubtitle')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* HERO BUTTON: Create Student + Auto-Link Parent */}
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t('createStudentParentHeroBtn')}</span>
            </button>

            {/* Create Teacher Button */}
            <button
              onClick={() => setIsTeacherModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{t('createTeacherBtn')}</span>
            </button>

            {/* Create Parent Button */}
            <button
              onClick={() => setIsParentModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 transition active:scale-95"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>{t('createParentBtn')}</span>
            </button>

            {/* Print Credentials Slips (Batch) */}
            <button
              onClick={() => setBatchPrintRole('all')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs sm:text-sm border border-indigo-200 transition active:scale-95"
              title={language === 'ar' ? 'طباعة بطاقات بيانات الدخول لجميع المستخدمين' : 'Print all credentials slips'}
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>{language === 'ar' ? 'طباعة بطاقات الدخول' : 'Print Slips'}</span>
            </button>

            {/* Bulk Delete Registered Users */}
            <button
              onClick={() => {
                setBulkDeleteTarget('students');
                setBulkDeleteConfirmText('');
                setIsBulkDeleteModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm border border-rose-200 transition active:scale-95"
              title={language === 'ar' ? 'حذف جماعي لكافة المستخدمين المسجلين مع تحديد النوع' : 'Bulk Delete Users'}
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>{language === 'ar' ? 'حذف جماعي' : 'Bulk Delete'}</span>
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
          {/* Tabs (Draggable on PC & Mobile) */}
          <DraggableScrollContainer className="pb-1 sm:pb-0" wrapperClassName="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold whitespace-nowrap px-2 py-0.5 min-w-max">
              <button
                onClick={() => setActiveAccountTab('all')}
                className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                  activeAccountTab === 'all'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t('allAccounts')} ({teachers.length + students.length + parents.length})
              </button>
              <button
                onClick={() => setActiveAccountTab('students')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  activeAccountTab === 'students'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('studentsCountLabel')} ({students.length})</span>
              </button>
              <button
                onClick={() => setActiveAccountTab('teachers')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  activeAccountTab === 'teachers'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{t('teachersCountLabel')} ({teachers.length})</span>
              </button>
              <button
                onClick={() => setActiveAccountTab('parents')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  activeAccountTab === 'parents'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('parentsCountLabel')} ({parents.length})</span>
              </button>
            </div>
          </DraggableScrollContainer>

          {/* Search Field */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث بالاسم، الهوية، الجوال، المادة...' : 'Search name, ID, phone, subject...'}
              className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>
      </div>

      {/* SECTION: STUDENTS LISTING */}
      {(activeAccountTab === 'all' || activeAccountTab === 'students') && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {language === 'ar' ? 'سجل حسابات الطلاب والربط العائلي' : 'Student Accounts & Family Links'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'ar'
                    ? 'كافة الطلاب مرتبطون تلقائياً بأولياء أمورهم المسجلين لمتابعة الأداء الأكاديمي والغياب'
                    : 'All students are linked with parent accounts to monitor performance and attendance'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {filteredStudents.length} {t('studentRole')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">{t('studentRole')}</th>
                  <th className="py-3 px-3">{t('studentNationalId')}</th>
                  <th className="py-3 px-3">{t('class')}</th>
                  <th className="py-3 px-3">{t('gpa')}</th>
                  <th className="py-3 px-3 text-purple-700">{language === 'ar' ? 'ولي الأمر المرتبط آلياً' : 'Linked Parent'}</th>
                  <th className="py-3 px-3">{t('parentPhone')}</th>
                  <th className="py-3 px-3 text-emerald-800">{language === 'ar' ? 'الرسوم المسددة للمدرسة' : 'Tuition Paid'}</th>
                  <th className="py-3 px-3 text-center">{language === 'ar' ? 'إجراءات الحساب' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((std) => {
                  const total = std.totalTuitionFee ?? 8500;
                  const paid = std.paidTuitionFee ?? 0;
                  const remaining = Math.max(0, total - paid);
                  const isPaidInFull = paid >= total;
                  const isPartial = paid > 0 && paid < total;

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={std.avatar}
                            alt={std.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <strong className="block text-slate-900 font-bold text-xs">
                              {language === 'ar' ? std.name : std.nameEn || std.name}
                            </strong>
                            <span className="text-[10px] text-slate-400 font-mono">{std.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-slate-700 font-bold block">{std.nationalId}</span>
                        <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1 mt-0.5">
                          <Key className="w-2.5 h-2.5 text-emerald-600" />
                          {std.password || 'Std@2026'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{std.className}</td>
                      <td className="py-3 px-3">
                        <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          %{std.gpa}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                          <LinkIcon className="w-3 h-3 text-purple-600" />
                          <span>{std.parentName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{std.parentPhone}</td>
                      <td className="py-3 px-3">
                        <div className="space-y-1 min-w-[145px]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">{language === 'ar' ? 'المسدد:' : 'Paid:'}</span>
                            <span className="font-mono font-bold text-emerald-700">${paid.toLocaleString()} {language === 'ar' ? 'دولار' : 'USD'}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{language === 'ar' ? 'المتبقي:' : 'Balance:'}</span>
                            <span className={`font-mono font-bold ${remaining > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                              ${remaining.toLocaleString()} {language === 'ar' ? 'دولار' : 'USD'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${isPaidInFull ? 'bg-emerald-500' : isPartial ? 'bg-amber-500' : 'bg-slate-300'}`}
                              style={{ width: `${Math.min(100, (paid / (total || 1)) * 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between pt-0.5">
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                              isPaidInFull
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isPartial
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {isPaidInFull ? (language === 'ar' ? 'مسدد بالكامل' : 'Paid in Full') : isPartial ? (language === 'ar' ? 'سداد جزئي' : 'Partial') : (language === 'ar' ? 'غير مسدد' : 'Unpaid')}
                            </span>
                            <button
                              onClick={() => {
                                setEditingTuitionStudent(std);
                                setTuitionPaidInput(paid);
                                setTuitionTotalInput(total);
                              }}
                              className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 transition"
                              title={language === 'ar' ? 'تعديل أو تسجيل مبلغ السداد للمدرسة' : 'Edit School Payment'}
                            >
                              <Wallet className="w-2.5 h-2.5" />
                              <span>{language === 'ar' ? 'تعديل السداد' : 'Edit Fee'}</span>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Edit Student Info & Password */}
                          <button
                            onClick={() => {
                              setEditingStudent(std);
                              setEditStudentNameAr(std.name);
                              setEditStudentNameEn(std.nameEn || std.name);
                              setEditStudentNationalId(std.nationalId);
                              setEditStudentPassword(std.password || 'Std@2026');
                              setShowEditStudentPassword(false);
                              setEditStudentClass(std.className);
                              setEditStudentGpa(std.gpa ?? 95);
                              setEditStudentTotalTuition(std.totalTuitionFee ?? 2500);
                              setEditStudentPaidTuition(std.paidTuitionFee ?? 0);
                              setEditStudentAvatar(std.avatar || '');
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition active:scale-95"
                            title={language === 'ar' ? 'تعديل بيانات الطالب وكلمة المرور' : 'Edit Student & Password'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Credentials Slip */}
                          <button
                            onClick={() => {
                              setPrintingSlip({
                                role: 'student',
                                id: std.id,
                                name: std.name,
                                username: std.nationalId,
                                password: std.password || 'Std@2026',
                                className: std.className,
                                phone: std.parentPhone,
                                avatar: std.avatar,
                              });
                            }}
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition active:scale-95"
                            title={language === 'ar' ? 'طباعة بطاقة تسليم بيانات الدخول (اليوزر والباسورد)' : 'Print Login Credentials Slip'}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Safe Delete with In-App Modal */}
                          <button
                            onClick={() => setDeletingStudent(std)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-700 transition active:scale-95"
                            title={t('delete')}
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
        </div>
      )}

      {/* SECTION: PARENTS LISTING */}
      {(activeAccountTab === 'all' || activeAccountTab === 'parents') && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {language === 'ar' ? 'سجل حسابات أولياء الأمور (الأهل)' : 'Parent Accounts Registry'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'ar'
                    ? 'يتمتع كل ولي أمر بصلاحية متابعة أبنائه المرتبطين، تقديم الأعذار، واستلام إشعارات الحضور والواجبات'
                    : 'Each parent can monitor their linked children, request excuses, and receive alerts'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {filteredParents.length} {t('parentRole')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParents.map((parent) => {
              const linkedStudentsList = students.filter(
                (s) => parent.childrenIds?.includes(s.id) || s.parentId === parent.id
              );
              return (
                <div
                  key={parent.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-amber-400 hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={parent.avatar}
                        alt={parent.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <strong className="block text-slate-900 font-bold text-sm">
                          {parent.name}
                        </strong>
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-100/70 px-1.5 py-0.5 rounded">
                          {parent.relationship || (language === 'ar' ? 'ولي أمر' : 'Parent')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeletingParent(parent)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition active:scale-95"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-1 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{t('phone')}:</span>
                      </span>
                      <span className="font-mono font-bold text-slate-800">{parent.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{t('email')}:</span>
                      </span>
                      <span className="font-mono text-blue-700 truncate max-w-[150px]">{parent.email}</span>
                    </div>
                  </div>

                  {/* Linked Children Badges */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">
                      {t('linkedChildren')} ({linkedStudentsList.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {linkedStudentsList.length > 0 ? (
                        linkedStudentsList.map((ch) => (
                          <span
                            key={ch.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-bold"
                          >
                            <LinkIcon className="w-2.5 h-2.5 text-purple-500" />
                            <span>{language === 'ar' ? ch.name : ch.nameEn || ch.name}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          {language === 'ar' ? 'لا يوجد طلاب مرتبطون حالياً' : 'No children linked yet'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: TEACHERS LISTING */}
      {(activeAccountTab === 'all' || activeAccountTab === 'teachers') && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  {language === 'ar' ? 'سجل حسابات الكادر التعليمي (المعلمون)' : 'Teacher Accounts Registry'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'ar'
                    ? 'المعلمون يمتلكون صلاحية نشر الدرجات، إرسال وتصحيح الواجبات، ورصد الحضور والغياب اليومي'
                    : 'Teachers have privileges to grade exams, assign homework, and record daily attendance'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {filteredTeachers.length} {t('teacherRole')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTeachers.map((tch) => (
              <div
                key={tch.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-400 hover:shadow-md transition space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between">
                  <img
                    src={tch.avatar}
                    alt={tch.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                  />
                  <div className="flex items-center gap-1">
                    {/* Edit Teacher Info & Password */}
                    <button
                      onClick={() => {
                        setEditingTeacher(tch);
                        setEditTeacherNameAr(tch.name);
                        setEditTeacherNameEn(tch.nameEn || tch.name);
                        setEditTeacherEmail(tch.email);
                        setEditTeacherPhone(tch.phone);
                        setEditTeacherPassword(tch.password || 'Teach@2026');
                        setShowEditTeacherPassword(false);
                        setEditTeacherSubject(tch.subject);
                        setEditTeacherClass(tch.classes?.[0] || 'الصف الثالث المتوسط - أ');
                        setEditTeacherExp(tch.experienceYears);
                        setEditTeacherAvatar(tch.avatar || '');
                      }}
                      className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition active:scale-95"
                      title={language === 'ar' ? 'تعديل بيانات المعلم وكلمة المرور' : 'Edit Teacher & Password'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Print Credentials Slip */}
                    <button
                      onClick={() => {
                        setPrintingSlip({
                          role: 'teacher',
                          id: tch.id,
                          name: tch.name,
                          username: tch.email,
                          password: tch.password || 'Teach@2026',
                          subject: tch.subject,
                          className: tch.classes?.join(', '),
                          phone: tch.phone,
                          avatar: tch.avatar,
                        });
                      }}
                      className="p-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition active:scale-95"
                      title={language === 'ar' ? 'طباعة بطاقة تسليم بيانات الدخول للمعلم' : 'Print Teacher Credentials Slip'}
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    {/* Safe Delete Teacher */}
                    <button
                      onClick={() => setDeletingTeacher(tch)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition active:scale-95"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-slate-900 text-sm">
                    {language === 'ar' ? tch.name : tch.nameEn || tch.name}
                  </h4>
                  <p className="text-emerald-700 font-bold mt-0.5">{tch.subject}</p>
                </div>

                <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t('experience')}:</span>
                    <span className="font-bold">{tch.experienceYears} {language === 'ar' ? 'سنوات' : 'years'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t('phone')}:</span>
                    <span className="font-mono text-slate-800">{tch.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t('email')}:</span>
                    <span className="font-mono text-blue-700 truncate max-w-[130px]">{tch.email}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Key className="w-3 h-3 text-emerald-600" />
                      {language === 'ar' ? 'كلمة المرور:' : 'Password:'}
                    </span>
                    <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px] font-bold select-all">
                      {tch.password || 'Teach@2026'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE STUDENT WITH AUTOMATED PARENT PROVISIONING */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    {language === 'ar'
                      ? 'إنشاء حساب طالب جديد + توليد حساب ولي الأمر تلقائياً'
                      : 'Create Student Account & Auto-Link Parent'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar'
                      ? 'يتم جمع بيانات ولي الأمر آلياً وإنشاء حسابه وربطه فورياً لمتابعة الابن'
                      : 'Parent information is gathered to auto-create credentials and link to the student profile'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudentWithParent} className="space-y-5 text-xs">
              {/* SECTION 1: STUDENT DETAILS */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center gap-1.5 text-blue-900 font-black text-xs pb-1 border-b border-blue-200/50">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{t('studentInfoSection')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {t('studentRole')} (عربي) *:
                    </label>
                    <input
                      type="text"
                      required
                      value={studentNameAr}
                      onChange={(e) => setStudentNameAr(e.target.value)}
                      placeholder="مثال: زياد بن سلطان الشمري"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {t('studentRole')} (English):
                    </label>
                    <input
                      type="text"
                      value={studentNameEn}
                      onChange={(e) => setStudentNameEn(e.target.value)}
                      placeholder="e.g. Ziyad Al-Shammari"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 text-xs">
                        {language === 'ar' ? 'الرقم الأكاديمي للطالب *:' : 'Student Academic ID *:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setStudentNationalId(generateStudentAcademicId())}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline"
                        title={language === 'ar' ? 'توليد رقم أكاديمي جديد' : 'Generate New ID'}
                      >
                        ↺ {language === 'ar' ? 'تجديد' : 'Regenerate'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={studentNationalId}
                        onChange={(e) => setStudentNationalId(e.target.value)}
                        placeholder="2026XXXXXX"
                        className="w-full px-3 py-2 rounded-xl border border-blue-300 font-mono font-bold text-blue-900 bg-blue-50/50 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute left-2 rtl:left-auto rtl:right-2 top-2.5 text-[9px] font-black text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded pointer-events-none hidden sm:inline">
                        {language === 'ar' ? 'توليد تلقائي' : 'Auto'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t('class')} *:</label>
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
                    >
                      <option value="الصف الثالث المتوسط - أ">الصف الثالث المتوسط - أ</option>
                      <option value="الصف الثالث المتوسط - ب">الصف الثالث المتوسط - ب</option>
                      <option value="الصف الثاني المتوسط - أ">الصف الثاني المتوسط - أ</option>
                      <option value="الصف الأول المتوسط - أ">الصف الأول المتوسط - أ</option>
                      <option value="الصف الأول الثانوي - علمي">الصف الأول الثانوي - علمي</option>
                      <option value="الصف الثاني الثانوي - مسار تقني">الصف الثاني الثانوي - مسار تقني</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t('gpa')} المبدئي (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      min="50"
                      max="100"
                      value={studentGpa}
                      onChange={(e) => setStudentGpa(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
                    />
                  </div>
                </div>

                {/* Auto-Generated Student Password */}
                <div className="pt-2 border-t border-blue-200/50">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 text-xs flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'ar' ? 'كلمة المرور التلقائية للطالب (إنشاء تلقائي لتسليمها له) *:' : 'Auto Student Password (to give to student) *:'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setStudentPassword(generateStudentPassword())}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline flex items-center gap-1"
                      title={language === 'ar' ? 'توليد كلمة مرور جديدة' : 'Generate New Password'}
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>{language === 'ar' ? 'توليد جديد' : 'Regenerate'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showStudentPassword ? 'text' : 'password'}
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Std@XXXX"
                      className="w-full px-3 py-2 pl-8 rtl:pl-3 rtl:pr-8 rounded-xl border border-emerald-300 font-mono font-bold text-emerald-900 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentPassword(!showStudentPassword)}
                      className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      title={showStudentPassword ? 'إخفاء' : 'إظهار'}
                    >
                      {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {language === 'ar'
                      ? 'يتم توليد كلمة المرور تلقائياً بواسطة مدير المنشأة ليتم تسليمها للطالب للدخول لحسابه'
                      : 'Password is automatically created by the admin to give to the student for portal login'}
                  </p>
                </div>

                {/* Tuition & Payment Setup (in USD) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-blue-200/50">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'إجمالي الرسوم الدراسية بالدولار ($) *:' : 'Total Tuition Fee ($ USD) *:'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={studentTotalTuition}
                        onChange={(e) => setStudentTotalTuition(Number(e.target.value))}
                        className="w-full px-3 py-2 pl-7 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'المبلغ المسدد مقدماً بالدولار ($):' : 'Prepaid Tuition ($ USD):'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-600 text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={studentPaidTuition}
                        onChange={(e) => setStudentPaidTuition(Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 pl-7 rounded-xl border border-emerald-300 font-mono font-bold text-emerald-800 bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Avatar selection */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'الصورة الرمزية للطالب:' : 'Student Avatar:'}
                  </label>
                  <div className="flex items-center gap-3">
                    {studentAvatars.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setStudentAvatar(av)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition ${
                          studentAvatar === av ? 'border-blue-600 scale-110 shadow-md ring-2 ring-blue-300' : 'border-slate-200 opacity-60'
                        }`}
                      >
                        <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 2: AUTOMATIC PARENT DETAILS */}
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-purple-200/50">
                  <div className="flex items-center gap-1.5 text-purple-900 font-black text-xs">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>{t('parentInfoAutoSection')}</span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    {language === 'ar' ? 'ربط تلقائي ذكي' : 'Auto-Provisioned Link'}
                  </span>
                </div>

                {/* Parent Mode Radio */}
                <div className="flex items-center gap-4 text-xs font-bold text-slate-700 py-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="parentMode"
                      checked={parentMode === 'new'}
                      onChange={() => setParentMode('new')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>{t('createNewParentOption')}</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="parentMode"
                      checked={parentMode === 'existing'}
                      onChange={() => setParentMode('existing')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>{t('linkToExistingParentOption')}</span>
                  </label>
                </div>

                {parentMode === 'new' ? (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          {t('parentRole')} (عربي) *:
                        </label>
                        <input
                          type="text"
                          required
                          value={parentNameAr}
                          onChange={(e) => setParentNameAr(e.target.value)}
                          placeholder="مثال: سلطان بن عبدالمحسن الشمري"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          {t('parentRelationship')}:
                        </label>
                        <select
                          value={parentRelationship}
                          onChange={(e) => setParentRelationship(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
                        >
                          <option value="ولي أمر (أب)">ولي أمر (أب)</option>
                          <option value="ولي أمر (أم)">ولي أمر (أم)</option>
                          <option value="وصي قانوني / كفيل">وصي قانوني / كفيل</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          {t('parentPhone')} *:
                        </label>
                        <input
                          type="text"
                          required
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          placeholder="+966 50 XXX XXXX"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          {t('parentEmail')}:
                        </label>
                        <input
                          type="email"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          placeholder="parent@example.com"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-white"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-bold text-slate-700">
                            {t('parentNationalId')}:
                          </label>
                          <button
                            type="button"
                            onClick={() => setParentNationalId(generateParentCivilId())}
                            className="text-[10px] text-purple-700 hover:text-purple-900 font-bold underline"
                          >
                            ↺ {language === 'ar' ? 'توليد تلقائي' : 'Regenerate'}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={parentNationalId}
                          onChange={(e) => setParentNationalId(e.target.value)}
                          placeholder="10XXXXXXXX"
                          className="w-full px-3 py-2 rounded-xl border border-purple-200 font-mono font-bold text-purple-950 bg-purple-50/50"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-purple-700 bg-purple-100/70 p-2.5 rounded-xl border border-purple-200">
                      💡 {language === 'ar'
                        ? 'سيقوم النظام بإنشاء حساب مستقل لولي الأمر، توليد كلمة مرور أولية (Parent@2026)، وربط هذا الطالب بحسابه فوراً.'
                        : 'System will generate a standalone parent profile, assign temporary password (Parent@2026), and link student immediately.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <label className="block font-bold text-slate-700 mb-1">
                      {t('selectExistingParent')} *:
                    </label>
                    <select
                      value={existingParentId}
                      onChange={(e) => setExistingParentId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold bg-white text-xs"
                    >
                      {parents.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.relationship || 'ولي أمر'}) — هاتف: {p.phone}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500">
                      {language === 'ar'
                        ? 'سيتم إضافة هذا الطالب الجديد مباشرة إلى قائمة أبناء ولي الأمر المحدد دون الحاجة لبيانات إضافية.'
                        : 'This new student will be appended to the selected parent’s children list.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-black shadow-md transition"
                >
                  {language === 'ar' ? 'حفظ وإنشاء الحسابين والربط التلقائي' : 'Save & Provision Accounts'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE TEACHER */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{t('createTeacherBtn')}</h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'توليد حساب معلم جديد مع إسناد المادة والفصل' : 'Create new teacher profile'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsTeacherModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('teacherRole')} (عربي) *:</label>
                  <input
                    type="text"
                    required
                    value={teacherNameAr}
                    onChange={(e) => setTeacherNameAr(e.target.value)}
                    placeholder="مثال: أ. عبدالمحسن الغامدي"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('teacherRole')} (English):</label>
                  <input
                    type="text"
                    value={teacherNameEn}
                    onChange={(e) => setTeacherNameEn(e.target.value)}
                    placeholder="e.g. Prof. Abdulmohsen Al-Ghamdi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('subject')} *:</label>
                  <select
                    value={teacherSubject}
                    onChange={(e) => setTeacherSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  >
                    <option value="الرياضيات">الرياضيات / Mathematics</option>
                    <option value="العلوم الطبيعية">العلوم الطبيعية / Natural Sciences</option>
                    <option value="اللغة العربية">اللغة العربية / Arabic Language</option>
                    <option value="اللغة الإنجليزية">اللغة الإنجليزية / English Language</option>
                    <option value="الحاسب والذكاء الاصطناعي">الحاسب والذكاء الاصطناعي / Computer Science</option>
                    <option value="الفيزياء">الفيزياء / Physics</option>
                    <option value="التربية الإسلامية">التربية الإسلامية / Islamic Studies</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('class')} المسند *:</label>
                  <select
                    value={teacherClass}
                    onChange={(e) => setTeacherClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  >
                    <option value="الصف الثالث المتوسط - أ">الصف الثالث المتوسط - أ</option>
                    <option value="الصف الثالث المتوسط - ب">الصف الثالث المتوسط - ب</option>
                    <option value="الصف الثاني المتوسط - أ">الصف الثاني المتوسط - أ</option>
                    <option value="الصف الأول المتوسط - أ">الصف الأول المتوسط - أ</option>
                    <option value="الصف الأول الثانوي - علمي">الصف الأول الثانوي - علمي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">{t('email')} *:</label>
                  <input
                    type="email"
                    required
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="teacher@madrasati.edu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('phone')}:</label>
                  <input
                    type="text"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-slate-50"
                  />
                </div>
              </div>

              {/* Auto-Generated Teacher Password */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'ar' ? 'كلمة المرور التلقائية للمعلم (لتسليمها له للدخول) *:' : 'Auto Teacher Password (to give teacher) *:'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setTeacherPassword(generateTeacherPassword())}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-1"
                    title={language === 'ar' ? 'توليد كلمة مرور جديدة' : 'Generate New Password'}
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>{language === 'ar' ? 'توليد جديد' : 'Regenerate'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showTeacherPassword ? 'text' : 'password'}
                    required
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="Tch@XXXX"
                    className="w-full px-3 py-2 pl-8 rtl:pl-3 rtl:pr-8 rounded-xl border border-emerald-300 font-mono font-bold text-emerald-900 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                    className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    title={showTeacherPassword ? 'إخفاء' : 'إظهار'}
                  >
                    {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {language === 'ar'
                    ? 'يتم توليد كلمة المرور تلقائياً بواسطة إدارة المدرسة ليتم تسليمها للمعلم للدخول لبوابته'
                    : 'Password is generated automatically by the school admin to give to the teacher for logging into their account'}
                </p>
              </div>

              {/* Avatar selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'الصورة الرمزية للمعلم:' : 'Teacher Avatar:'}
                </label>
                <div className="flex items-center gap-3">
                  {teacherAvatars.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTeacherAvatar(av)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition ${
                        teacherAvatar === av ? 'border-emerald-600 scale-110 shadow-md ring-2 ring-emerald-300' : 'border-slate-200 opacity-60'
                      }`}
                    >
                      <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md transition"
                >
                  {language === 'ar' ? 'إنشاء حساب المعلم' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE INDEPENDENT PARENT */}
      {isParentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{t('createParentBtn')}</h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'إنشاء حساب ولي أمر وربطه بالطلاب الحاليين' : 'Create parent account'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsParentModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIndependentParent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('parentRole')} *:</label>
                <input
                  type="text"
                  required
                  value={indParentName}
                  onChange={(e) => setIndParentName(e.target.value)}
                  placeholder="مثال: تركي بن عبدالرحمن القاسم"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('phone')} *:</label>
                  <input
                    type="text"
                    required
                    value={indParentPhone}
                    onChange={(e) => setIndParentPhone(e.target.value)}
                    placeholder="+966 50 XXX XXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('parentRelationship')}:</label>
                  <select
                    value={indParentRelation}
                    onChange={(e) => setIndParentRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  >
                    <option value="ولي أمر (أب)">ولي أمر (أب)</option>
                    <option value="ولي أمر (أم)">ولي أمر (أم)</option>
                    <option value="وصي قانوني">وصي قانوني</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('email')}:</label>
                  <input
                    type="email"
                    value={indParentEmail}
                    onChange={(e) => setIndParentEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">{t('parentNationalId')}:</label>
                    <button
                      type="button"
                      onClick={() => setIndParentNationalId(generateParentCivilId())}
                      className="text-[10px] text-amber-700 hover:text-amber-900 font-bold underline"
                    >
                      ↺ {language === 'ar' ? 'توليد تلقائي' : 'Regenerate'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={indParentNationalId}
                    onChange={(e) => setIndParentNationalId(e.target.value)}
                    placeholder="10XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 font-mono font-bold text-amber-950 bg-amber-50/50"
                  />
                </div>
              </div>

              {/* Select Students to link */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'حدد الأبناء / الطلاب المراد ربطهم بحسابه:' : 'Select Students to Link:'}
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-36 overflow-y-auto space-y-1.5">
                  {students.map((std) => (
                    <label key={std.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedChildrenForIndParent.includes(std.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedChildrenForIndParent([...selectedChildrenForIndParent, std.id]);
                          } else {
                            setSelectedChildrenForIndParent(
                              selectedChildrenForIndParent.filter((id) => id !== std.id)
                            );
                          }
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-bold text-slate-900">{std.name}</span>
                      <span className="text-[10px] text-slate-400">({std.className})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsParentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black shadow-md transition"
                >
                  {language === 'ar' ? 'إنشاء حساب ولي الأمر' : 'Create Parent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIALS SUCCESS POPUP MODAL */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {language === 'ar' ? 'تم إنشاء الحسابات والربط بنجاح!' : 'Accounts Provisioned & Linked Successfully!'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t('accountCredentialsNotice')}
              </p>
            </div>

            {/* Student Card */}
            {createdCredentials.student && (
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{language === 'ar' ? 'بيانات حساب الطالب المعتمد' : 'Student Account'}</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">{t('name')}:</span>
                    <strong className="text-slate-900">{createdCredentials.student.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('studentNationalId')}:</span>
                    <strong className="font-mono text-slate-900">{createdCredentials.student.nationalId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('class')}:</span>
                    <span className="text-slate-700">{createdCredentials.student.className}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('code')}:</span>
                    <span className="font-mono text-blue-800">{createdCredentials.student.id}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between bg-white/70 p-2 rounded-xl">
                  <span className="text-slate-700 font-bold flex items-center gap-1 text-[11px]">
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'ar' ? 'كلمة مرور الطالب لتسليمها له للدخول:' : 'Student Password (to give student):'}</span>
                  </span>
                  <span className="font-mono font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 text-xs select-all">
                    {createdCredentials.student.password || 'Std@2026'}
                  </span>
                </div>
              </div>
            )}

            {/* Parent Card */}
            {createdCredentials.parent && (
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>
                      {language === 'ar'
                        ? 'بيانات حساب ولي الأمر (الربط التلقائي)'
                        : 'Auto-Linked Parent Account'}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">{t('parentRole')}:</span>
                    <strong className="text-slate-900">{createdCredentials.parent.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('phone')}:</span>
                    <strong className="font-mono text-slate-900">{createdCredentials.parent.phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('email')}:</span>
                    <span className="font-mono text-blue-700">{createdCredentials.parent.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{language === 'ar' ? 'كلمة مرور ولي الأمر:' : 'Parent Password:'}</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs inline-block select-all">
                      {createdCredentials.parent.password || 'Parent@2026'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Teacher Card */}
            {createdCredentials.teacher && (
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'ar' ? 'بيانات حساب المعلم' : 'Teacher Account'}</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">{t('name')}:</span>
                    <strong className="text-slate-900">{createdCredentials.teacher.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('subject')}:</span>
                    <strong className="text-emerald-800">{createdCredentials.teacher.subject}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('email')}:</span>
                    <span className="font-mono text-blue-700">{createdCredentials.teacher.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('phone')}:</span>
                    <span className="font-mono text-slate-800">{createdCredentials.teacher.phone}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between bg-white/70 p-2 rounded-xl">
                  <span className="text-slate-700 font-bold flex items-center gap-1 text-[11px]">
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'ar' ? 'كلمة مرور المعلم لتسليمها له للدخول:' : 'Teacher Password (to give teacher):'}</span>
                  </span>
                  <span className="font-mono font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 text-xs select-all">
                    {createdCredentials.teacher.password || 'Teach@2026'}
                  </span>
                </div>
              </div>
            )}

            {/* Actions: Copy & Close */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={copyCredentialsText}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? t('credentialsCopied') : t('copyCredentials')}</span>
              </button>

              <button
                onClick={() => setCreatedCredentials(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT STUDENT TUITION / RECORD PAYMENT */}
      {editingTuitionStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {language === 'ar' ? 'تسجيل وتعديل سداد الرسوم المدرسية' : 'Update Student Tuition Payment'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'المبلغ المدخل يظهر مباشرة في حساب الطالب وبوابة ولي الأمر' : 'Live sync with student & parent portals'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTuitionStudent(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student card info */}
            <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
              <img
                src={editingTuitionStudent.avatar}
                alt={editingTuitionStudent.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <div className="font-black text-slate-900 text-sm">
                  {language === 'ar' ? editingTuitionStudent.name : editingTuitionStudent.nameEn || editingTuitionStudent.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {editingTuitionStudent.nationalId} | {editingTuitionStudent.className}
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateStudentTuitionFee(editingTuitionStudent.id, Number(tuitionPaidInput), Number(tuitionTotalInput));
                setEditingTuitionStudent(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'إجمالي الرسوم الدراسية المقررة بالدولار ($):' : 'Total Required Tuition ($ USD):'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={tuitionTotalInput}
                    onChange={(e) => setTuitionTotalInput(Number(e.target.value))}
                    className="w-full px-3 py-2 pl-7 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{language === 'ar' ? 'المبلغ الذي تم تسديده للمدرسة بالدولار ($) *:' : 'Amount Paid to School ($ USD) *:'}</span>
                  <span className="text-emerald-700 font-normal text-[11px]">
                    {language === 'ar' ? 'المدفوع الفعلي بالدولار' : 'Actual Paid in USD'}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-emerald-700 text-base">$</span>
                  <input
                    type="number"
                    min="0"
                    max={tuitionTotalInput * 1.5}
                    step="25"
                    required
                    value={tuitionPaidInput}
                    onChange={(e) => setTuitionPaidInput(Number(e.target.value))}
                    className="w-full px-3 py-2 pl-8 rounded-xl border-2 border-emerald-500 font-mono font-black text-emerald-800 bg-emerald-50/30 text-base focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Quick balance calculation */}
              <div className="p-3 rounded-xl bg-slate-100 flex items-center justify-between font-bold text-xs">
                <span className="text-slate-600">{language === 'ar' ? 'المبلغ المتبقي على الطالب:' : 'Remaining Balance:'}</span>
                <span className={`font-mono text-sm ${Math.max(0, tuitionTotalInput - tuitionPaidInput) > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  ${Math.max(0, tuitionTotalInput - tuitionPaidInput).toLocaleString()}{' '}
                  <span className="text-xs">{language === 'ar' ? 'دولار' : 'USD'}</span>
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTuitionPaidInput(tuitionTotalInput)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] transition"
                >
                  {language === 'ar' ? 'تسديد كامل (100%)' : 'Full Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => setTuitionPaidInput(Math.round(tuitionTotalInput / 2))}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-[11px] transition"
                >
                  {language === 'ar' ? 'تسديد 50%' : '50% Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => setTuitionPaidInput(0)}
                  className="py-1.5 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] transition"
                >
                  0
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTuitionStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md transition"
                >
                  {language === 'ar' ? 'حفظ وتحديث السداد' : 'Save & Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT STUDENT & PASSWORD */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    {language === 'ar' ? 'تعديل بيانات الطالب وكلمة المرور' : 'Edit Student Info & Password'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'تحديث الاسم، الصف، الرسوم، أو تعيين كلمة مرور جديدة لحساب الطالب' : 'Update credentials, grade, tuition, or password'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateStudent(editingStudent.id, {
                  name: editStudentNameAr,
                  nameEn: editStudentNameEn || editStudentNameAr,
                  nationalId: editStudentNationalId,
                  password: editStudentPassword.trim() || 'Std@2026',
                  className: editStudentClass,
                  classNameEn: editStudentClass,
                  gpa: Number(editStudentGpa),
                  totalTuitionFee: Number(editStudentTotalTuition),
                  paidTuitionFee: Number(editStudentPaidTuition),
                  avatar: editStudentAvatar || editingStudent.avatar,
                });
                setEditingStudent(null);
                showToast(language === 'ar' ? 'تم حفظ تعديلات بيانات الطالب بنجاح' : 'Student updated successfully');
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('studentRole')} (عربي) *:
                  </label>
                  <input
                    type="text"
                    required
                    value={editStudentNameAr}
                    onChange={(e) => setEditStudentNameAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('studentRole')} (English):
                  </label>
                  <input
                    type="text"
                    value={editStudentNameEn}
                    onChange={(e) => setEditStudentNameEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'الرقم الأكاديمي / الهوية *:' : 'Academic ID / Username *:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editStudentNationalId}
                    onChange={(e) => setEditStudentNationalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 font-mono font-bold text-blue-900 bg-blue-50/50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('class')} *:</label>
                  <select
                    value={editStudentClass}
                    onChange={(e) => setEditStudentClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  >
                    <option value="الصف الثالث المتوسط - أ">الصف الثالث المتوسط - أ</option>
                    <option value="الصف الثالث المتوسط - ب">الصف الثالث المتوسط - ب</option>
                    <option value="الصف الثاني المتوسط - أ">الصف الثاني المتوسط - أ</option>
                    <option value="الصف الأول المتوسط - أ">الصف الأول المتوسط - أ</option>
                    <option value="الصف الأول الثانوي - علمي">الصف الأول الثانوي - علمي</option>
                    <option value="الصف الثاني الثانوي - مسار تقني">الصف الثاني الثانوي - مسار تقني</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('gpa')} (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="100"
                    value={editStudentGpa}
                    onChange={(e) => setEditStudentGpa(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  />
                </div>
              </div>

              {/* Password Editing */}
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'ar' ? 'تعيين أو تغيير كلمة مرور الطالب للدخول *:' : 'Student Portal Password *:'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditStudentPassword(generateStudentPassword())}
                    className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold underline flex items-center gap-1"
                    title={language === 'ar' ? 'توليد كلمة مرور جديدة' : 'Generate New Password'}
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>{language === 'ar' ? 'توليد كلمة سر جديدة' : 'Auto-Generate'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditStudentPassword ? 'text' : 'password'}
                    required
                    value={editStudentPassword}
                    onChange={(e) => setEditStudentPassword(e.target.value)}
                    className="w-full px-3 py-2 pl-8 rtl:pl-3 rtl:pr-8 rounded-xl border border-emerald-300 font-mono font-bold text-emerald-900 bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditStudentPassword(!showEditStudentPassword)}
                    className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showEditStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  {language === 'ar'
                    ? 'يستطيع مدير المدرسة تعديل كلمة المرور أو إعادة تعيينها وتسليمها للطالب للدخول'
                    : 'The principal can set a new password or auto-generate one for the student'}
                </p>
              </div>

              {/* Tuition Fees in USD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'إجمالي الرسوم بالدولار ($):' : 'Total Tuition ($ USD):'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editStudentTotalTuition}
                    onChange={(e) => setEditStudentTotalTuition(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-mono font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'المبلغ المسدد بالدولار ($):' : 'Paid Tuition ($ USD):'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editStudentPaidTuition}
                    onChange={(e) => setEditStudentPaidTuition(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 font-mono font-bold text-emerald-800 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition"
                >
                  {language === 'ar' ? 'حفظ تعديلات الطالب' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: EDIT TEACHER & PASSWORD */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    {language === 'ar' ? 'تعديل بيانات المعلم وكلمة المرور' : 'Edit Teacher Info & Password'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'تعديل اسم المعلم، المادة، الفصل المسند، وكلمة المرور للدخول' : 'Update teacher details, subject, classes, and password'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateTeacher(editingTeacher.id, {
                  name: editTeacherNameAr,
                  nameEn: editTeacherNameEn || editTeacherNameAr,
                  email: editTeacherEmail,
                  phone: editTeacherPhone,
                  password: editTeacherPassword.trim() || 'Teach@2026',
                  subject: editTeacherSubject,
                  classes: [editTeacherClass],
                  experienceYears: Number(editTeacherExp),
                  avatar: editTeacherAvatar || editingTeacher.avatar,
                });
                setEditingTeacher(null);
                showToast(language === 'ar' ? 'تم حفظ تعديلات بيانات المعلم بنجاح' : 'Teacher updated successfully');
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('teacherRole')} (عربي) *:</label>
                  <input
                    type="text"
                    required
                    value={editTeacherNameAr}
                    onChange={(e) => setEditTeacherNameAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('teacherRole')} (English):</label>
                  <input
                    type="text"
                    value={editTeacherNameEn}
                    onChange={(e) => setEditTeacherNameEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('subject')} *:</label>
                  <select
                    value={editTeacherSubject}
                    onChange={(e) => setEditTeacherSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  >
                    <option value="الرياضيات">الرياضيات / Mathematics</option>
                    <option value="العلوم الطبيعية">العلوم الطبيعية / Natural Sciences</option>
                    <option value="اللغة العربية">اللغة العربية / Arabic Language</option>
                    <option value="اللغة الإنجليزية">اللغة الإنجليزية / English Language</option>
                    <option value="الحاسب والذكاء الاصطناعي">الحاسب والذكاء الاصطناعي / Computer Science</option>
                    <option value="الفيزياء">الفيزياء / Physics</option>
                    <option value="التربية الإسلامية">التربية الإسلامية / Islamic Studies</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('class')} المسند *:</label>
                  <select
                    value={editTeacherClass}
                    onChange={(e) => setEditTeacherClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  >
                    <option value="الصف الثالث المتوسط - أ">الصف الثالث المتوسط - أ</option>
                    <option value="الصف الثالث المتوسط - ب">الصف الثالث المتوسط - ب</option>
                    <option value="الصف الثاني المتوسط - أ">الصف الثاني المتوسط - أ</option>
                    <option value="الصف الأول المتوسط - أ">الصف الأول المتوسط - أ</option>
                    <option value="الصف الأول الثانوي - علمي">الصف الأول الثانوي - علمي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">{t('email')} *:</label>
                  <input
                    type="email"
                    required
                    value={editTeacherEmail}
                    onChange={(e) => setEditTeacherEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('phone')}:</label>
                  <input
                    type="text"
                    value={editTeacherPhone}
                    onChange={(e) => setEditTeacherPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-slate-50"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'ar' ? 'تعيين أو تغيير كلمة مرور المعلم للدخول *:' : 'Teacher Portal Password *:'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditTeacherPassword(generateTeacherPassword())}
                    className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold underline flex items-center gap-1"
                    title={language === 'ar' ? 'توليد كلمة مرور جديدة' : 'Generate New Password'}
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>{language === 'ar' ? 'توليد كلمة سر جديدة' : 'Auto-Generate'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showEditTeacherPassword ? 'text' : 'password'}
                    required
                    value={editTeacherPassword}
                    onChange={(e) => setEditTeacherPassword(e.target.value)}
                    className="w-full px-3 py-2 pl-8 rtl:pl-3 rtl:pr-8 rounded-xl border border-emerald-300 font-mono font-bold text-emerald-900 bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditTeacherPassword(!showEditTeacherPassword)}
                    className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showEditTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  {language === 'ar'
                    ? 'يتم تسليم هذه الكلمة للمعلم للدخول لحسابه واستخدام بوابته التعليمية'
                    : 'Provide this password to the teacher for portal sign in'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition"
                >
                  {language === 'ar' ? 'حفظ تعديلات المعلم' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: BULK DELETE REGISTERED USERS */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-rose-200 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-black text-slate-900 text-lg">
                {language === 'ar' ? 'الحذف الشامل للحسابات المسجلة' : 'Bulk Delete Registered Accounts'}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {language === 'ar'
                  ? 'اختر نوع الحسابات التي ترغب في حذفها نهائياً من قاعدة بيانات هذه المدرسة:'
                  : 'Select which account types to permanently purge from this school database:'}
              </p>
            </div>

            {/* Target Selector */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setBulkDeleteTarget('students')}
                className={`p-3 rounded-2xl border text-center transition ${
                  bulkDeleteTarget === 'students'
                    ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-300'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Users className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="font-bold text-xs block text-slate-900">
                  {language === 'ar' ? 'الطلاب فقط' : 'Students Only'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">({students.length} طالب)</span>
              </button>

              <button
                type="button"
                onClick={() => setBulkDeleteTarget('teachers')}
                className={`p-3 rounded-2xl border text-center transition ${
                  bulkDeleteTarget === 'teachers'
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-300'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <span className="font-bold text-xs block text-slate-900">
                  {language === 'ar' ? 'المعلمون فقط' : 'Teachers Only'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">({teachers.length} معلم)</span>
              </button>

              <button
                type="button"
                onClick={() => setBulkDeleteTarget('all')}
                className={`p-3 rounded-2xl border text-center transition ${
                  bulkDeleteTarget === 'all'
                    ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-300'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Trash2 className="w-5 h-5 mx-auto mb-1 text-rose-600" />
                <span className="font-bold text-xs block text-rose-900">
                  {language === 'ar' ? 'الجميع (الكل)' : 'All Accounts'}
                </span>
                <span className="text-[10px] text-rose-600 font-mono">
                  ({students.length + teachers.length + parents.length})
                </span>
              </button>
            </div>

            {/* Warning Box */}
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{language === 'ar' ? 'تحذير أمني صارم:' : 'Security Warning:'}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {bulkDeleteTarget === 'students' && (language === 'ar' ? `سيتم حذف جميع حسابات الطلاب (${students.length}) نهائياً من قاعدة البيانات والتخزين السحابي.` : `All ${students.length} student accounts will be deleted.`)}
                {bulkDeleteTarget === 'teachers' && (language === 'ar' ? `سيتم حذف جميع حسابات المعلمين (${teachers.length}) نهائياً من قاعدة البيانات والتخزين السحابي.` : `All ${teachers.length} teacher accounts will be deleted.`)}
                {bulkDeleteTarget === 'all' && (language === 'ar' ? `سيتم حذف كافة حسابات الطلاب والمعلمين وأولياء الأمور نهائياً (${students.length + teachers.length + parents.length} حساب).` : `All registered users will be permanently purged.`)}
              </p>
            </div>

            {/* Confirmation typing requirement */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                {language === 'ar' ? 'للتأكيد، اكتب كلمة "حذف" في الحقل أدناه:' : 'Type "DELETE" to confirm:'}
              </label>
              <input
                type="text"
                value={bulkDeleteConfirmText}
                onChange={(e) => setBulkDeleteConfirmText(e.target.value)}
                placeholder={language === 'ar' ? 'حذف' : 'DELETE'}
                className="w-full px-3 py-2 rounded-xl border border-rose-300 font-bold text-center text-rose-950 bg-rose-50/30 focus:ring-2 focus:ring-rose-500 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={bulkDeleteConfirmText.trim() !== 'حذف' && bulkDeleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                onClick={() => {
                  bulkDeleteAccounts(bulkDeleteTarget);
                  setIsBulkDeleteModalOpen(false);
                  showToast(language === 'ar' ? 'تم تنفيذ الحذف الجماعي بنجاح' : 'Bulk deletion completed successfully');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs shadow-md transition active:scale-95"
              >
                {language === 'ar' ? 'تأكيد الحذف الشامل' : 'Execute Purge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: PRINT CREDENTIAL SLIP (SINGLE OR BATCH) */}
      {(printingSlip || batchPrintRole) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[92vh] overflow-y-auto space-y-4">
            {/* Modal Controls Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                  <Printer className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {printingSlip
                      ? (language === 'ar' ? 'بطاقة تسليم بيانات الدخول للمستخدم' : 'User Handover Credential Slip')
                      : (language === 'ar' ? 'طباعة بطاقات الدخول (دفعة واحدة)' : 'Batch Print Credential Cards')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'بطاقات رسمية معتمدة لتسليم اسم المستخدم وكلمة المرور للطلاب والمعلمين' : 'Handover credential slips with username and password'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>{language === 'ar' ? 'طباعة الآن (Print)' : 'Print Now'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrintingSlip(null);
                    setBatchPrintRole(null);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Batch Filter Switcher */}
            {batchPrintRole && (
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs print:hidden">
                <span className="font-bold text-slate-700">
                  {language === 'ar' ? 'تصفية البطاقات المطلوب طباعتها:' : 'Filter Batch Cards:'}
                </span>
                <div className="flex items-center gap-1 font-bold">
                  <button
                    onClick={() => setBatchPrintRole('all')}
                    className={`px-2.5 py-1 rounded-lg transition ${batchPrintRole === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                  >
                    {language === 'ar' ? 'الكل' : 'All'} ({students.length + teachers.length})
                  </button>
                  <button
                    onClick={() => setBatchPrintRole('students')}
                    className={`px-2.5 py-1 rounded-lg transition ${batchPrintRole === 'students' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                  >
                    {language === 'ar' ? 'الطلاب فقط' : 'Students'} ({students.length})
                  </button>
                  <button
                    onClick={() => setBatchPrintRole('teachers')}
                    className={`px-2.5 py-1 rounded-lg transition ${batchPrintRole === 'teachers' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                  >
                    {language === 'ar' ? 'المعلمون فقط' : 'Teachers'} ({teachers.length})
                  </button>
                </div>
              </div>
            )}

            {/* PRINTABLE SLIP(S) AREA */}
            <div className="printable-credentials space-y-4">
              {/* Single Slip */}
              {printingSlip && (
                <div className="p-6 bg-white rounded-3xl border-2 border-slate-300 shadow-sm relative overflow-hidden space-y-4 text-xs font-sans">
                  {/* Decorative Header Bar */}
                  <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={activeSchool?.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80'}
                        alt="Logo"
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 p-0.5 bg-white shadow-xs"
                      />
                      <div>
                        <h4 className="font-black text-slate-900 text-base">
                          {language === 'ar' ? activeSchool?.name : activeSchool?.nameEn || activeSchool?.name}
                        </h4>
                        <span className="text-[11px] font-bold text-slate-500">
                          {language === 'ar' ? 'منظومة Rstudy التعليمية الذكية • بطاقة تسليم بيانات الدخول' : 'Official Handover Credential Card'}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-black text-xs ${printingSlip.role === 'student' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                      {printingSlip.role === 'student' ? (language === 'ar' ? 'حساب طالب' : 'Student') : (language === 'ar' ? 'حساب معلم' : 'Teacher')}
                    </span>
                  </div>

                  {/* Credentials Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">{language === 'ar' ? 'الاسم الكامل:' : 'Full Name:'}</span>
                      <strong className="text-slate-900 text-sm block">{printingSlip.name}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        {printingSlip.role === 'student' ? (language === 'ar' ? 'الصف الدراسي:' : 'Class:') : (language === 'ar' ? 'المادة المسندة:' : 'Subject:')}
                      </span>
                      <span className="font-bold text-slate-800">{printingSlip.className || printingSlip.subject}</span>
                    </div>

                    <div className="pt-2 sm:col-span-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block mb-0.5 flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-600" />
                          <span>{language === 'ar' ? 'اسم المستخدم للدخول (Username / ID):' : 'Username / ID:'}</span>
                        </span>
                        <span className="font-mono text-base font-black text-slate-900 select-all block">
                          {printingSlip.username}
                        </span>
                      </div>

                      <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-300">
                        <span className="text-[10px] text-emerald-800 font-bold block mb-0.5 flex items-center gap-1">
                          <Key className="w-3 h-3 text-emerald-700" />
                          <span>{language === 'ar' ? 'كلمة المرور المعتمدة (Password):' : 'Password:'}</span>
                        </span>
                        <span className="font-mono text-base font-black text-emerald-900 select-all block">
                          {printingSlip.password}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Note & Instructions */}
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    ℹ️ {language === 'ar'
                      ? 'يرجى تسجيل الدخول للبوابة عبر استخدام اسم المستخدم وكلمة المرور الموضحة أعلاه. يُنصح بعدم مشاركة بيانات الدخول مع أي شخص آخر للحفاظ على خصوصيتك.'
                      : 'Please sign in to the portal with the credentials above. Keep them confidential.'}
                  </p>

                  {/* Handover & Seal Lines */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600">
                    <div>
                      <span className="block text-slate-400 font-semibold mb-6">
                        {language === 'ar' ? 'توقيع المستلم بالاستلام:' : 'Receiver Signature:'}
                      </span>
                      <div className="w-36 border-b border-dashed border-slate-400" />
                    </div>
                    <div className="text-left rtl:text-left">
                      <span className="block text-slate-400 font-semibold mb-6">
                        {language === 'ar' ? 'ختم إدارة المنشأة المعتمد:' : 'Official School Seal:'}
                      </span>
                      <div className="w-24 h-12 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                        ختم المنشأة
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Batch Slips Grid */}
              {batchPrintRole && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(batchPrintRole === 'all' || batchPrintRole === 'students') &&
                    students.map((std) => (
                      <div
                        key={std.id}
                        className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-xs relative overflow-hidden space-y-2.5 text-xs break-inside-avoid"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <div>
                            <strong className="block text-slate-900 font-black">{std.name}</strong>
                            <span className="text-[10px] text-slate-500">{std.className}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-800">
                            {language === 'ar' ? 'طالب' : 'Student'}
                          </span>
                        </div>

                        <div className="space-y-1.5 p-2 bg-slate-50 rounded-xl text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">اسم المستخدم (ID):</span>
                            <span className="font-mono font-bold text-slate-900">{std.nationalId}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-700 font-bold">كلمة المرور:</span>
                            <span className="font-mono font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                              {std.password || 'Std@2026'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>{activeSchool?.name}</span>
                          <span>توقيع المستلم: __________</span>
                        </div>
                      </div>
                    ))}

                  {(batchPrintRole === 'all' || batchPrintRole === 'teachers') &&
                    teachers.map((tch) => (
                      <div
                        key={tch.id}
                        className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-xs relative overflow-hidden space-y-2.5 text-xs break-inside-avoid"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <div>
                            <strong className="block text-slate-900 font-black">{tch.name}</strong>
                            <span className="text-[10px] text-emerald-700 font-bold">{tch.subject}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800">
                            {language === 'ar' ? 'معلم' : 'Teacher'}
                          </span>
                        </div>

                        <div className="space-y-1.5 p-2 bg-slate-50 rounded-xl text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">البريد (Username):</span>
                            <span className="font-mono font-bold text-blue-700 truncate max-w-[150px]">{tch.email}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-700 font-bold">كلمة المرور:</span>
                            <span className="font-mono font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                              {tch.password || 'Teach@2026'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>{activeSchool?.name}</span>
                          <span>توقيع المستلم: __________</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: DELETE STUDENT IN-APP CONFIRMATION */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-rose-100 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-slate-900 text-base">
                {language === 'ar' ? 'تأكيد حذف حساب الطالب' : 'Confirm Student Deletion'}
              </h3>
              <p className="text-xs text-slate-600">
                {language === 'ar'
                  ? `هل أنت متأكد من حذف حساب الطالب "${deletingStudent.name}" (${deletingStudent.nationalId}) نهائياً؟`
                  : `Are you sure you want to delete ${deletingStudent.name}?`}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteStudent(deletingStudent.id);
                  setDeletingStudent(null);
                  showToast(language === 'ar' ? 'تم حذف حساب الطالب بنجاح' : 'Student deleted');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition active:scale-95"
              >
                {language === 'ar' ? 'نعم، حذف الطالب' : 'Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: DELETE TEACHER IN-APP CONFIRMATION */}
      {deletingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-rose-100 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-slate-900 text-base">
                {language === 'ar' ? 'تأكيد حذف حساب المعلم' : 'Confirm Teacher Deletion'}
              </h3>
              <p className="text-xs text-slate-600">
                {language === 'ar'
                  ? `هل أنت متأكد من حذف حساب المعلم "${deletingTeacher.name}" (${deletingTeacher.subject}) نهائياً؟`
                  : `Are you sure you want to delete ${deletingTeacher.name}?`}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTeacher(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTeacher(deletingTeacher.id);
                  setDeletingTeacher(null);
                  showToast(language === 'ar' ? 'تم حذف حساب المعلم بنجاح' : 'Teacher deleted');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition active:scale-95"
              >
                {language === 'ar' ? 'نعم، حذف المعلم' : 'Delete Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 11: DELETE PARENT IN-APP CONFIRMATION */}
      {deletingParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-rose-100 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-slate-900 text-base">
                {language === 'ar' ? 'تأكيد حذف حساب ولي الأمر' : 'Confirm Parent Deletion'}
              </h3>
              <p className="text-xs text-slate-600">
                {language === 'ar'
                  ? `هل أنت متأكد من حذف حساب ولي الأمر "${deletingParent.name}" نهائياً؟`
                  : `Are you sure you want to delete ${deletingParent.name}?`}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingParent(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteParent(deletingParent.id);
                  setDeletingParent(null);
                  showToast(language === 'ar' ? 'تم حذف حساب ولي الأمر بنجاح' : 'Parent deleted');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition active:scale-95"
              >
                {language === 'ar' ? 'نعم، حذف ولي الأمر' : 'Delete Parent'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST ALERT BANNER */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
