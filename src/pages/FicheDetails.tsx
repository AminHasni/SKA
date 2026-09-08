import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, FileText, CheckCircle, Truck, PlayCircle, Printer, Edit, Trash2 } from "lucide-react";
import { FicheTravail } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

export default function FicheDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fiche, setFiche] = useState<FicheTravail | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchFiche();
  }, [id]);

  async function fetchFiche() {
    try {
      const res = await fetch(`/api/fiches/${id}`);
      if (res.ok) {
        setFiche(await res.json());
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const translateStatus = (statut: string) => {
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

  const handleDownloadPdf = async () => {
    window.open(`/api/fiches/${id}/pdf`, "_blank");
  };

  if (loading) return <div className="p-12 text-center text-stone-400 font-medium animate-pulse">{t("loading")}</div>;
  if (!fiche) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors">
        <ArrowLeft size={16} className={language === 'ar' ? 'rotate-180' : ''} /> {t("common.back")}
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200/80 dark:border-stone-800/80 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-white tracking-tight">{fiche.numero}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              fiche.statut === 'Terminée' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
              fiche.statut === 'En cours' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
              fiche.statut === 'Planifiée' || fiche.statut === 'Affectée' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
              'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}>
              {translateStatus(fiche.statut)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            {fiche.date_prevue ? new Date(fiche.date_prevue).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR') : '-'} - {fiche.type_travail}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button onClick={() => navigate(`/fiches/${fiche.id}/edit`)} className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-sm flex-1 sm:flex-initial">
            <Edit size={15} /> {t("common.edit")}
          </button>
          <button onClick={() => { 
            const msg = language === 'ar' ? 'هل أنت تأكد من إمكانية حذف أمر الشغل؟' : 'Voulez-vous vraiment supprimer cette fiche ?';
            if(window.confirm(msg)) { 
              fetch(`/api/fiches/${fiche.id}`, { method: 'DELETE' }).then(() => navigate('/')); 
            } 
          }} className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-red-700 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm flex-1 sm:flex-initial">
            <Trash2 size={15} /> {t("common.delete")}
          </button>
          <button onClick={handleDownloadPdf} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-stone-700 bg-white border border-stone-200 dark:bg-[#1C1C1B] dark:border-stone-800 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-sm w-full sm:w-auto">
            <Printer size={15} /> {language === 'ar' ? 'طباعة' : 'Imprimer'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white dark:bg-[#161615] p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest border-b border-stone-100 dark:border-stone-800/50 pb-3 mb-4">
              {language === 'ar' ? 'معلومات العميل' : 'Informations Client'}
            </h3>
            <div className="flex items-start gap-4">
              <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg"><MapPin className="text-stone-600 dark:text-stone-400" size={20}/></div>
              <div>
                <div className="font-semibold text-stone-900 dark:text-stone-100 text-lg">{fiche.societe?.nom}</div>
                <div className="text-stone-600 dark:text-stone-400 text-sm mt-1">{fiche.societe?.localisation}</div>
                <div className="text-stone-600 dark:text-stone-400 text-sm">{fiche.societe?.adresse}</div>
                <div className="text-stone-500 text-sm mt-2">{language === 'ar' ? 'المسؤول:' : 'Contact:'} {fiche.societe?.contact} ({fiche.societe?.telephone})</div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-[#161615] p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest border-b border-stone-100 dark:border-stone-800/50 pb-3 mb-4">
              {language === 'ar' ? 'العمل المطلوب' : 'Travail à effectuer'}
            </h3>
            <div className="flex items-start gap-4">
              <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg"><FileText className="text-stone-600 dark:text-stone-400" size={20}/></div>
              <div className="w-full">
                <div className="font-semibold text-stone-900 dark:text-stone-100 mb-2">{fiche.type_travail} <span className="text-xs font-normal bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded-full ms-2">{fiche.priorite}</span></div>
                {(fiche.metrage || fiche.cout) && (
                  <div className="flex gap-4 mb-4 text-sm text-stone-600 dark:text-stone-400">
                    {fiche.metrage && <div><strong className="text-stone-900 dark:text-stone-300">{language === 'ar' ? 'القياس / الكمية:' : 'Métrage / Quantité:'}</strong> {fiche.metrage}</div>}
                    {fiche.cout && <div><strong className="text-stone-900 dark:text-stone-300">{language === 'ar' ? 'السعر المقدر:' : 'Coût Estimé:'}</strong> {fiche.cout} {t("common.dt")}</div>}
                  </div>
                )}
                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-4">{fiche.description}</p>
                {fiche.instructions && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3">
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-500 uppercase mb-1 block">{language === 'ar' ? 'تعليمات وملاحظات' : 'Instructions'}</span>
                    <p className="text-sm text-amber-900 dark:text-amber-400/80">{fiche.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-stone-50 dark:bg-[#1C1C1B] p-6 rounded-xl border border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest border-b border-stone-200 dark:border-stone-800 pb-3 mb-4">
              {language === 'ar' ? 'الفريق المكلّف' : 'Équipe Affectée'}
            </h3>
            <div className="flex items-center gap-3">
              <div className="bg-stone-200 dark:bg-stone-700 p-2 rounded-full"><Truck size={16} className="text-stone-600 dark:text-stone-300"/></div>
              <div>
                <div className="font-medium text-stone-900 dark:text-stone-100 text-sm">{fiche.equipe?.nom_chauffeur}</div>
                <div className="text-xs text-stone-500">{fiche.equipe?.vehicule}</div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-[#161615] p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest border-b border-stone-100 dark:border-stone-800/50 pb-3 mb-4">
              {language === 'ar' ? 'التسلسل الزمني' : 'Chronologie'}
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">{language === 'ar' ? 'المبرمج يوم' : 'Prévu le'}</span>
                <span className="font-medium text-stone-900 dark:text-stone-100">{fiche.date_prevue ? new Date(fiche.date_prevue).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{language === 'ar' ? 'الانطلاق' : 'Départ'}</span>
                <span className="font-medium text-stone-900 dark:text-stone-100">{fiche.heure_depart_prevue || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{language === 'ar' ? 'البدء' : 'Début'}</span>
                <span className="font-medium text-stone-900 dark:text-stone-100">{fiche.heure_debut_prevue || "—"}</span>
              </div>
              
              <div className="border-t border-stone-100 dark:border-stone-800/50 my-4 pt-4"></div>
              
              <div className="flex justify-between">
                <span className="text-stone-500">{language === 'ar' ? 'البدء الفعلي' : 'Début Réel'}</span>
                <span className="font-medium text-stone-900 dark:text-stone-100">{fiche.heure_debut_reelle || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{language === 'ar' ? 'النهاية الفعلية' : 'Fin Réelle'}</span>
                <span className="font-medium text-stone-900 dark:text-stone-100">{fiche.heure_fin_reelle || "—"}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
