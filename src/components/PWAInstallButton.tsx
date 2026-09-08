import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle } from 'lucide-react';

export const PWAInstallButton: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        title="Installer l'application"
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm w-full ${
          isCollapsed ? "justify-center px-0" : ""
        }`}
      >
        <Download size={18} className="shrink-0 animate-bounce" />
        {!isCollapsed && <span>Installer l'application</span>}
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          title="Installer sur iPhone/iPad"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs transition-all shadow-sm w-full ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
        >
          <Smartphone size={18} className="shrink-0" />
          {!isCollapsed && <span>Installer sur iOS</span>}
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 dark:bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Smartphone size={18} className="text-emerald-500" />
                  Installer sur iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <ol className="space-y-3 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                  <span>Appuyez sur le bouton <strong>Partager</strong> <span className="text-base">⎘</span> dans Safari.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                  <span>Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                  <span>Validez en appuyant sur <strong>Ajouter</strong> en haut à droite.</span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs"
              >
                J'ai compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={() => alert("Pour installer l'application sur votre appareil, cliquez sur 'Ajouter à l'écran d'accueil' ou sur l'icône d'installation dans la barre d'adresse de votre navigateur.")}
      title="Application Cross-Plateforme"
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium text-xs transition-all w-full ${
        isCollapsed ? "justify-center px-0" : ""
      }`}
    >
      <Download size={16} className="shrink-0 text-stone-500" />
      {!isCollapsed && <span>App Cross-Plateforme</span>}
    </button>
  );
};
