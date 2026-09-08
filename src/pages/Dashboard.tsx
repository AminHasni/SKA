import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  PlusCircle, 
  FilePlus, 
  ClipboardList, 
  Receipt, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  Calendar,
  Building2,
  ChevronRight,
  Printer
} from "lucide-react";
import { FicheTravail, Facture } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

export default function Dashboard() {
  const [fiches, setFiches] = useState<FicheTravail[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [resFiches, resFactures] = await Promise.all([
          fetch("/api/fiches"),
          fetch("/api/factures")
        ]);

        if (resFiches.ok) {
          const dataFiches = await resFiches.json();
          setFiches(dataFiches);
        }

        if (resFactures.ok) {
          const dataFactures = await resFactures.json();
          setFactures(dataFactures);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(amount || 0);
  };

  const currentDateFormatted = new Date().toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const translateFicheStatus = (statut: string) => {
    switch (statut) {
      case "Brouillon": return t("fiches.status.brouillon");
      case "Planifiée":
      case "Affectée": return t("fiches.status.planifiee");
      case "En route": return t("fiches.status.en_route");
      case "En cours": return t("fiches.status.en_cours");
      case "Terminée": return t("fiches.status.terminee");
      case "Annulée": return t("fiches.status.annulee");
      default: return statut;
    }
  };

  const translateFactureStatus = (statut: string) => {
    switch (statut) {
      case "Brouillon": return t("factures.status.brouillon");
      case "Validée": return t("factures.status.validee");
      case "Envoyée": return t("factures.status.envoyee");
      case "Payée": return t("factures.status.payee");
      case "Annulée": return t("factures.status.annulee");
      default: return statut;
    }
  };

  if (loading) {
    return (
      <div className="p-8 md:p-12 text-center text-stone-400 dark:text-stone-500 font-medium animate-pulse">
        {t("loading")}
      </div>
    );
  }

  // --- Statistics Calculations ---
  const totalFacturesCount = factures.length;
  const totalEncaisse = factures.filter(f => f.statut === 'Payée').reduce((acc, f) => acc + (f.total_ttc || 0), 0);
  const countPayees = factures.filter(f => f.statut === 'Payée').length;

  const totalAttente = factures.filter(f => ['Validée', 'Envoyée'].includes(f.statut)).reduce((acc, f) => acc + (f.total_ttc || 0), 0);
  const countAttente = factures.filter(f => ['Validée', 'Envoyée'].includes(f.statut)).length;

  const countBrouillonsFactures = factures.filter(f => f.statut === 'Brouillon').length;
  const countAnnuleesFactures = factures.filter(f => f.statut === 'Annulée').length;

  // Fiches stats
  const totalFichesCount = fiches.length;
  const countFichesActives = fiches.filter(f => ['Planifiée', 'En route', 'En cours'].includes(f.statut)).length;
  const countFichesTerminees = fiches.filter(f => f.statut === 'Terminée').length;
  const countFichesPlanifiees = fiches.filter(f => f.statut === 'Planifiée').length;
  const countFichesEnRoute = fiches.filter(f => f.statut === 'En route').length;
  const countFichesEnCours = fiches.filter(f => f.statut === 'En cours').length;
  const countFichesBrouillon = fiches.filter(f => f.statut === 'Brouillon').length;
  const countFichesAnnulees = fiches.filter(f => f.statut === 'Annulée').length;

  const completionRate = totalFichesCount > 0 ? Math.round((countFichesTerminees / totalFichesCount) * 100) : 0;

  // Recent 5 items
  const recentFiches = fiches.slice(0, 5);
  const recentFactures = factures.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 sm:space-y-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/80 dark:border-stone-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-1">
            <Calendar size={14} className="text-stone-400" />
            <span className="capitalize">{currentDateFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-white tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1">
            {t("dashboard.subtitle")}
          </p>
        </div>
      </header>

      {/* Boutons Rapides / Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
          {t("dashboard.quick_actions")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/fiches/new"
            className="group flex items-center justify-between p-4 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 rounded-xl transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-white/10 dark:bg-stone-900/10">
                <PlusCircle size={20} />
              </div>
              <div>
                <span className="block font-semibold text-sm leading-snug">{t("dashboard.btn_new_fiche")}</span>
                <span className="text-[11px] text-stone-300 dark:text-stone-600">{t("dashboard.sub_new_fiche")}</span>
              </div>
            </div>
            <ArrowUpRight size={18} className={`text-stone-400 dark:text-stone-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ${language === 'ar' ? '-scale-x-100' : ''}`} />
          </Link>

          <Link
            to="/factures/new"
            className="group flex items-center justify-between p-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-white/10">
                <FilePlus size={20} />
              </div>
              <div>
                <span className="block font-semibold text-sm leading-snug">{t("dashboard.btn_new_facture")}</span>
                <span className="text-[11px] text-emerald-100">{t("dashboard.sub_new_facture")}</span>
              </div>
            </div>
            <ArrowUpRight size={18} className={`text-emerald-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ${language === 'ar' ? '-scale-x-100' : ''}`} />
          </Link>

          <Link
            to="/fiches"
            className="group flex items-center justify-between p-4 bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/80 hover:border-stone-400 dark:hover:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                <ClipboardList size={20} />
              </div>
              <div>
                <span className="block font-semibold text-sm leading-snug">{t("dashboard.btn_view_fiches")}</span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">{totalFichesCount} {t("dashboard.sub_total_fiches")}</span>
              </div>
            </div>
            <ArrowUpRight size={18} className={`text-stone-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ${language === 'ar' ? '-scale-x-100' : ''}`} />
          </Link>

          <Link
            to="/factures"
            className="group flex items-center justify-between p-4 bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/80 hover:border-stone-400 dark:hover:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                <Receipt size={20} />
              </div>
              <div>
                <span className="block font-semibold text-sm leading-snug">{t("dashboard.btn_view_factures")}</span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">{totalFacturesCount} {t("dashboard.sub_total_factures")}</span>
              </div>
            </div>
            <ArrowUpRight size={18} className={`text-stone-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ${language === 'ar' ? '-scale-x-100' : ''}`} />
          </Link>
        </div>
      </section>

      {/* Statistiques Clés */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
          {t("dashboard.stats_overview")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: CA Encaissé */}
          <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/60 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {t("dashboard.stat_ca_encaisse")}
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-display font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalEncaisse)}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {countPayees} {language === 'ar' ? 'فاتورة خُصّمت / مدفوعة' : 'facture(s) réglée(s)'}
              </p>
            </div>
          </div>

          {/* Card 2: Factures en attente */}
          <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/60 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {t("dashboard.stat_factures_attente")}
              </span>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                <Clock size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-display font-semibold text-amber-600 dark:text-amber-400">
                {formatCurrency(totalAttente)}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {countAttente} {language === 'ar' ? 'فاتورة قيد الاستخلاص' : 'facture(s) à recouvrir'}
              </p>
            </div>
          </div>

          {/* Card 3: Interventions Actives */}
          <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/60 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {t("dashboard.stat_fiches_actives")}
              </span>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <AlertCircle size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-display font-semibold text-blue-600 dark:text-blue-400">
                {countFichesActives}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {language === 'ar' ? 'مبرمجة، في الطريق أو بصدد الإنجاز' : 'Planifiées, en route ou en cours'}
              </p>
            </div>
          </div>

          {/* Card 4: Taux de Réalisation */}
          <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/60 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {t("dashboard.stat_fiches_terminees")}
              </span>
              <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-display font-semibold text-stone-900 dark:text-stone-100">
                {countFichesTerminees} <span className="text-sm font-normal text-stone-500">({completionRate}%)</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {language === 'ar' ? 'من أصل' : 'Sur'} {totalFichesCount} {language === 'ar' ? 'تدخل(ات)' : 'intervention(s)'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progress & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fiches breakdown */}
        <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/60 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              {t("dashboard.status_breakdown")}
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              {language === 'ar' ? 'المجموع :' : 'Total :'} {totalFichesCount}
            </span>
          </div>

          <div className="space-y-4">
            {/* Terminee */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-emerald-700 dark:text-emerald-400">{t("fiches.status.terminee")}</span>
                <span className="text-stone-600 dark:text-stone-400">{countFichesTerminees} ({totalFichesCount ? Math.round((countFichesTerminees / totalFichesCount)*100) : 0}%)</span>
              </div>
              <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalFichesCount ? (countFichesTerminees / totalFichesCount)*100 : 0}%` }}
                />
              </div>
            </div>

            {/* En cours */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-amber-700 dark:text-amber-400">{t("fiches.status.en_cours")}</span>
                <span className="text-stone-600 dark:text-stone-400">{countFichesEnCours} ({totalFichesCount ? Math.round((countFichesEnCours / totalFichesCount)*100) : 0}%)</span>
              </div>
              <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalFichesCount ? (countFichesEnCours / totalFichesCount)*100 : 0}%` }}
                />
              </div>
            </div>

            {/* En route */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-purple-700 dark:text-purple-400">{t("fiches.status.en_route")}</span>
                <span className="text-stone-600 dark:text-stone-400">{countFichesEnRoute} ({totalFichesCount ? Math.round((countFichesEnRoute / totalFichesCount)*100) : 0}%)</span>
              </div>
              <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalFichesCount ? (countFichesEnRoute / totalFichesCount)*100 : 0}%` }}
                />
              </div>
            </div>

            {/* Planifiee */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-blue-700 dark:text-blue-400">{t("fiches.status.planifiee")}</span>
                <span className="text-stone-600 dark:text-stone-400">{countFichesPlanifiees} ({totalFichesCount ? Math.round((countFichesPlanifiees / totalFichesCount)*100) : 0}%)</span>
              </div>
              <div className="h-2 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${totalFichesCount ? (countFichesPlanifiees / totalFichesCount)*100 : 0}%` }}
                />
              </div>
            </div>

            {/* Brouillon & Annulee */}
            {(countFichesBrouillon > 0 || countFichesAnnulees > 0) && (
              <div className="pt-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800/60">
                <span>{language === 'ar' ? 'مسودات :' : 'Brouillons :'} <strong>{countFichesBrouillon}</strong></span>
                <span>{language === 'ar' ? 'ملغاة :' : 'Annulées :'} <strong>{countFichesAnnulees}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Factures breakdown */}
        <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/60 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              {t("dashboard.revenue_breakdown")}
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              {language === 'ar' ? 'المجموع :' : 'Total :'} {totalFacturesCount} {language === 'ar' ? 'فواتير' : 'factures'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
              <span className="block text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
                {language === 'ar' ? 'خالصة / مقبوضة' : 'Payées / Encaissées'}
              </span>
              <span className="text-lg font-bold text-emerald-900 dark:text-emerald-300">{formatCurrency(totalEncaisse)}</span>
              <span className="block text-[11px] text-emerald-600 dark:text-emerald-500 mt-1">{countPayees} {language === 'ar' ? 'فاتورة' : 'facture(s)'}</span>
            </div>

            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
              <span className="block text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1">
                {language === 'ar' ? 'في انتظار الدفع' : 'En Attente de Règlement'}
              </span>
              <span className="text-lg font-bold text-amber-900 dark:text-amber-300">{formatCurrency(totalAttente)}</span>
              <span className="block text-[11px] text-amber-600 dark:text-amber-500 mt-1">{countAttente} {language === 'ar' ? 'فاتورة' : 'facture(s)'}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
            <div>
              <span>{language === 'ar' ? 'مسودات :' : 'Brouillons :'} </span>
              <strong className="text-stone-900 dark:text-stone-100">{countBrouillonsFactures}</strong>
            </div>
            <div>
              <span>{language === 'ar' ? 'ملغاة :' : 'Annulées :'} </span>
              <strong className="text-stone-900 dark:text-stone-100">{countAnnuleesFactures}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Fiches */}
        <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/60 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-stone-200 dark:border-stone-800/60 flex items-center justify-between">
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              {t("dashboard.recent_fiches")}
            </h3>
            <Link to="/fiches" className="text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 flex items-center gap-1">
              {t("dashboard.view_all")} <ChevronRight size={14} className={language === 'ar' ? 'rotate-180' : ''} />
            </Link>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800/50">
            {recentFiches.map(fiche => (
              <div 
                key={fiche.id} 
                className="p-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1C1C1B] transition-colors group"
              >
                <Link to={`/fiches/${fiche.id}`} className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">{fiche.numero}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      fiche.statut === 'Terminée' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 border-emerald-200' :
                      fiche.statut === 'En cours' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 border-amber-200' :
                      fiche.statut === 'Planifiée' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 border-blue-200' :
                      'bg-stone-100 dark:bg-stone-800 text-stone-700 border-stone-200'
                    }`}>
                      {translateFicheStatus(fiche.statut)}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2 truncate">
                    <Building2 size={12} className="shrink-0" />
                    <span className="truncate">{fiche.societe?.nom || (language === 'ar' ? 'عميل غير محدد' : 'Client non renseigné')}</span>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="text-end">
                    <span className="block text-xs font-medium text-stone-600 dark:text-stone-400">
                      {fiche.date_prevue ? new Date(fiche.date_prevue).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR') : '-'}
                    </span>
                  </div>
                  <button
                    onClick={() => window.open(`/api/fiches/${fiche.id}/pdf`, "_blank")}
                    title={language === 'ar' ? 'طباعة' : 'Imprimer'}
                    className="p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    <Printer size={16} />
                  </button>
                  <Link to={`/fiches/${fiche.id}`} title="Voir">
                    <ChevronRight size={16} className={`text-stone-400 group-hover:translate-x-1 transition-transform inline-block ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            ))}

            {recentFiches.length === 0 && (
              <div className="p-8 text-center text-xs text-stone-400">
                {t("dashboard.no_fiches")}
              </div>
            )}
          </div>
        </div>

        {/* Recent Factures */}
        <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/60 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-stone-200 dark:border-stone-800/60 flex items-center justify-between">
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              {t("dashboard.recent_factures")}
            </h3>
            <Link to="/factures" className="text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 flex items-center gap-1">
              {t("dashboard.view_all")} <ChevronRight size={14} className={language === 'ar' ? 'rotate-180' : ''} />
            </Link>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800/50">
            {recentFactures.map(facture => (
              <div 
                key={facture.id} 
                className="p-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1C1C1B] transition-colors group"
              >
                <Link to={`/factures/${facture.id}`} className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">{facture.numero}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      facture.statut === 'Payée' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 border-emerald-200' :
                      ['Validée', 'Envoyée'].includes(facture.statut) ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 border-amber-200' :
                      'bg-stone-100 dark:bg-stone-800 text-stone-700 border-stone-200'
                    }`}>
                      {translateFactureStatus(facture.statut)}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                    {facture.client_nom || (language === 'ar' ? 'عميل غير محدد' : 'Client non spécifié')}
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <div className="text-end">
                    <span className="block font-bold text-sm text-stone-900 dark:text-stone-100">
                      {formatCurrency(facture.total_ttc)}
                    </span>
                    <span className="block text-[11px] text-stone-400">
                      {facture.date_facture ? new Date(facture.date_facture).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR') : '-'}
                    </span>
                  </div>
                  <button
                    onClick={() => window.open(`/api/factures/${facture.id}/pdf`, "_blank")}
                    title={language === 'ar' ? 'طباعة' : 'Imprimer'}
                    className="p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    <Printer size={16} />
                  </button>
                  <Link to={`/factures/${facture.id}`} title="Voir">
                    <ChevronRight size={16} className={`text-stone-400 group-hover:translate-x-1 transition-transform inline-block ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            ))}

            {recentFactures.length === 0 && (
              <div className="p-8 text-center text-xs text-stone-400">
                {t("dashboard.no_factures")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
