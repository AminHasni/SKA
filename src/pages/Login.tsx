import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, KeyRound, Globe } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, loginDemo } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await login(username, password);
    setSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || (language === 'ar' ? 'معلومات الدخول غير صحيحة' : 'Identifiants administrateur incorrects'));
    }
  };

  const handleQuickDemoLogin = (role: "admin" | "agent" = "admin") => {
    loginDemo(role);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] dark:bg-[#111110] flex items-center justify-center p-4 relative">
      {/* Top Right Language Switcher on Login Page */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold shadow-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          <Globe size={16} />
          <span>{language === 'fr' ? 'العربية' : 'Français'}</span>
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-display font-bold text-2xl items-center justify-center rounded-2xl shadow-md">
            K
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              {t("app.title")}
            </h1>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1 flex items-center justify-center gap-1.5">
              <ShieldCheck size={15} /> {language === 'ar' ? 'مصادقة المدير المسؤول' : 'Authentification Administrateur'}
            </p>
          </div>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("admin")}
            disabled={submitting}
            className="w-full p-4 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-start transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <KeyRound size={18} />
              </div>
              <div>
                <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  {language === 'ar' ? '⚡ دخول سريع - حساب ديمو مدير (نقرة واحدة)' : '⚡ Compte Démo Administrateur (Accès Direct 1-Clic)'}
                </span>
                <span className="block text-[11px] text-emerald-700 dark:text-emerald-400">
                  {language === 'ar' ? 'دخول فوري بدون حاجة للاتصال بالشبكة' : 'Connexion instantanée sans erreur réseau'}
                </span>
              </div>
            </div>
            <ArrowRight size={18} className={`text-emerald-700 dark:text-emerald-300 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                {language === 'ar' ? 'اسم المستخدم (المدير)' : 'Identifiant Administrateur'}
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-lg py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                {language === 'ar' ? 'كلمة السر' : 'Mot de passe'}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-lg py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-semibold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <span>{submitting 
                ? (language === 'ar' ? 'جاري الدخول...' : 'Connexion en cours...') 
                : (language === 'ar' ? 'تسجيل الدخول كمدير' : 'Se connecter en tant qu\'Admin')}</span>
              <ArrowRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
            </button>
          </form>

          {/* Credentials Info Footer */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80 text-center space-y-1 text-[11px] text-stone-400">
            <p className="font-medium text-stone-600 dark:text-stone-300">
              {language === 'ar' ? 'حساب الديمو والمدير:' : 'Identifiants de Démo / Admin :'}
            </p>
            <p className="font-mono text-stone-500 dark:text-stone-400">
              {language === 'ar' ? 'admin / admin123  أو  demo / demo123' : 'admin / admin123  ou  demo / demo123'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
