import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 flex items-center gap-3 bg-amber-600/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl border border-amber-400 text-xs sm:text-sm font-semibold animate-pulse-subtle">
      <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>وضع عدم الاتصال بالشبكة (Offline) — التطبيق يعمل بالكامل على البيانات المحلية المحفوظة</span>
    </div>
  );
};
