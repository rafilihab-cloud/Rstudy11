import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Trophy, Medal, Sparkles, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HonorRollModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { students, language, t } = useSchool();

  if (!isOpen) return null;

  const sortedStudents = [...students].sort((a, b) => b.gpa - a.gpa);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 text-slate-800 border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-1.5">
                <span>{t('honorRollTitle')}</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500">{t('topStudents')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Podium for top 3 */}
        <div className="grid grid-cols-3 gap-2 my-6 pt-4 items-end text-center">
          {/* 2nd place */}
          {sortedStudents[1] && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col items-center">
              <div className="relative">
                <img
                  src={sortedStudents[1].avatar}
                  alt={sortedStudents[1].name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-300"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-800 text-[10px] font-black flex items-center justify-center border border-white">
                  2
                </span>
              </div>
              <h5 className="font-bold text-xs text-slate-900 mt-2 line-clamp-1">
                {language === 'ar' ? sortedStudents[1].name : sortedStudents[1].nameEn || sortedStudents[1].name}
              </h5>
              <span className="text-[11px] font-black text-blue-600 mt-0.5">
                %{sortedStudents[1].gpa}
              </span>
              <span className="text-[9px] text-slate-400">
                {language === 'ar' ? 'المركز الثاني' : '2nd Place'}
              </span>
            </div>
          )}

          {/* 1st place */}
          {sortedStudents[0] && (
            <div className="bg-gradient-to-b from-amber-50 to-amber-100/50 p-4 rounded-2xl border-2 border-amber-300 flex flex-col items-center -translate-y-2 shadow-sm">
              <div className="relative">
                <img
                  src={sortedStudents[0].avatar}
                  alt={sortedStudents[0].name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-amber-400"
                />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Medal className="w-6 h-6 text-amber-500 fill-amber-400 animate-bounce" />
                </span>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center border-2 border-white shadow">
                  1
                </span>
              </div>
              <h5 className="font-black text-sm text-slate-900 mt-2 line-clamp-1">
                {language === 'ar' ? sortedStudents[0].name : sortedStudents[0].nameEn || sortedStudents[0].name}
              </h5>
              <span className="text-xs font-black text-amber-700 mt-0.5">
                %{sortedStudents[0].gpa}
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full mt-1">
                {language === 'ar' ? 'الأول على المعهد' : 'Top Scholar'}
              </span>
            </div>
          )}

          {/* 3rd place */}
          {sortedStudents[2] && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col items-center">
              <div className="relative">
                <img
                  src={sortedStudents[2].avatar}
                  alt={sortedStudents[2].name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-600/40"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-black flex items-center justify-center border border-white">
                  3
                </span>
              </div>
              <h5 className="font-bold text-xs text-slate-900 mt-2 line-clamp-1">
                {language === 'ar' ? sortedStudents[2].name : sortedStudents[2].nameEn || sortedStudents[2].name}
              </h5>
              <span className="text-[11px] font-black text-blue-600 mt-0.5">
                %{sortedStudents[2].gpa}
              </span>
              <span className="text-[9px] text-slate-400">
                {language === 'ar' ? 'المركز الثالث' : '3rd Place'}
              </span>
            </div>
          )}
        </div>

        {/* Full List */}
        <div className="space-y-2 mt-4">
          <h4 className="text-xs font-bold text-slate-500 px-1">
            {language === 'ar' ? 'كافة الطلاب المكرمين:' : 'All Honored Students:'}
          </h4>
          {sortedStudents.map((std, index) => (
            <div
              key={std.id}
              className="p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 flex items-center justify-between text-xs transition"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                  #{index + 1}
                </span>
                <img src={std.avatar} alt={std.name} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <h5 className="font-bold text-slate-900">
                    {language === 'ar' ? std.name : std.nameEn || std.name}
                  </h5>
                  <p className="text-[10px] text-slate-500">{std.className}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1">
                  {std.badges.slice(0, 2).map((b, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200/60"
                    >
                      {b}
                    </span>
                  ))}
                </div>
                <div className="text-left font-mono font-black text-blue-700 text-sm">
                  %{std.gpa}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
