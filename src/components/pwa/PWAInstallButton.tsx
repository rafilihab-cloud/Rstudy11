import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, CheckCircle2, Share, PlusSquare, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalledNotice, setJustInstalledNotice] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setJustInstalledNotice(true);
        setTimeout(() => setJustInstalledNotice(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // In browser preview environments where beforeinstallprompt isn't emitted yet,
      // show helpful install modal explaining how to install on Android/Desktop/iOS
      setShowIOSGuide(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>تطبيق PWA مثبت ومفعل</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="تثبيت مدرستي كتطبيق أصلي على جهازك (PWA)"
        className={`flex items-center gap-2 font-bold transition-all shadow-sm active:scale-95 ${
          compact
            ? 'p-2 rounded-xl bg-blue-700 text-white hover:bg-blue-800'
            : 'px-3.5 py-1.5 rounded-xl text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
        }`}
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span className="hidden sm:inline">تثبيت التطبيق (PWA)</span>
        <span className="sm:hidden">تثبيت</span>
      </button>

      {/* Notice after install */}
      {justInstalledNotice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>تم تثبيت التطبيق بنجاح! يمكنك الآن تشغيله كبرنامج مستقل.</span>
        </div>
      )}

      {/* Guide Modal for iOS & Browsers */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-slate-800 border border-slate-100">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">تثبيت تطبيق مدرستي (PWA)</h3>
                <p className="text-xs text-slate-500">يعمل بدون متجر تطبيقات، خفيف وسريع ويدعم العمل بلا إنترنت</p>
              </div>
            </div>

            <div className="space-y-3.5 my-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">١</span>
                <div>
                  <strong className="block text-slate-800">على أجهزة iPhone / iPad (Safari):</strong>
                  <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    اضغط زر المشاركة <Share className="w-3.5 h-3.5 text-blue-600 inline" /> ثم اختر <strong className="text-slate-800">"إضافة إلى الشاشة الرئيسية"</strong> <PlusSquare className="w-3.5 h-3.5 text-blue-600 inline" />.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">٢</span>
                <div>
                  <strong className="block text-slate-800">على هواتف Android (Chrome):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">
                    اضغط على القائمة (ثلاث نقاط أعلى المتصفح) واضغط <strong className="text-slate-800">"تثبيت التطبيق"</strong> أو "إضافة إلى الشاشة الرئيسية".
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">٣</span>
                <div>
                  <strong className="block text-slate-800">على أجهزة الحاسوب (Windows / Mac):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">
                    اضغط على أيقونة التثبيت <Download className="w-3.5 h-3.5 inline text-blue-600" /> في شريط العنوان أعلى المتصفح لتشغيله في نافذة مستقلة كبرنامج أصلي.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition"
              >
                حسناً، فهمت ذلك
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
