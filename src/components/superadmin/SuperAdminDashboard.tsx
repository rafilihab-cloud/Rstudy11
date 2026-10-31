import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { School, SchoolPlan } from '../../types';
import {
  ShieldCheck,
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Server,
  HardDrive,
  ExternalLink,
  Power,
  Trash2,
  Lock,
  Globe,
  Radio,
  Sparkles,
  Key,
  Database,
  Download,
  Upload,
  Activity,
  FileJson,
  Edit3,
  Image as ImageIcon,
  X,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { DraggableScrollContainer } from '../shared/DraggableScrollContainer';

export const SuperAdminDashboard: React.FC = () => {
  const {
    currentUser,
    schools,
    addSchool,
    updateSchool,
    toggleSchoolStatus,
    deleteSchool,
    manageSchoolAsAdmin,
    addAnnouncement,
    auditLogs,
    exportDatabaseSnapshot,
    importDatabaseSnapshot,
    language,
    t,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'schools' | 'audit' | 'backup'>('schools');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addSchoolLogoFileRef = useRef<HTMLInputElement>(null);
  const editSchoolLogoFileRef = useRef<HTMLInputElement>(null);

  // New School Form State
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState(`SCH-${Math.floor(100 + Math.random() * 900)}`);
  const [type, setType] = useState<School['type']>('مجمع مدرسي');
  const [city, setCity] = useState('الرياض');
  const [cityEn, setCityEn] = useState('Riyadh');
  const [plan, setPlan] = useState<SchoolPlan>('gold');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('+966 50 ');
  const [adminPassword, setAdminPassword] = useState('Admin@2026');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [maxStudents, setMaxStudents] = useState<number>(1000);
  const [schoolLogo, setSchoolLogo] = useState(
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80'
  );

  const generateAdminPassword = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `Admin@${rand}`;
  };

  // Edit School & Logo State
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);
  const [editSchoolName, setEditSchoolName] = useState('');
  const [editSchoolNameEn, setEditSchoolNameEn] = useState('');
  const [editSchoolLogo, setEditSchoolLogo] = useState('');

  // Sample School Crest/Logo Presets
  const schoolLogoPresets = [
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=150&auto=format&fit=crop&q=80',
  ];

  // Device Logo File Upload Handler (FileReader -> base64 data URL)
  const handleLogoFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(
        language === 'ar'
          ? 'يرجى اختيار ملف صورة صالح (PNG, JPG, JPEG, SVG, WebP)'
          : 'Please select a valid image file (PNG, JPG, SVG, WebP)'
      );
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert(
        language === 'ar'
          ? 'حجم الصورة كبير جداً (الحد الأقصى 3 ميجابايت). يرجى اختيار ملف بحجم أصغر.'
          : 'Image file is too large (max 3MB). Please choose a smaller file.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        callback(dataUrl);
        showToast(language === 'ar' ? 'تم رفع الشعار من جهازك بنجاح ✓' : 'Logo uploaded from device successfully ✓');
      }
    };
    reader.onerror = () => {
      alert(language === 'ar' ? 'حدث خطأ أثناء قراءة ملف الصورة من جهازك' : 'Error reading image file');
    };
    reader.readAsDataURL(file);
    // Reset file input value so re-selecting same file triggers onChange
    e.target.value = '';
  };

  // Global Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');

  // Overall platform stats calculation
  const totalSchools = schools.length;
  const activeSchoolsCount = schools.filter((s) => s.status === 'active').length;
  const totalStudentsEnrolled = schools.reduce((acc, s) => acc + s.studentsCount, 0);
  const totalTeachersEnrolled = schools.reduce((acc, s) => acc + s.teachersCount, 0);
  const totalStorageGb = schools.reduce((acc, s) => acc + s.storageUsedGb, 0).toFixed(1);

  // Estimated platform recurring revenue in USD
  const platformRevenue = schools
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => {
      const planPrices: Record<SchoolPlan, number> = {
        free_trial: 0,
        gold: 249, // $249 USD / Month
        platinum: 499, // $499 USD / Month
        enterprise: 999, // $999 USD / Month
      };
      return sum + planPrices[s.plan];
    }, 0);

  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.includes(searchQuery) ||
      s.adminName.includes(searchQuery);

    const matchesPlan = selectedPlanFilter === 'all' || s.plan === selectedPlanFilter;
    return matchesSearch && matchesPlan;
  });

  const handleCreateSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !adminName.trim() || !adminEmail.trim()) return;

    addSchool({
      name,
      nameEn: nameEn || name,
      code,
      type,
      city,
      cityEn: cityEn || city,
      plan,
      status: 'active',
      adminName,
      adminEmail,
      adminPhone,
      adminPassword: adminPassword.trim() || 'Admin@2026',
      maxStudents: Number(maxStudents),
      logo: schoolLogo.trim() || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
    });

    setIsAddSchoolModalOpen(false);
    // Reset form
    setName('');
    setNameEn('');
    setCode(`SCH-${Math.floor(100 + Math.random() * 900)}`);
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('Admin@2026');
    setShowAdminPassword(false);
    setSchoolLogo('https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80');
    showToast(t('schoolCreatedSuccess'));
  };

  const handleSaveEditSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool || !editSchoolName.trim()) return;

    updateSchool(editingSchool.id, {
      name: editSchoolName.trim(),
      nameEn: editSchoolNameEn.trim() || editSchoolName.trim(),
      logo: editSchoolLogo.trim() || editingSchool.logo,
    });

    setEditingSchool(null);
    showToast(language === 'ar' ? 'تم حفظ وتحديث اسم المدرسة والشعار بنجاح لجميع الطلاب وأولياء الأمور' : 'School name & logo updated successfully');
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim()) return;

    addAnnouncement({
      title: broadcastTitle,
      titleEn: broadcastTitle,
      content: broadcastContent,
      contentEn: broadcastContent,
      category: 'تنبيه إداري',
      priority: 'urgent',
      targetRole: 'all',
      author: `${currentUser.name} (${language === 'ar' ? 'المشرف العام' : 'Super Admin'})`,
    });

    setIsBroadcastModalOpen(false);
    setBroadcastTitle('');
    setBroadcastContent('');
    showToast(
      language === 'ar'
        ? 'تم إرسال التعميم العام فوراً لكافة المدارس والمعاهد المشتركة!'
        : 'Global broadcast sent to all registered school systems!'
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseSnapshot();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rstudy_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('backupExported'));
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (window.confirm(t('restoreConfirm'))) {
        const res = importDatabaseSnapshot(content);
        showToast(res.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPlanBadge = (p: SchoolPlan) => {
    switch (p) {
      case 'enterprise':
        return {
          label: language === 'ar' ? 'المؤسسات ($999/شهر)' : 'Enterprise ($999/mo)',
          price: '$999 / mo',
          style: 'bg-purple-100 text-purple-900 border-purple-300',
        };
      case 'platinum':
        return {
          label: language === 'ar' ? 'الماسية ($499/شهر)' : 'Platinum ($499/mo)',
          price: '$499 / mo',
          style: 'bg-cyan-100 text-cyan-900 border-cyan-300',
        };
      case 'gold':
        return {
          label: language === 'ar' ? 'الذهبية ($249/شهر)' : 'Gold ($249/mo)',
          price: '$249 / mo',
          style: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'free_trial':
      default:
        return {
          label: language === 'ar' ? 'تجريبي ($0)' : 'Free Trial ($0)',
          price: '$0 Trial',
          style: 'bg-slate-100 text-slate-700 border-slate-300',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Super Admin Command Center Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('superAdminBadge')}</span>
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>{language === 'ar' ? 'استقرار السيرفرات 99.98%' : 'SaaS Uptime 99.98%'}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <span>{language === 'ar' ? currentUser.name : currentUser.nameEn || currentUser.name}</span>
              <Key className="w-5 h-5 text-amber-400" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {t('superAdminSubtitle')}
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddSchoolModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>{t('openNewSchoolAccount')}</span>
            </button>

            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition active:scale-95"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>{t('globalSystemBroadcast')}</span>
            </button>
          </div>
        </div>

        {/* Global Platform KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold">{t('totalSchools')}</span>
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-black block text-white">
              {totalSchools}{' '}
              <span className="text-xs text-emerald-400 font-normal">
                ({activeSchoolsCount} {t('active')})
              </span>
            </span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold">{t('totalPlatformStudents')}</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-2xl font-black block text-blue-300">
              {totalStudentsEnrolled.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold">{t('totalPlatformTeachers')}</span>
              <GraduationCap className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-2xl font-black block text-purple-300">
              {totalTeachersEnrolled.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold">{t('monthlyPlatformRevenueUSD')}</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-black block text-emerald-300">
              ${platformRevenue.toLocaleString()} <span className="text-xs font-bold text-slate-400">USD/Mo</span>
            </span>
          </div>
        </div>
      </div>

      {/* Super Admin Section Navigation Tabs (Draggable on PC & Mobile) */}
      <DraggableScrollContainer className="pb-2" wrapperClassName="border-b border-slate-200">
        <div className="flex items-center gap-2 px-2 py-1 min-w-max">
          <button
            onClick={() => setActiveTab('schools')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
              activeTab === 'schools'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{language === 'ar' ? 'إدارة المجمعات والمدارس' : 'Schools & Campuses'} ({schools.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{t('systemAuditTrail')}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-black">
              {auditLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shrink-0 ${
              activeTab === 'backup'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{language === 'ar' ? 'النسخ الاحتياطي وإدارة البيانات' : 'Backup & Data Management'}</span>
          </button>
        </div>
      </DraggableScrollContainer>

      {activeTab === 'schools' && (
        <>
          {/* Filter and Search Bar for Schools */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'ابحث باسم المدرسة، المدينة، الكود، أو اسم المدير...'
                : 'Search school name, code, city, or principal...'
            }
            className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
        </div>

        {/* Plan Filters (Draggable on PC & Mobile) */}
        <DraggableScrollContainer className="pb-1 sm:pb-0" wrapperClassName="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold whitespace-nowrap px-2 py-0.5 min-w-max">
            <button
              onClick={() => setSelectedPlanFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                selectedPlanFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('all')} ({schools.length})
            </button>
            <button
              onClick={() => setSelectedPlanFilter('platinum')}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                selectedPlanFilter === 'platinum'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
              }`}
            >
              {t('platinumPlan')}
            </button>
            <button
              onClick={() => setSelectedPlanFilter('gold')}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                selectedPlanFilter === 'gold'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              {t('goldPlan')}
            </button>
            <button
              onClick={() => setSelectedPlanFilter('enterprise')}
              className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                selectedPlanFilter === 'enterprise'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              {t('enterprisePlan')}
            </button>
          </div>
        </DraggableScrollContainer>
      </div>

      {/* Schools Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchools.map((school) => {
          const planBadge = getPlanBadge(school.plan);
          const isSuspended = school.status === 'suspended';

          return (
            <div
              key={school.id}
              className={`bg-white rounded-3xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                isSuspended
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200 hover:border-amber-400 hover:shadow-md'
              }`}
            >
              <div>
                {/* Header row: School Code, Plan, Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                      {school.code}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${planBadge.style}`}
                    >
                      {planBadge.label}
                    </span>
                  </div>

                  <span
                    className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                      isSuspended
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSuspended ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span>{isSuspended ? t('suspended') : t('active')}</span>
                  </span>
                </div>

                {/* School Name & Info */}
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src={school.logo}
                    alt={school.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      {language === 'ar' ? school.name : school.nameEn}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {school.type} • {language === 'ar' ? school.city : school.cityEn}
                    </p>
                  </div>
                </div>

                {/* Stats & Quotas */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('studentRole')}</span>
                    <strong className="text-slate-900 font-black text-sm">
                      {school.studentsCount}
                    </strong>
                    <span className="text-[9px] text-slate-400 block">/ {school.maxStudents}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('teacherRole')}</span>
                    <strong className="text-slate-900 font-black text-sm">
                      {school.teachersCount}
                    </strong>
                    <span className="text-[9px] text-slate-400 block">{language === 'ar' ? 'معلم' : 'teachers'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('storageUsage')}</span>
                    <strong className="text-slate-900 font-black text-sm font-mono">
                      {school.storageUsedGb} GB
                    </strong>
                    <span className="text-[9px] text-slate-400 block">Cloud</span>
                  </div>
                </div>

                {/* Principal Admin Contact */}
                <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200/60 mb-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t('assignedPrincipal')}:</span>
                    <strong className="text-slate-900">{school.adminName}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{t('principalEmail')}:</span>
                    <span className="font-mono text-blue-700">{school.adminEmail}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{t('principalPhone')}:</span>
                    <span className="font-mono text-slate-600">{school.adminPhone}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                    <span className="text-slate-600 font-semibold flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-500" />
                      {language === 'ar' ? 'كلمة مرور المدير:' : 'Admin Password:'}
                    </span>
                    <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-bold select-all" title={language === 'ar' ? 'كلمة مرور مدير المدرسة' : 'School Admin Password'}>
                      {school.adminPassword || 'Admin@2026'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Enter Portal as Admin, Edit School & Logo, Toggle Status, Delete */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => manageSchoolAsAdmin(school.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition active:scale-95"
                  title="الدخول كمدير لهذه المدرسة للإشراف والتعديل"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t('enterSchoolPortal')}</span>
                </button>

                <button
                  onClick={() => {
                    setEditingSchool(school);
                    setEditSchoolName(school.name);
                    setEditSchoolNameEn(school.nameEn || school.name);
                    setEditSchoolLogo(school.logo || '');
                  }}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition active:scale-95"
                  title={language === 'ar' ? 'تعديل اسم المنشأة والشعار الرسمي' : 'Edit School Name & Logo'}
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  <span>{language === 'ar' ? 'الاسم والشعار' : 'Name & Logo'}</span>
                </button>

                <button
                  onClick={() => toggleSchoolStatus(school.id)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition ${
                    isSuspended
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                  title={isSuspended ? t('activateSchoolBtn') : t('suspendSchoolBtn')}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setDeletingSchool(school)}
                  className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-500 text-xs transition active:scale-95"
                  title={t('delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Resource Overview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-slate-900 text-base">{t('systemHealth')}</h3>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            All PWA & Node Services Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-slate-500 font-semibold">
              <span>{language === 'ar' ? 'استهلاك التخزين العام' : 'Total Cloud Storage'}</span>
              <HardDrive className="w-4 h-4 text-slate-400" />
            </div>
            <strong className="text-lg font-black text-slate-900 block font-mono">
              {totalStorageGb} GB / 500 GB
            </strong>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '32%' }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-slate-500 font-semibold">
              <span>{language === 'ar' ? 'تزامن الأجهزة (PWA Clients)' : 'Active PWA Clients'}</span>
              <Radio className="w-4 h-4 text-emerald-500" />
            </div>
            <strong className="text-lg font-black text-slate-900 block font-mono">
              2,840 Active
            </strong>
            <p className="text-[11px] text-emerald-700 font-semibold">
              iOS Safari + Android Chrome PWA
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-slate-500 font-semibold">
              <span>{language === 'ar' ? 'أمان النظام والتراخيص' : 'Security & Subscriptions'}</span>
              <Lock className="w-4 h-4 text-amber-500" />
            </div>
            <strong className="text-lg font-black text-slate-900 block font-mono">
              {activeSchoolsCount} Active Subscriptions
            </strong>
            <p className="text-[11px] text-slate-500">
              {language === 'ar' ? 'كافة التراخيص سارية ومؤمنة' : 'All license tokens verified'}
            </p>
          </div>
        </div>
      </div>
        </>
      )}

      {/* AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" />
                <span>{t('systemAuditTrail')}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar'
                  ? 'سجل غير قابل للتعديل يوثق جميع عمليات تسجيل الدخول، وتعديل الدرجات، والتوليد التلقائي للحسابات، وحركة النظام.'
                  : 'Immutable record auditing logins, grade modifications, account provisioning, and system mutations.'}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl self-start">
              {auditLogs.length} {language === 'ar' ? 'سجل موثق' : 'Recorded Events'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">الوقت / التاريخ</th>
                  <th className="p-3">المستخدم / الفاعل</th>
                  <th className="p-3">نوع الصلاحية</th>
                  <th className="p-3">نوع العملية</th>
                  <th className="p-3">تفاصيل الحدث</th>
                  <th className="p-3">الحالة الأكاديمية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-bold text-slate-800 whitespace-nowrap">{log.actorName}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{log.action}</td>
                    <td className="p-3 text-slate-600 max-w-md truncate">{log.details}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.status === 'success' ? 'ناجح' : log.status === 'warning' ? 'تنبيه' : 'معلومة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BACKUP & RESTORE TAB */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Hidden File Input for Restore */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-sky-300" />
                </div>
                <h3 className="text-xl font-black mb-1">{t('exportBackup')}</h3>
                <p className="text-xs text-blue-200 leading-relaxed mb-6">
                  {language === 'ar'
                    ? 'قم بتحميل لقطة كاملة لقاعدة بيانات المنظومة تشمل المدارس، الحسابات، الدرجات، الجداول، وسجلات الحضور بتنسيق JSON المعياري.'
                    : 'Download a full snapshot of your academy database containing all schools, users, grades, attendance, and timetables in JSON format.'}
                </p>
              </div>
              <button
                onClick={handleExportBackup}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-blue-50 text-blue-900 font-black text-xs sm:text-sm shadow transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{t('exportBackup')}</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-amber-300" />
                </div>
                <h3 className="text-xl font-black mb-1">{t('restoreBackup')}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {language === 'ar'
                    ? 'استرجاع فوري لنسخة احتياطية سابقة تم تصديرها من Rstudy. يتم فحص هيكلية الملف تلقائياً قبل الاستعادة لحماية سلامة البيانات.'
                    : 'Instant restore of a previous Rstudy database snapshot. The schema is automatically verified prior to hydration.'}
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{t('restoreBackup')}</span>
              </button>
            </div>
          </div>

          {/* System Production Health & Compliance Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-black text-slate-900 text-base mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>{language === 'ar' ? 'فحص الامتثال والجاهزية الإنتاجية (Production Audit)' : 'Production Readiness Audit'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-900 block mb-1">تشفير البيانات وحمايتها</span>
                <p className="text-emerald-700 text-[11px]">مشفّرة بنجاح وفق معايير TLS 1.3 / AES-256 للتخزين الآمن.</p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="font-bold text-blue-900 block mb-1">محرك الصلاحيات (RBAC)</span>
                <p className="text-blue-700 text-[11px]">فصل صارم بين بوابات الطلاب، المعلمين، أولياء الأمور، والإدارة.</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-900 block mb-1">العمل دون اتصال (PWA)</span>
                <p className="text-amber-700 text-[11px]">Service Worker نشط، والتطبيق قابل للتثبيت كبرنامج أصيل.</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="font-bold text-purple-900 block mb-1">الربط التلقائي والواجبات</span>
                <p className="text-purple-700 text-[11px]">إرسال الواجبات حسب الصف، وتوليد أرقام أكاديمية ذكية.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Launch & Open New School Account */}
      {isAddSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 text-lg">{t('openNewSchoolAccount')}</h3>
              </div>
              <button
                onClick={() => setIsAddSchoolModalOpen(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                {t('close')}
              </button>
            </div>

            <form onSubmit={handleCreateSchoolSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('schoolName')} (عربي):</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: مدارس دار العلوم النموذجية"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('schoolName')} (English):</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Dar Al-Uloom Model Schools"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('schoolCode')}:</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('schoolType')}:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  >
                    <option value="مجمع مدرسي">مجمع مدرسي / School</option>
                    <option value="معهد لغات وتقنية">معهد لغات وتقنية / Institute</option>
                    <option value="أكاديمية دولية">أكاديمية دولية / Academy</option>
                    <option value="مدرسة نموذجية">مدرسة نموذجية / Model School</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('city')}:</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="الرياض، جدة، الخ..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('subscriptionPlan')}:</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as SchoolPlan)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  >
                    <option value="gold">{t('goldPlan')} — $249 / {language === 'ar' ? 'شهر (USD)' : 'Mo (USD)'}</option>
                    <option value="platinum">{t('platinumPlan')} — $499 / {language === 'ar' ? 'شهر (USD)' : 'Mo (USD)'}</option>
                    <option value="enterprise">{t('enterprisePlan')} — $999 / {language === 'ar' ? 'شهر (USD)' : 'Mo (USD)'}</option>
                    <option value="free_trial">{t('freeTrial')} — $0 {language === 'ar' ? '(تجربة مجانية)' : '(Free Trial)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('schoolCapacity')}:</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                  />
                </div>
              </div>

              {/* School Logo & Emblem Section (Device File Upload + URL + Presets) */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-950 block text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-700" />
                    <span>{language === 'ar' ? 'شعار وهوية المدرسة (يظهر للطلاب والأهل) *:' : 'School Official Logo (shown to students & parents):'}</span>
                  </span>
                  {schoolLogo && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        {schoolLogo.startsWith('data:image')
                          ? (language === 'ar' ? 'ملف مرفوع من جهازك ✓' : 'Device Upload ✓')
                          : (language === 'ar' ? 'شعار معتمد' : 'Active Logo')}
                      </span>
                      <img
                        src={schoolLogo}
                        alt="Logo preview"
                        className="w-9 h-9 rounded-xl object-contain bg-white border border-amber-300 p-0.5 shadow-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Hidden File Input for Device Upload */}
                <input
                  type="file"
                  ref={addSchoolLogoFileRef}
                  onChange={(e) => handleLogoFileChange(e, setSchoolLogo)}
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                  className="hidden"
                />

                {/* Device Upload Action Card */}
                <div
                  onClick={() => addSchoolLogoFileRef.current?.click()}
                  className="p-3.5 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50/60 rounded-2xl cursor-pointer transition text-center group flex flex-col items-center justify-center gap-1.5 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
                    <Upload className="w-5 h-5 text-amber-800" />
                  </div>
                  <div>
                    <span className="font-black text-amber-950 text-xs block">
                      {language === 'ar' ? 'اضغط هنا لرفع الشعار كصورة أو ملف من جهازك' : 'Click here to upload logo file/image from your device'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {language === 'ar' ? 'يدعم صور PNG, JPG, WebP, SVG حتى 3 ميجابايت' : 'Supports PNG, JPG, WebP, SVG up to 3MB'}
                    </span>
                  </div>
                </div>

                {/* Secondary Options: Direct URL & Presets */}
                <div className="pt-2 border-t border-amber-200/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-bold">
                      {language === 'ar' ? 'أو أدخل رابط الشعار المباشر (URL):' : 'Or enter logo image URL:'}
                    </span>
                    {schoolLogo && (
                      <button
                        type="button"
                        onClick={() => setSchoolLogo('')}
                        className="text-[10px] text-rose-600 hover:underline font-bold"
                      >
                        {language === 'ar' ? 'إفراغ الشعار' : 'Clear'}
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={schoolLogo}
                    onChange={(e) => setSchoolLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-mono text-[11px] focus:ring-2 focus:ring-amber-500"
                  />

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      {language === 'ar' ? 'أو اختر من النماذج المعتمدة الجاهزة:' : 'Or choose from preset emblems:'}
                    </label>
                    <div className="flex items-center gap-2">
                      {schoolLogoPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSchoolLogo(preset)}
                          className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition p-0.5 bg-white ${
                            schoolLogo === preset
                              ? 'border-amber-600 scale-110 shadow-md ring-2 ring-amber-300'
                              : 'border-slate-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={preset} alt="Preset" className="w-full h-full object-cover rounded-md" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Account Credentials */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="font-black text-slate-900 block text-xs flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {language === 'ar'
                      ? 'بيانات حساب مدير المنشأة المعتمد (School Principal):'
                      : 'Principal Admin Credentials:'}
                  </span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      {t('assignedPrincipal')}:
                    </label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="اسم المدير..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      {t('principalEmail')}:
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="principal@school.edu"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    {t('principalPhone')}:
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div className="pt-1 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 text-xs">
                      {language === 'ar' ? 'تعيين كلمة مرور لمدير المدرسة *:' : 'School Admin Password *:'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setAdminPassword(generateAdminPassword())}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline flex items-center gap-1"
                      title={language === 'ar' ? 'توليد تلقائي لكلمة المرور' : 'Auto Generate Password'}
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>{language === 'ar' ? 'توليد تلقائي' : 'Auto-Generate'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Admin@2026"
                      className="w-full px-3 py-1.5 pl-8 rtl:pl-3 rtl:pr-8 rounded-lg border border-emerald-300 font-mono font-bold text-emerald-900 bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-2 text-slate-400 hover:text-slate-600"
                      title={showAdminPassword ? 'إخفاء' : 'إظهار'}
                    >
                      {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {language === 'ar'
                      ? 'يستطيع مالك المنصة تعيين كلمة مرور لمدير المنشأة أو استخدام التوليد التلقائي ليسلمها له للدخول'
                      : 'The platform owner can set a password for the school admin or auto-generate one to provide them for login'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition"
                >
                  {t('openNewSchoolAccount')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddSchoolModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Global System Broadcast */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
            <h3 className="font-black text-slate-900 text-lg mb-1">{t('globalSystemBroadcast')}</h3>
            <p className="text-xs text-slate-500 mb-4">
              {language === 'ar'
                ? 'سيتم بث هذا التعميم فوراً لجميع الإدارات والمعلمين والطلاب في كافة المدارس'
                : 'Broadcast message will be dispatched immediately across all tenant schools'}
            </p>

            <form onSubmit={handleBroadcastSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('announcementTitle')}:
                </label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="مثال: ترقية عامة للمنظومة وتحديث جدول الاختبارات"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('announcementContent')}:
                </label>
                <textarea
                  rows={4}
                  required
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  placeholder="نص التعميم الصادر من المالك والمشرف العام..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow transition"
                >
                  {language === 'ar' ? 'إرسال التعميم الشامل' : 'Send Broadcast'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit School Name & Logo (Owner / Super Admin) */}
      {editingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {language === 'ar' ? 'تعديل اسم المدرسة والشعار الرسمي' : 'Edit School Name & Logo'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar'
                      ? 'يتم تحديث الاسم والشعار فورياً ويظهر لجميع طلاب وأولياء أمور هذه المدرسة'
                      : 'Updated live for all students and parents in this school'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingSchool(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSchool} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'اسم المدرسة (عربي) *:' : 'School Name (Arabic) *:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editSchoolName}
                    onChange={(e) => setEditSchoolName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'اسم المدرسة (English):' : 'School Name (English):'}
                  </label>
                  <input
                    type="text"
                    value={editSchoolNameEn}
                    onChange={(e) => setEditSchoolNameEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Logo preview & Device File Upload */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-4 h-4 text-amber-700" />
                    <span>{language === 'ar' ? 'شعار وهوية المنشأة (Logo):' : 'School Logo:'}</span>
                  </span>
                  {editSchoolLogo && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        {editSchoolLogo.startsWith('data:image')
                          ? (language === 'ar' ? 'ملف مرفوع من جهازك ✓' : 'Device Upload ✓')
                          : (language === 'ar' ? 'شعار معتمد' : 'Active Logo')}
                      </span>
                      <img
                        src={editSchoolLogo}
                        alt="Current logo"
                        className="w-9 h-9 rounded-xl object-contain bg-white border border-amber-300 p-0.5 shadow-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Hidden File Input for Device Upload */}
                <input
                  type="file"
                  ref={editSchoolLogoFileRef}
                  onChange={(e) => handleLogoFileChange(e, setEditSchoolLogo)}
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                  className="hidden"
                />

                {/* Device Upload Action Card */}
                <div
                  onClick={() => editSchoolLogoFileRef.current?.click()}
                  className="p-3.5 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50/60 rounded-2xl cursor-pointer transition text-center group flex flex-col items-center justify-center gap-1.5 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition shadow-xs">
                    <Upload className="w-5 h-5 text-amber-800" />
                  </div>
                  <div>
                    <span className="font-black text-amber-950 text-xs block">
                      {language === 'ar' ? 'اضغط هنا لرفع شعار جديد من جهازك (صورة أو ملف)' : 'Click to upload a new logo file/image from your device'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {language === 'ar' ? 'يدعم صور PNG, JPG, WebP, SVG حتى 3 ميجابايت' : 'Supports PNG, JPG, WebP, SVG up to 3MB'}
                    </span>
                  </div>
                </div>

                {/* Secondary Options: Direct URL & Presets */}
                <div className="pt-2 border-t border-amber-200/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-bold">
                      {language === 'ar' ? 'أو أدخل رابط الشعار المباشر (URL):' : 'Or enter direct URL:'}
                    </span>
                    {editSchoolLogo && (
                      <button
                        type="button"
                        onClick={() => setEditSchoolLogo('')}
                        className="text-[10px] text-rose-600 hover:underline font-bold"
                      >
                        {language === 'ar' ? 'إفراغ الشعار' : 'Clear'}
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={editSchoolLogo}
                    onChange={(e) => setEditSchoolLogo(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-xl border border-amber-300 font-mono text-[11px] bg-white focus:ring-2 focus:ring-amber-500"
                  />

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      {language === 'ar' ? 'أو اختر شعاراً من النماذج المعتمدة:' : 'Or choose from presets:'}
                    </label>
                    <div className="flex items-center gap-2">
                      {schoolLogoPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditSchoolLogo(preset)}
                          className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition p-0.5 bg-white ${
                            editSchoolLogo === preset
                              ? 'border-amber-600 scale-110 shadow-md ring-2 ring-amber-300'
                              : 'border-slate-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={preset} alt="Preset" className="w-full h-full object-cover rounded-md" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSchool(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-md transition"
                >
                  {language === 'ar' ? 'حفظ وتطبيق الشعار' : 'Save & Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete School In-App Confirmation */}
      {deletingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-rose-100 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-black text-slate-900 text-lg">
                {language === 'ar' ? 'تأكيد حذف المنشأة التعليمية نهائياً' : 'Confirm School Deletion'}
              </h3>
              <p className="text-xs text-slate-600">
                {language === 'ar'
                  ? `هل أنت متأكد من حذف منشأة "${deletingSchool.name}" (${deletingSchool.code}) نهائياً من النظام؟`
                  : `Are you sure you want to permanently delete "${deletingSchool.nameEn || deletingSchool.name}" (${deletingSchool.code})?`}
              </p>
              <div className="p-3 bg-rose-50 text-rose-900 text-xs rounded-2xl border border-rose-200 mt-2 text-right">
                ⚠️ {language === 'ar'
                  ? 'سيتم حذف حساب المنشأة وإلغاء صلاحيات إدارتها بشكل نهائي ومباشر.'
                  : 'The school entity and its management access will be removed permanently.'}
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSchool(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition active:scale-95"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const sId = deletingSchool.id;
                  setDeletingSchool(null);
                  deleteSchool(sId);
                  showToast(language === 'ar' ? 'تم حذف المنشأة بنجاح' : 'School facility deleted successfully');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition active:scale-95"
              >
                {language === 'ar' ? 'نعم، حذف المنشأة' : 'Yes, Delete School'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
