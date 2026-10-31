export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent';

export type AppLanguage = 'ar' | 'en';

export type SchoolPlan = 'free_trial' | 'gold' | 'platinum' | 'enterprise';

export interface School {
  id: string;
  name: string;
  nameEn: string;
  code: string; // e.g. "SCH-101"
  type: 'مجمع مدرسي' | 'معهد لغات وتقنية' | 'أكاديمية دولية' | 'مدرسة نموذجية';
  city: string;
  cityEn: string;
  plan: SchoolPlan;
  status: 'active' | 'suspended';
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword?: string;
  studentsCount: number;
  teachersCount: number;
  createdAt: string;
  logo: string;
  storageUsedGb: number;
  maxStudents: number;
}

export interface UserProfile {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  title?: string;
  titleEn?: string;
  assignedClass?: string;
  assignedSubjects?: string[];
  childrenIds?: string[];
  schoolId?: string;
  password?: string;
}

export interface Student {
  id: string;
  name: string;
  nameEn?: string;
  nationalId: string;
  email?: string;
  password?: string;
  className: string;
  classNameEn?: string;
  avatar: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  gpa: number;
  rankInClass: number;
  totalAbsences: number;
  badges: string[];
  schoolId?: string;
  // Tuition Fees & Installments
  totalTuitionFee?: number; // إجمالي الرسوم / القسط المطلوب
  paidTuitionFee?: number;  // المبلغ المسدد للمدرسة
}

export interface Teacher {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  phone: string;
  password?: string;
  subject: string;
  subjectEn?: string;
  classes: string[];
  avatar: string;
  experienceYears: number;
  schoolId?: string;
}

export interface GradeItem {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  subjectEn?: string;
  examType: 'اختبار نصفي' | 'اختبار نهائي' | 'اختبار قصير' | 'واجب وتقييم مستمر' | 'مشروع عملي';
  score: number;
  maxScore: number;
  term: 'الفصل الأول' | 'الفصل الثاني' | 'الفصل الصيفي' | 'النصف الأول' | 'النصف الثاني' | string;
  semester?: 'first' | 'second';
  date: string;
  feedback?: string;
  feedbackEn?: string;
  gradedBy: string;
  schoolId?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string; // data URL or URL
  type: 'image' | 'file';
  size?: string;
}

export interface HomeworkSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  content: string;
  fileAttachment?: string;
  attachments?: FileAttachment[];
  status: 'pending' | 'graded';
  score?: number;
  maxScore: number;
  teacherNotes?: string;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string;
  className: string;
  teacherId: string;
  teacherName: string;
  assignedDate: string;
  dueDate: string;
  maxScore: number;
  attachments?: FileAttachment[];
  submissions: HomeworkSubmission[];
  schoolId?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  className: string;
  status: AttendanceStatus;
  period?: number;
  notes?: string;
  recordedBy: string;
  schoolId?: string;
}

export interface TimetableEntry {
  id: string;
  day: 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس';
  dayEn?: string;
  period: number;
  timeSlot: string;
  subject: string;
  subjectEn?: string;
  teacherName: string;
  className: string;
  room: string;
  roomEn?: string;
  schoolId?: string;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  category: 'إعلان عام' | 'اختبارات' | 'فعاليات' | 'عطلة رسمية' | 'تنبيه إداري';
  priority: 'normal' | 'urgent';
  targetRole: 'all' | 'teachers' | 'students' | 'parents';
  date: string;
  author: string;
  schoolId?: string;
}

export interface LeaveRequest {
  id: string;
  parentId: string;
  parentName: string;
  studentId: string;
  studentName: string;
  className: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  adminResponse?: string;
  schoolId?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  content: string;
  timestamp: string;
  schoolId?: string;
  isRead?: boolean;
}

export interface ParentAccount {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  phone: string;
  nationalId?: string;
  password?: string;
  childrenIds: string[];
  avatar: string;
  schoolId?: string;
  relationship?: string;
  createdAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  status: 'success' | 'warning' | 'info';
}


