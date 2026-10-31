import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import {
  GraduationCap,
  BookOpen,
  Users,
  ShieldCheck,
  Crown,
  Lock,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Globe,
  HelpCircle,
  X,
  Key,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, language, toggleLanguage, t } = useSchool();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('2026849201');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showCredentialsGuide, setShowCredentialsGuide] = useState(false);

  // Role Configurations
  const roleCards: Array<{
    role: UserRole;
    title: string;
    subTitle: string;
    icon: React.ReactNode;
    color: string;
    borderActive: string;
    bgActive: string;
    badgeStyle: string;
    defaultIdentifier: string;
    inputLabelAr: string;
    inputLabelEn: string;
    placeholderAr: string;
    placeholderEn: string;
    defaultPassword: string;
  }> = [
    {
      role: 'student',
      title: language === 'ar' ? 'بوابة الطلاب' : 'Student Portal',
      subTitle: language === 'ar' ? 'الجدول والواجبات والشهادة' : 'Schedule, Homework & Grades',
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      color: 'text-blue-600',
      borderActive: 'border-blue-500 ring-2 ring-blue-500/20 shadow-md',
      bgActive: 'bg-blue-50/70',
      badgeStyle: 'bg-blue-100 text-blue-800',
      defaultIdentifier: '2026849201',
      inputLabelAr: 'الرقم الأكاديمي أو البريد الإلكتروني للطالب',
      inputLabelEn: 'Academic ID or Student Email',
      placeholderAr: 'مثال: 2026849201 أو yousef@student.rstudy.edu',
      placeholderEn: 'e.g. 2026849201 or yousef@student.rstudy.edu',
      defaultPassword: 'password123',
    },
    {
      role: 'teacher',
      title: language === 'ar' ? 'الكادر التعليمي' : 'Teacher Portal',
      subTitle: language === 'ar' ? 'رصد الدرجات والحضور والواجبات' : 'Grades, Attendance & Homework',
      icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
      color: 'text-emerald-600',
      borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md',
      bgActive: 'bg-emerald-50/70',
      badgeStyle: 'bg-emerald-100 text-emerald-800',
      defaultIdentifier: 'fatima@rstudy.edu',
      inputLabelAr: 'البريد الإلكتروني المهني للمعلم',
      inputLabelEn: 'Teacher Institutional Email',
      placeholderAr: 'fatima@rstudy.edu',
      placeholderEn: 'fatima@rstudy.edu',
      defaultPassword: 'password123',
    },
    {
      role: 'parent',
      title: language === 'ar' ? 'أولياء الأمور' : 'Parent Portal',
      subTitle: language === 'ar' ? 'متابعة الأبناء والحضور والاستئذان' : 'Monitor Children & Attendance',
      icon: <Users className="w-5 h-5 text-amber-600" />,
      color: 'text-amber-600',
      borderActive: 'border-amber-500 ring-2 ring-amber-500/20 shadow-md',
      bgActive: 'bg-amber-50/70',
      badgeStyle: 'bg-amber-100 text-amber-800',
      defaultIdentifier: '+966 50 888 9900',
      inputLabelAr: 'رقم الجوال المسجل أو البريد الإلكتروني',
      inputLabelEn: 'Registered Mobile Number or Email',
      placeholderAr: '+966 50 888 9900 أو ahmed@parent.rstudy.edu',
      placeholderEn: '+966 50 888 9900 or ahmed@parent.rstudy.edu',
      defaultPassword: 'password123',
    },
    {
      role: 'admin',
      title: language === 'ar' ? 'الإدارة المدرسية' : 'School Principal',
      subTitle: language === 'ar' ? 'إدارة الحسابات والجداول والتعاميم' : 'Users, Timetable & Administration',
      icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
      color: 'text-purple-600',
      borderActive: 'border-purple-500 ring-2 ring-purple-500/20 shadow-md',
      bgActive: 'bg-purple-50/70',
      badgeStyle: 'bg-purple-100 text-purple-800',
      defaultIdentifier: 'admin@rstudy.edu',
      inputLabelAr: 'البريد الإلكتروني لإدارة المدرسة',
      inputLabelEn: 'School Administrator Email',
      placeholderAr: 'admin@rstudy.edu',
      placeholderEn: 'admin@rstudy.edu',
      defaultPassword: 'password123',
    },
    {
      role: 'super_admin',
      title: language === 'ar' ? 'مالك المنصة' : 'Super Admin',
      subTitle: language === 'ar' ? 'إدارة المدارس والاشتراكات والنظام' : 'Platform & Multi-School Control',
      icon: <Crown className="w-5 h-5 text-amber-500" />,
      color: 'text-amber-600',
      borderActive: 'border-amber-400 ring-2 ring-amber-400/20 shadow-md',
      bgActive: 'bg-amber-50/60',
      badgeStyle: 'bg-amber-200 text-amber-900 font-black',
      defaultIdentifier: 'owner@rstudy.edu',
      inputLabelAr: 'البريد المركزي لمالك المنصة',
      inputLabelEn: 'Super Admin Central Email',
      placeholderAr: 'owner@rstudy.edu',
      placeholderEn: 'owner@rstudy.edu',
      defaultPassword: 'password123',
    },
  ];

  const activeRoleConfig = roleCards.find((r) => r.role === selectedRole) || roleCards[0];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const cfg = roleCards.find((r) => r.role === role);
    if (cfg) {
      setIdentifier(cfg.defaultIdentifier);
      setPassword(cfg.defaultPassword);
    }
    setErrorMessage(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage(t('loginErrorInvalid'));
      return;
    }

    const res = login(selectedRole, identifier, password);
    if (!res.success) {
      setErrorMessage(res.message || t('loginErrorInvalid'));
      return;
    }

    setSuccessMessage(t('loginSuccess'));
  };

  const populateDemoCredentials = (role: UserRole) => {
    const cfg = roleCards.find((r) => r.role === role);
    if (cfg) {
      setSelectedRole(role);
      setIdentifier(cfg.defaultIdentifier);
      setPassword(cfg.defaultPassword);
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-slate-800 flex flex-col justify-between p-3 sm:p-6 pb-safe pt-safe">
      {/* Top Header Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/25 ring-2 ring-white/20">
            <span>R</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">Rstudy</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-500/30 text-blue-200 border border-blue-400/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {language === 'ar'
                ? 'المنصة التعليمية الذكية المتكاملة للمدارس والمعاهد'
                : 'Smart Integrated Educational & LMS Platform'}
            </p>
          </div>
        </div>

        {/* Language switch button - CLEAN WITH NO FLAGS */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-white/10 hover:bg-white/20 text-white border border-white/15 transition active:scale-95 shadow-sm"
            title={language === 'ar' ? 'تغيير اللغة' : 'Change Language'}
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto my-auto py-6 sm:py-8 flex flex-col items-center">
        {/* Card Box */}
        <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Header Strip inside card */}
          <div className="bg-slate-50 border-b border-slate-100 p-5 sm:p-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('loginTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
              {t('loginSubtitle')}
            </p>
          </div>

          <div className="p-4 sm:p-8">
            {/* 1. Account Types Selector Tabs / Grid */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 mb-2.5">
                {language === 'ar' ? 'اختر فئة الحساب للدخول:' : 'Select Account Type:'}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {roleCards.map((rc) => {
                  const isSelected = selectedRole === rc.role;
                  return (
                    <button
                      key={rc.role}
                      type="button"
                      onClick={() => handleRoleSelect(rc.role)}
                      className={`p-3 rounded-2xl border-2 text-right transition-all flex flex-col justify-between min-h-[90px] ${
                        isSelected
                          ? `${rc.borderActive} ${rc.bgActive}`
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-1.5 rounded-xl bg-white shadow-xs border border-slate-100">
                          {rc.icon}
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        <span className="font-extrabold text-xs text-slate-900 block truncate">
                          {rc.title}
                        </span>
                        <span className="text-[10px] text-slate-500 line-clamp-1 block">
                          {rc.subTitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Success or Error Notices */}
            {successMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 text-rose-900 border border-rose-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <X className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 2. Login Form tailored for the selected role */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>
                    {language === 'ar' ? activeRoleConfig.inputLabelAr : activeRoleConfig.inputLabelEn}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold">
                    {language === 'ar' ? 'معتمد في Rstudy' : 'Verified'}
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    {selectedRole === 'parent' ? (
                      <Smartphone className="w-4 h-4" />
                    ) : selectedRole === 'student' ? (
                      <Key className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      language === 'ar'
                        ? activeRoleConfig.placeholderAr
                        : activeRoleConfig.placeholderEn
                    }
                    className="w-full pr-10 pl-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>{t('password')}</span>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {t('forgotPassword')}
                  </button>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    className="w-full pr-10 pl-11 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>{t('rememberMe')}</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 hover:from-blue-800 hover:to-indigo-700 text-white font-black text-sm sm:text-base shadow-lg shadow-blue-600/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>
                  {language === 'ar'
                    ? `تسجيل الدخول إلى ${activeRoleConfig.title}`
                    : `Sign in to ${activeRoleConfig.title}`}
                </span>
                <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </form>

            {/* Enterprise Security & Inspection Reference Guide */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">
                    {t('productionSecurityNotice')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCredentialsGuide(!showCredentialsGuide)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('demoCredentialsGuide')}</span>
                  {showCredentialsGuide ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {showCredentialsGuide && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-fadeIn">
                  <p className="text-[11px] text-slate-500 mb-3">
                    {t('demoCredentialsSubtitle')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {roleCards.map((card) => (
                      <div
                        key={card.role}
                        className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                            {card.icon}
                            <span className="truncate">{card.title}</span>
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black shrink-0 ${card.badgeStyle}`}>
                            {card.role}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-700 my-1 truncate bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          {card.defaultIdentifier}
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                          <span className="text-slate-400 font-mono">pwd: {card.defaultPassword}</span>
                          <button
                            type="button"
                            onClick={() => populateDemoCredentials(card.role)}
                            className="font-bold text-blue-600 hover:text-blue-800 transition"
                          >
                            {language === 'ar' ? 'تعبئة الحقول' : 'Fill Form'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-4 text-xs text-slate-400">
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <span>© 2026 Rstudy</span>
          <span>•</span>
          <button
            onClick={() => setShowForgotModal(true)}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {t('contactSupport')}
          </button>
        </p>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">{t('forgotPassword')}</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 text-xs space-y-3 leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p>
                {language === 'ar'
                  ? 'لاستعادة كلمة المرور أو إعادة تعيينها لحسابك في منصة Rstudy:'
                  : 'To recover or reset your Rstudy account password:'}
              </p>
              <ul className="list-disc list-inside space-y-1 font-semibold text-slate-700">
                <li>
                  {language === 'ar'
                    ? 'للطلاب وأولياء الأمور: يمكنك مراجعة إدارة شؤون الطلاب بالمدرسة.'
                    : 'For Students & Parents: Contact the school administration office.'}
                </li>
                <li>
                  {language === 'ar'
                    ? 'للمعلمين: يتم استعادة الرمز عبر البريد المؤسسي المعتمد.'
                    : 'For Teachers: Reset is provided via your institutional school email.'}
                </li>
                <li>
                  {language === 'ar'
                    ? 'في بيئة المعاينة التجريبية، كلمة المرور الموحدة هي: password123'
                    : 'In this demo preview environment, the universal password is: password123'}
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow"
            >
              {language === 'ar' ? 'فهمت ذلك' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
