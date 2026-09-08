import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Download, Edit, Trash2, MapPin, Phone, User, Calendar } from "lucide-react";
import { Facture } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

export default function FactureDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facture, setFacture] = useState<Facture | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchFacture();
  }, [id]);

  async function fetchFacture() {
    try {
      const res = await fetch(`/api/factures/${id}`);
      if (res.ok) {
        setFacture(await res.json());
      } else {
        navigate("/factures");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/factures/${id}`, { method: "DELETE" });
      if (res.ok) {
        navigate("/factures");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(amount || 0);
  };

  const translateStatus = (statut: string) => {
    switch (statut) {
      case "Brouillon": return t("factures.status.brouillon");
      case "Validée": return t("factures.status.validee");
      case "Envoyée": return t("factures.status.envoyee");
      case "Payée": return t("factures.status.payee");
      case "Annulée": return t("factures.status.annulee");
      default: return statut;
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await fetch(`/api/factures/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: status })
      });
      fetchFacture();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPdf = () => {
    window.open(`/api/factures/${id}/pdf`, "_blank");
  };

  if (loading) return <div className="p-12 text-center text-stone-400 font-medium animate-pulse">{t("loading")}</div>;
  if (!facture) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={() => navigate("/factures")} className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-2">
            <ArrowLeft size={16} className={language === 'ar' ? 'rotate-180' : ''} /> {language === 'ar' ? 'الرجوع للفواتير' : 'Retour aux factures'}
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-white tracking-tight">
              {language === 'ar' ? `فاتورة رقم ${facture.numero}` : `Facture ${facture.numero}`}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              facture.statut === 'Validée' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 border-blue-200' :
              facture.statut === 'Envoyée' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 border-purple-200' :
              facture.statut === 'Payée' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 border-emerald-200' :
              facture.statut === 'Annulée' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 border-red-200' :
              'bg-stone-100 dark:bg-stone-800 text-stone-700 border-stone-200'
            }`}>
              {translateStatus(facture.statut)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link
            to={`/factures/${id}/edit`}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-800 bg-white dark:bg-[#1C1C1B] dark:text-stone-200 border border-stone-200 dark:border-stone-800 rounded-xl hover:bg-stone-50 transition-colors shadow-sm flex-1 sm:flex-initial"
          >
            <Edit size={15} /> {t("common.edit")}
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-100 transition-colors shadow-sm flex-1 sm:flex-initial"
          >
            <Trash2 size={15} /> {t("common.delete")}
          </button>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-xl hover:bg-stone-800 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Download size={15} /> {t("factures.download_pdf")}
          </button>
        </div>
      </header>

      {/* Action status change bar */}
      <div className="mb-8 p-4 bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          {language === 'ar' ? 'تغيير الحالة :' : 'Changer le statut :'}
        </span>
        <div className="flex flex-wrap gap-2">
          {facture.statut === 'Brouillon' && (
            <button onClick={() => updateStatus('Validée')} className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
              {language === 'ar' ? 'تأكيد الفاتورة' : 'Valider la facture'}
            </button>
          )}
          {facture.statut === 'Validée' && (
            <button onClick={() => updateStatus('Envoyée')} className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors">
              {language === 'ar' ? 'تحديد كمرسلة' : 'Marquer comme Envoyée'}
            </button>
          )}
          {(facture.statut === 'Validée' || facture.statut === 'Envoyée') && (
            <button onClick={() => updateStatus('Payée')} className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors">
              {language === 'ar' ? 'تحديد كمدفوعة' : 'Marquer comme Payée'}
            </button>
          )}
          {facture.statut !== 'Annulée' && facture.statut !== 'Payée' && (
            <button onClick={() => updateStatus('Annulée')} className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">
              {t("common.cancel")}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="bg-white dark:bg-[#161615] rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800/60 p-5 sm:p-8">
            {/* Table of lines */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-start">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800">
                    <th className="pb-3 text-xs font-bold text-stone-400 uppercase text-start">
                      {language === 'ar' ? 'الخدمة / المادة' : 'Prestation / Produit'}
                    </th>
                    <th className="pb-3 text-xs font-bold text-stone-400 uppercase text-end">
                      {language === 'ar' ? 'الكمية' : 'Qté'}
                    </th>
                    <th className="pb-3 text-xs font-bold text-stone-400 uppercase text-end">
                      {language === 'ar' ? 'الوحدة' : 'Unité'}
                    </th>
                    <th className="pb-3 text-xs font-bold text-stone-400 uppercase text-end">
                      {language === 'ar' ? 'سعر الوحدة' : 'Prix U.'}
                    </th>
                    <th className="pb-3 text-xs font-bold text-stone-400 uppercase text-end">
                      {t("common.total")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50">
                  {facture.lignes?.map(ligne => {
                    const typeLabel = 
                      ligne.type_facturation === 'forfait' ? (language === 'ar' ? 'جزافي' : 'Forfait') :
                      ligne.type_facturation === 'horaire' ? (language === 'ar' ? 'بالساعة' : 'Horaire') :
                      ligne.type_facturation === 'metrage' ? (language === 'ar' ? 'بالقياس' : 'Métrage') : (language === 'ar' ? 'بالقطعة' : 'Unité');

                    return (
                      <tr key={ligne.id}>
                        <td className="py-4 text-sm font-medium text-stone-900 dark:text-stone-100">
                          <div className="flex flex-col gap-0.5">
                            <span>{ligne.description}</span>
                            <span className="inline-flex self-start px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                              {typeLabel}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-stone-600 dark:text-stone-400 text-end">{ligne.quantite}</td>
                        <td className="py-4 text-sm text-stone-600 dark:text-stone-400 text-end">{ligne.unite || (language === 'ar' ? 'قطعة' : 'Unité')}</td>
                        <td className="py-4 text-sm text-stone-600 dark:text-stone-400 text-end">{formatCurrency(ligne.prix_unitaire)}</td>
                        <td className="py-4 text-sm font-medium text-stone-900 dark:text-stone-100 text-end">{formatCurrency(ligne.total_ligne)}</td>
                      </tr>
                    );
                  })}
                  {(!facture.lignes || facture.lignes.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-400 text-sm">
                        {language === 'ar' ? 'لا توجد أسطر في هذه الفاتورة' : 'Aucune ligne de facture'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-1/2 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">{language === 'ar' ? 'المجموع صافي HT' : 'Total HT'}</span>
                  <span className="font-medium text-stone-900 dark:text-stone-100">{formatCurrency(facture.total_ht)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">TVA ({facture.taux_tva}%)</span>
                  <span className="font-medium text-stone-900 dark:text-stone-100">{formatCurrency(facture.total_tva)}</span>
                </div>
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center">
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{language === 'ar' ? 'المجموع الشامل TTC' : 'Total TTC'}</span>
                  <span className="text-2xl font-display font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(facture.total_ttc)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#161615] rounded-xl shadow-sm border border-stone-200 dark:border-stone-800/60 p-6 space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              {language === 'ar' ? 'معلومات العميل' : 'Informations Client'}
            </h3>
            <div className="text-sm space-y-3">
              <div className="font-bold text-base text-stone-900 dark:text-stone-100">
                {facture.client_nom || (language === 'ar' ? 'عميل غير محدد' : 'Client non spécifié')}
              </div>
              {facture.client_adresse && (
                <div className="text-stone-600 dark:text-stone-400 flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-stone-400" />
                  <span>{facture.client_adresse}</span>
                </div>
              )}
              {facture.client_contact && (
                <div className="text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <User size={16} className="shrink-0 text-stone-400" />
                  <span>{facture.client_contact}</span>
                </div>
              )}
              {facture.client_telephone && (
                <div className="text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <Phone size={16} className="shrink-0 text-stone-400" />
                  <span>{facture.client_telephone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#161615] rounded-xl shadow-sm border border-stone-200 dark:border-stone-800/60 p-6 space-y-3">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              {language === 'ar' ? 'تاريخ الفاتورة' : 'Date de Facturation'}
            </h3>
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
              <Calendar size={16} className="text-stone-400" />
              {facture.date_facture ? new Date(facture.date_facture).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161615] rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
              {language === 'ar' ? 'حذف الفاتورة' : 'Supprimer la facture'}
            </h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm mb-6">
              {language === 'ar' 
                ? `هل أنت تأكد من إمكانية حذف الفاتورة ${facture.numero}؟ هذا الإجراء غير قابل للتراجع.` 
                : `Êtes-vous sûr de vouloir supprimer la facture ${facture.numero} ? Cette action est irréversible.`}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button 
                onClick={handleDelete}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
