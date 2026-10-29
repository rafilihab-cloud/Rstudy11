import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Send, MessageSquare } from 'lucide-react';

export const MessagingView: React.FC = () => {
  const { currentUser, messages, sendMessage, currentRole, language, t } = useSchool();
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(
    currentRole === 'teacher' ? 'parent_1' : 'user_teacher_1'
  );
  const [inputContent, setInputContent] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;
    sendMessage(selectedRecipientId, inputContent);
    setInputContent('');
  };

  const contacts = [
    {
      id: 'user_teacher_1',
      name: language === 'ar' ? 'أ. فاطمة الزهراء الشريف' : 'Prof. Fatima Al-Zahraa',
      role: language === 'ar' ? 'معلمة الرياضيات' : 'Mathematics Teacher',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'parent_1',
      name: language === 'ar' ? 'أحمد بن سالم التميمي' : 'Ahmed Bin Salem',
      role: language === 'ar' ? 'ولي أمر يوسف وسارة' : 'Parent of Yousef & Sarah',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user_admin',
      name: language === 'ar' ? 'د. عبد الرحمن السعدي' : 'Dr. Abdulrahman Al-Saadi',
      role: language === 'ar' ? 'الإدارة المدرسية' : 'School Administration',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  ].filter((c) => c.id !== currentUser.id);

  const conversation = messages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.recipientId === selectedRecipientId) ||
      (m.senderId === selectedRecipientId && m.recipientId === currentUser.id)
  );

  const activeContact = contacts.find((c) => c.id === selectedRecipientId) || contacts[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[600px]">
      {/* Contacts Sidebar */}
      <div className={`w-full md:w-72 border-b md:border-b-0 ${language === 'ar' ? 'md:border-l' : 'md:border-r'} border-slate-200 bg-slate-50 flex flex-col`}>
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>{t('directMessaging')}</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === 'ar' ? 'قنوات التواصل بين البيت والمدرسة' : 'Direct home & school communication'}
          </p>
        </div>

        <div className="p-2 space-y-1 overflow-y-auto flex-1">
          {contacts.map((c) => {
            const isSelected = selectedRecipientId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedRecipientId(c.id)}
                className={`p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'hover:bg-slate-200/60 text-slate-800'
                }`}
              >
                <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs truncate">{c.name}</h4>
                  <p
                    className={`text-[10px] truncate ${
                      isSelected ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {c.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/40">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={activeContact?.avatar}
              alt={activeContact?.name}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <h4 className="font-bold text-sm text-slate-900">{activeContact?.name}</h4>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('onlineNow')}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-semibold hidden sm:block">
            {language === 'ar' ? 'محادثة تربوية مشفرة' : 'Encrypted Discussion'}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {conversation.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mb-2 opacity-30 text-blue-600" />
              <p className="text-xs font-semibold">
                {language === 'ar' ? 'لا توجد رسائل سابقة مع هذه الجهة' : 'No previous messages'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'ar' ? 'ابدأ المحادثة ووجه استفسارك الآن' : 'Start the conversation now'}
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
                    className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMine
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                    }`}
                  >
                    <div
                      className={`text-[10px] font-bold mb-1 ${
                        isMine ? 'text-blue-100' : 'text-blue-700'
                      }`}
                    >
                      {msg.senderName}
                    </div>
                    <p className="whitespace-pre-line">{msg.content}</p>
                    <span
                      className={`text-[9px] block text-left mt-1.5 ${
                        isMine ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder={t('typeMessage')}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputContent.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shadow"
          >
            <span>{t('sendMessage')}</span>
            <Send className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
};
