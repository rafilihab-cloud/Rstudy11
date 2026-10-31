import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Send,
  MessageSquare,
  Search,
  User,
  GraduationCap,
  Users,
  Shield,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  Phone,
  Mail,
} from 'lucide-react';

interface ContactItem {
  id: string;
  name: string;
  nameEn?: string;
  role: string;
  roleCategory: 'admin' | 'teacher' | 'parent' | 'student';
  avatar: string;
  phone?: string;
  email?: string;
  infoSubtitle?: string;
}

export const MessagingView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    activeSchool,
    activeSchoolId,
    teachers,
    parents,
    students,
    messages,
    sendMessage,
    language,
    t,
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'admin' | 'teacher' | 'parent' | 'student'>('all');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [inputContent, setInputContent] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamically assemble all genuine contacts based on the active school & school members
  const allContacts: ContactItem[] = useMemo(() => {
    const list: ContactItem[] = [];

    // 1. School Administration (Dr. Abdulrahman or custom school admin)
    const adminContact: ContactItem = {
      id: 'user_admin',
      name: activeSchool?.adminName || (language === 'ar' ? 'د. عبد الرحمن السعدي' : 'Dr. Abdulrahman Al-Saadi'),
      role: language === 'ar' ? 'إدارة المدرسة والمشرف التربوي' : 'School Administration & Supervisor',
      roleCategory: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email: 'admin@rstudy.edu',
      phone: activeSchool?.adminPhone || '+966 50 123 4567',
      infoSubtitle: activeSchool?.name,
    };
    list.push(adminContact);

    // 2. Real Teachers of this school
    const schoolTeachers = teachers.filter(
      (t) => !t.schoolId || t.schoolId === activeSchoolId || currentRole === 'super_admin'
    );
    schoolTeachers.forEach((tch) => {
      list.push({
        id: tch.id,
        name: tch.name,
        nameEn: tch.nameEn,
        role: `${tch.subject || (language === 'ar' ? 'معلم' : 'Teacher')} • ${tch.classes?.[0] || ''}`,
        roleCategory: 'teacher',
        avatar: tch.avatar,
        phone: tch.phone,
        email: tch.email,
        infoSubtitle: tch.classes?.join('، '),
      });
    });

    // 3. Real Parents of this school
    const schoolParents = parents.filter(
      (p) => !p.schoolId || p.schoolId === activeSchoolId || currentRole === 'super_admin'
    );
    schoolParents.forEach((pr) => {
      // Find names of their children
      const childNames = students
        .filter((s) => pr.childrenIds?.includes(s.id))
        .map((s) => s.name)
        .join(' و ');
      list.push({
        id: pr.id,
        name: pr.name,
        nameEn: pr.nameEn,
        role: childNames
          ? language === 'ar'
            ? `ولي أمر (${childNames})`
            : `Parent of (${childNames})`
          : pr.relationship || (language === 'ar' ? 'ولي أمر' : 'Parent'),
        roleCategory: 'parent',
        avatar: pr.avatar,
        phone: pr.phone,
        email: pr.email,
        infoSubtitle: pr.phone,
      });
    });

    // 4. Real Students of this school
    const schoolStudents = students.filter(
      (s) => !s.schoolId || s.schoolId === activeSchoolId || currentRole === 'super_admin'
    );
    schoolStudents.forEach((st) => {
      list.push({
        id: st.id,
        name: st.name,
        nameEn: st.nameEn,
        role: `${language === 'ar' ? 'طالب' : 'Student'} • ${st.className}`,
        roleCategory: 'student',
        avatar: st.avatar,
        phone: st.parentPhone,
        infoSubtitle: st.className,
      });
    });

    // Remove the currently logged-in user from contacts so they do not chat with themselves
    return list.filter((c) => c.id !== currentUser.id);
  }, [activeSchool, activeSchoolId, teachers, parents, students, currentUser.id, currentRole, language]);

  // Filtered contacts by search and category
  const filteredContacts = useMemo(() => {
    return allContacts.filter((c) => {
      const matchesCategory = categoryFilter === 'all' || c.roleCategory === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
        c.role.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [allContacts, categoryFilter, searchQuery]);

  // Automatically select first valid contact if current selection is invalid or empty
  useEffect(() => {
    if (!selectedRecipientId && filteredContacts.length > 0) {
      setSelectedRecipientId(filteredContacts[0].id);
    } else if (selectedRecipientId && !allContacts.some((c) => c.id === selectedRecipientId)) {
      if (filteredContacts.length > 0) {
        setSelectedRecipientId(filteredContacts[0].id);
      }
    }
  }, [filteredContacts, selectedRecipientId, allContacts]);

  const activeContact = allContacts.find((c) => c.id === selectedRecipientId) || filteredContacts[0];

  // Conversation for the active recipient
  const conversation = useMemo(() => {
    if (!activeContact) return [];
    return messages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.recipientId === activeContact.id) ||
        (m.senderId === activeContact.id && m.recipientId === currentUser.id)
    );
  }, [messages, currentUser.id, activeContact]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.length, selectedRecipientId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !activeContact) return;
    sendMessage(activeContact.id, inputContent.trim());
    setInputContent('');
  };

  // Quick reply suggestions based on role
  const quickResponses = useMemo(() => {
    if (currentRole === 'teacher') {
      return [
        'السلام عليكم ورحمة الله، أود إعلامكم بتفوق الطالب في التقييم الأخير.',
        'يرجى حث الطالب على حل الواجبات اليومية وتسليمها في الموعد.',
        'تم استلام ملاحظتكم وسأقوم بمتابعتها غداً في الحصة بإذن الله.',
      ];
    }
    if (currentRole === 'parent') {
      return [
        'السلام عليكم، أود الاستفسار عن الواجبات المدرسية المتبقية لهذا الأسبوع.',
        'شكراً جزيلاً لجهودكم الكريمة واهتمامكم المستمر بالطلاب.',
        'نعتذر عن تأخر تسليم الواجب بسبب ظرف عائلي طارئ.',
      ];
    }
    if (currentRole === 'student') {
      return [
        'السلام عليكم يا أستاذ، هل يمكن توضيح السؤال الأخير في ورقة العمل؟',
        'تم إرسال حل الواجب عبر المنصة، شكراً لكم.',
        'أود الاستفسار عن موعد الاختبار القادم.',
      ];
    }
    return [
      'السلام عليكم ورحمة الله وبركاته، تحية طيبة من إدارة المدرسة.',
      'نود تذكيركم بضرورة الالتزام بالمواعيد الرسمية للحضور.',
      'تم اعتماد الطلب وتسجيله في سجلات المدرسة الرسمية بنجاح.',
    ];
  }, [currentRole]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row h-[680px]">
      {/* Contacts Sidebar */}
      <div
        className={`w-full md:w-80 border-b md:border-b-0 ${
          language === 'ar' ? 'md:border-l' : 'md:border-r'
        } border-slate-200 bg-slate-50 flex flex-col ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span>{t('directMessaging')}</span>
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {allContacts.length} {language === 'ar' ? 'جهة اتصال' : 'contacts'}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث عن معلم، ولي أمر، طالب...' : 'Search contacts...'}
              className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Categories Horizontal Tabs */}
          <div className="flex items-center gap-1 mt-2.5 overflow-x-auto no-scrollbar pb-0.5 text-[11px] font-bold">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
                categoryFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setCategoryFilter('teacher')}
              className={`px-2 py-1 rounded-lg transition shrink-0 flex items-center gap-1 ${
                categoryFilter === 'teacher'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>{language === 'ar' ? 'المعلمون' : 'Teachers'}</span>
            </button>
            <button
              onClick={() => setCategoryFilter('parent')}
              className={`px-2 py-1 rounded-lg transition shrink-0 flex items-center gap-1 ${
                categoryFilter === 'parent'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>{language === 'ar' ? 'أولياء الأمور' : 'Parents'}</span>
            </button>
            <button
              onClick={() => setCategoryFilter('admin')}
              className={`px-2 py-1 rounded-lg transition shrink-0 flex items-center gap-1 ${
                categoryFilter === 'admin'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>{language === 'ar' ? 'الإدارة' : 'Admin'}</span>
            </button>
            <button
              onClick={() => setCategoryFilter('student')}
              className={`px-2 py-1 rounded-lg transition shrink-0 flex items-center gap-1 ${
                categoryFilter === 'student'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <User className="w-3 h-3" />
              <span>{language === 'ar' ? 'الطلاب' : 'Students'}</span>
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className="p-2 space-y-1 overflow-y-auto flex-1">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-bold">{language === 'ar' ? 'لم يتم العثور على جهات اتصال' : 'No contacts found'}</p>
            </div>
          ) : (
            filteredContacts.map((c) => {
              const isSelected = selectedRecipientId === c.id;
              // Find latest message with this contact
              const contactMsgs = messages.filter(
                (m) =>
                  (m.senderId === currentUser.id && m.recipientId === c.id) ||
                  (m.senderId === c.id && m.recipientId === currentUser.id)
              );
              const lastMsg = contactMsgs[contactMsgs.length - 1];

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedRecipientId(c.id);
                    setShowMobileChat(true);
                  }}
                  className={`p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'hover:bg-slate-200/70 text-slate-800 bg-white/70 border border-slate-200/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-2xs"
                    />
                    <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-xs truncate">
                        {language === 'ar' ? c.name : c.nameEn || c.name}
                      </h4>
                      {lastMsg && (
                        <span
                          className={`text-[9px] shrink-0 font-medium ${
                            isSelected ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {lastMsg.timestamp?.slice(11, 16) || ''}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-blue-100 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {lastMsg ? lastMsg.content : c.role}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col bg-slate-50/50 ${
          !showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeContact ? (
          <>
            {/* Chat Top Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                  aria-label="Back to contacts"
                >
                  {language === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                </button>

                <div className="relative shrink-0">
                  <img
                    src={activeContact.avatar}
                    alt={activeContact.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                  <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    <span>{language === 'ar' ? activeContact.name : activeContact.nameEn || activeContact.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        activeContact.roleCategory === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : activeContact.roleCategory === 'teacher'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeContact.roleCategory === 'parent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {activeContact.roleCategory === 'admin'
                        ? language === 'ar'
                          ? 'إدارة'
                          : 'Admin'
                        : activeContact.roleCategory === 'teacher'
                        ? language === 'ar'
                          ? 'كادر تعليمي'
                          : 'Faculty'
                        : activeContact.roleCategory === 'parent'
                        ? language === 'ar'
                          ? 'ولي أمر'
                          : 'Parent'
                        : language === 'ar'
                        ? 'طالب'
                        : 'Student'}
                    </span>
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="truncate max-w-[150px] sm:max-w-[220px]">{activeContact.role}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t('onlineNow')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Contact Info Badges */}
              <div className="hidden sm:flex items-center gap-2">
                {activeContact.phone && (
                  <a
                    href={`tel:${activeContact.phone}`}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                    title={activeContact.phone}
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{activeContact.phone}</span>
                  </a>
                )}
                {activeContact.email && (
                  <a
                    href={`mailto:${activeContact.email}`}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title={activeContact.email}
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-600" />
                  </a>
                )}
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
              {conversation.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-xs">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h5 className="text-sm font-extrabold text-slate-800">
                    {language === 'ar' ? 'بدء محادثة مباشرة جديدة' : 'Start a New Conversation'}
                  </h5>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                    {language === 'ar'
                      ? `يمكنك الآن إرسال الاستفسارات والواجبات والملاحظات التربوية مباشرة إلى ${activeContact.name}`
                      : `You can send questions, updates, and academic notes directly to ${activeContact.name}`}
                  </p>
                </div>
              ) : (
                conversation.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[72%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs transition ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                        }`}
                      >
                        <div
                          className={`text-[10px] font-black mb-1 flex items-center justify-between gap-3 ${
                            isMine ? 'text-blue-100' : 'text-blue-700'
                          }`}
                        >
                          <span>{isMine ? (language === 'ar' ? 'أنت' : 'You') : msg.senderName}</span>
                          <span
                            className={`text-[9px] font-normal flex items-center gap-1 ${
                              isMine ? 'text-blue-200' : 'text-slate-400'
                            }`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>{msg.timestamp}</span>
                          </span>
                        </div>
                        <p className="whitespace-pre-line font-medium leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-1.5 bg-slate-100/70 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{language === 'ar' ? 'ردود سريعة:' : 'Quick replies:'}</span>
              </span>
              {quickResponses.map((qr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputContent(qr)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 text-[10px] font-medium transition shrink-0 truncate max-w-[200px] text-right"
                  title={qr}
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? `اكتب رسالتك إلى ${activeContact.name}...`
                    : `Write a message to ${activeContact.name}...`
                }
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!inputContent.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer shrink-0"
              >
                <span>{t('sendMessage')}</span>
                <Send className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <MessageSquare className="w-12 h-12 mb-2 opacity-30 text-blue-600" />
            <p className="text-xs font-bold">{language === 'ar' ? 'اختر جهة اتصال لبدء المحادثة' : 'Select a contact to start messaging'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
