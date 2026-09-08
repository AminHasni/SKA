import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language } = useLanguage();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500 text-stone-900 font-semibold px-4 py-2.5 text-xs shadow-xl animate-fade-in border border-amber-400">
      <WifiOff size={16} className="shrink-0 animate-pulse" />
      <span>
        {language === 'ar' 
          ? 'وضع عدم الاتصال — البيانات محفوظة محلياً' 
          : 'Mode Hors Ligne — Données enregistrées localement'}
      </span>
    </div>
  );
};
