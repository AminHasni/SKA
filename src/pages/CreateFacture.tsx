import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Clock, Ruler, Package, Tag, Check } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export type TypeFacturation = "forfait" | "horaire" | "metrage" | "unite";

interface FactureLigneInput {
  id?: string;
  description: string;
  quantite: number;
  unite: string;
  prix_unitaire: number;
  type_facturation: TypeFacturation;
}

export default function CreateFacture() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [clientNom, setClientNom] = useState("");
  const [clientAdresse, setClientAdresse] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientTelephone, setClientTelephone] = useState("");

  const [dateFacture, setDateFacture] = useState(new Date().toISOString().split('T')[0]);
  const [tauxTva, setTauxTva] = useState<number>(19);
  const [statut, setStatut] = useState<"Brouillon" | "Validée" | "Envoyée" | "Payée" | "Annulée">("Brouillon");

  const [lignes, setLignes] = useState<FactureLigneInput[]>([
    { description: "", quantite: 1, unite: "Forfait", prix_unitaire: 100, type_facturation: "forfait" }
  ]);

  const [loading, setLoading] = useState(isEditMode);

  const detectTypeFromUnit = (typeStr?: string, uniteStr?: string): TypeFacturation => {
    if (typeStr === 'forfait' || typeStr === 'horaire' || typeStr === 'metrage' || typeStr === 'unite') {
      return typeStr as TypeFacturation;
    }
    if (typeStr === 'HOURLY') return 'horaire';
    if (typeStr === 'FIXED') return 'forfait';

    const u = (uniteStr || '').toLowerCase();
    if (u.includes('forfait')) return 'forfait';
    if (u.includes('heure') || u.includes('h')) return 'horaire';
    if (u.includes('m²') || u.includes('m2') || u.includes('mèt') || u.includes('ml') || u.includes('m3') || u.includes('m')) return 'metrage';
    return 'unite';
  };

  useEffect(() => {
    if (isEditMode) {
      fetch(`/api/factures/${id}`)
        .then(res => {
          if (!res.ok) throw new Error("Non trouvée");
          return res.json();
        })
        .then(data => {
          setClientNom(data.client_nom || "");
          setClientAdresse(data.client_adresse || "");
          setClientContact(data.client_contact || "");
          setClientTelephone(data.client_telephone || "");
          setDateFacture(data.date_facture ? data.date_facture.split('T')[0] : new Date().toISOString().split('T')[0]);
          setTauxTva(data.taux_tva ?? 19);
          setStatut(data.statut || "Brouillon");

          if (data.lignes && data.lignes.length > 0) {
            setLignes(data.lignes.map((l: any) => ({
              id: l.id,
              description: l.description || "",
              quantite: l.quantite || 1,
              unite: l.unite || "Unité",
              prix_unitaire: l.prix_unitaire || 0,
              type_facturation: detectTypeFromUnit(l.type_facturation, l.unite)
            })));
          }
        })
        .catch(err => {
          console.error(err);
          navigate("/factures");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode, navigate]);

  const handleAddLine = () => {
    setLignes([...lignes, { 
      description: "", 
      quantite: 1, 
      unite: language === 'ar' ? 'وحدة' : 'Unité', 
      prix_unitaire: 0, 
      type_facturation: "unite" 
    }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lignes.length === 1) return;
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const handleTypeChange = (index: number, newType: TypeFacturation) => {
    const updated = [...lignes];
    updated[index].type_facturation = newType;
    if (newType === 'forfait') updated[index].unite = language === 'ar' ? 'جزافي' : 'Forfait';
    else if (newType === 'horaire') updated[index].unite = language === 'ar' ? 'ساعة' : 'Heure';
    else if (newType === 'metrage') updated[index].unite = language === 'ar' ? 'م²' : 'm²';
    else if (newType === 'unite') updated[index].unite = language === 'ar' ? 'وحدة' : 'Unité';
    setLignes(updated);
  };

  const handleLineChange = (index: number, field: keyof FactureLigneInput, value: any) => {
    const updated = [...lignes];
    updated[index] = { ...updated[index], [field]: value };
    setLignes(updated);
  };

  const totalHt = lignes.reduce((acc, line) => acc + (line.quantite * line.prix_unitaire), 0);
  const totalTva = totalHt * (tauxTva / 100);
  const totalTtc = totalHt + totalTva;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode ? `/api/factures/${id}` : "/api/factures";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_nom: clientNom,
          client_adresse: clientAdresse,
          client_contact: clientContact,
          client_telephone: clientTelephone,
          date_facture: dateFacture,
          taux_tva: tauxTva,
          statut,
          lignes
        })
      });

      if (res.ok) {
        const data = await res.json();
        navigate(`/factures/${data.id}`);
      }
    } catch (err) {
      console.error("Error saving facture:", err);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-stone-400 font-medium animate-pulse">{t("loading")}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <button 
        onClick={() => navigate("/factures")}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
      >
        <ArrowLeft size={16} className={language === 'ar' ? 'rotate-180' : ''} />
        <span>{t("common.back")}</span>
      </button>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-white tracking-tight">
            {isEditMode 
              ? (language === 'ar' ? 'تعديل الفاتورة' : 'Modifier la Facture') 
              : (language === 'ar' ? 'إنشاء فاتورة جديدة' : 'Nouvelle Facture')}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1">
            {language === 'ar' 
              ? 'قم بتضمين التفاصيل وقائمة الخدمات وطريقة الفوترة' 
              : 'Saisie complète des détails, articles et modes de facturation.'}
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Client Info */}
        <div className="bg-white dark:bg-[#161615] rounded-2xl border border-stone-200 dark:border-stone-800/60 p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800/80 pb-3">
            {language === 'ar' ? 'معلومات العميل' : 'Informations Client'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                {language === 'ar' ? 'اسم العميل / الشركة *' : 'Nom du Client / Raison Sociale *'}
              </label>
              <input
                type="text"
                required
                className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                value={clientNom}
                onChange={(e) => setClientNom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                {language === 'ar' ? 'المسؤول' : 'Contact'}
              </label>
              <input
                type="text"
                className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                {language === 'ar' ? 'الهاتف' : 'Téléphone'}
              </label>
              <input
                type="tel"
                className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                value={clientTelephone}
                onChange={(e) => setClientTelephone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                {language === 'ar' ? 'العنوان' : 'Adresse'}
              </label>
              <input
                type="text"
                className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                value={clientAdresse}
                onChange={(e) => setClientAdresse(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Facture Details */}
        <div className="bg-white dark:bg-[#161615] rounded-2xl border border-stone-200 dark:border-stone-800/60 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800/80 pb-3 mb-4">
            {t("factures.details")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                {language === 'ar' ? 'تاريخ الفاتورة' : 'Date de Facturation'}
              </label>
              <input
                type="date"
                required
                className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                value={dateFacture}
                onChange={(e) => setDateFacture(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                {language === 'ar' ? 'نسبة الأداء على القيمة المضافة TVA (%)' : 'Taux TVA (%)'}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                value={tauxTva}
                onChange={(e) => setTauxTva(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                {t("common.status")}
              </label>
              <select
                className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                value={statut}
                onChange={(e) => setStatut(e.target.value as any)}
              >
                <option value="Brouillon">{t("factures.status.brouillon")}</option>
                <option value="Validée">{t("factures.status.validee")}</option>
                <option value="Envoyée">{t("factures.status.envoyee")}</option>
                <option value="Payée">{t("factures.status.payee")}</option>
                <option value="Annulée">{t("factures.status.annulee")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prestations & Articles Facturés */}
        <div className="bg-white dark:bg-[#161615] rounded-2xl border border-stone-200 dark:border-stone-800/60 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800/80">
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                {language === 'ar' ? 'قائمة الخدمات والمواد' : 'Prestations & Articles Facturés'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {language === 'ar' 
                  ? 'اختر طريقة الفوترة المناسبة (جزافي، حسب الساعة، حسب القياس أو بالقطعة)' 
                  : 'Cochez le type de facturation approprié (Forfait, Horaire, Métrage ou Unité) pour chaque ligne.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddLine}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 rounded-xl transition-colors shadow-sm self-start sm:self-auto"
            >
              <Plus size={15} /> {language === 'ar' ? 'إضافة سطر' : 'Ajouter une ligne'}
            </button>
          </div>

          <div className="space-y-6">
            {lignes.map((line, idx) => {
              const currentType = line.type_facturation || "unite";

              return (
                <div 
                  key={idx} 
                  className="bg-stone-50/80 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 rounded-2xl p-5 space-y-4 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-200/60 dark:border-stone-800/60">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {language === 'ar' ? 'طريقة الفوترة:' : 'Type de Facturation :'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTypeChange(idx, "forfait")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          currentType === "forfait"
                            ? "bg-emerald-600 text-white shadow-sm font-semibold"
                            : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800"
                        }`}
                      >
                        <Package size={14} />
                        <span>{language === 'ar' ? 'مبلغ جزافي' : 'Forfait'}</span>
                        {currentType === "forfait" && <Check size={12} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTypeChange(idx, "horaire")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          currentType === "horaire"
                            ? "bg-blue-600 text-white shadow-sm font-semibold"
                            : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800"
                        }`}
                      >
                        <Clock size={14} />
                        <span>{language === 'ar' ? 'بالساعة' : 'Par Horaire'}</span>
                        {currentType === "horaire" && <Check size={12} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTypeChange(idx, "metrage")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          currentType === "metrage"
                            ? "bg-purple-600 text-white shadow-sm font-semibold"
                            : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800"
                        }`}
                      >
                        <Ruler size={14} />
                        <span>{language === 'ar' ? 'بالقياس' : 'Par Métrage'}</span>
                        {currentType === "metrage" && <Check size={12} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTypeChange(idx, "unite")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          currentType === "unite"
                            ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm font-semibold"
                            : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800"
                        }`}
                      >
                        <Tag size={14} />
                        <span>{language === 'ar' ? 'بالقطعة' : 'Par Unité'}</span>
                        {currentType === "unite" && <Check size={12} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        disabled={lignes.length === 1}
                        title="Supprimer cette ligne"
                        className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-5">
                      <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                        {language === 'ar' ? 'الوصف *' : 'Description *'}
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                        value={line.description}
                        onChange={(e) => handleLineChange(idx, "description", e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                        {language === 'ar' ? 'الكمية' : 'Quantité'}
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        required
                        className="w-full bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-400 text-center font-medium"
                        value={line.quantite}
                        onChange={(e) => handleLineChange(idx, "quantite", parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                        {language === 'ar' ? 'الوحدة' : 'Unité'}
                      </label>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-400"
                        value={line.unite}
                        onChange={(e) => handleLineChange(idx, "unite", e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                        {language === 'ar' ? 'السعر (د.ت)' : 'Prix Unitaire (DT)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        className="w-full bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-400 text-end font-medium"
                        value={line.prix_unitaire}
                        onChange={(e) => handleLineChange(idx, "prix_unitaire", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200/40 dark:border-stone-800/40 flex justify-between items-center text-xs">
                    <span className="text-stone-500 dark:text-stone-400">
                      {line.quantite || 0} {line.unite} × {(line.prix_unitaire || 0).toFixed(3)} DT
                    </span>
                    <div className="text-stone-900 dark:text-stone-100 font-bold text-sm">
                      {language === 'ar' ? 'المجموع صافي HT:' : 'Total HT:'} <span className="text-emerald-600 dark:text-emerald-400">{(line.quantite * line.prix_unitaire).toFixed(3)} DT</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-end">
            <div className="w-full md:w-80 bg-stone-50 dark:bg-[#1C1C1B] p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 text-sm">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>{language === 'ar' ? 'المجموع صافي HT:' : 'Total HT :'}</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{totalHt.toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>TVA ({tauxTva}%) :</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{totalTva.toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-800">
                <span>{language === 'ar' ? 'المجموع الشامل TTC:' : 'Total TTC :'}</span>
                <span className="text-emerald-600 dark:text-emerald-400">{totalTtc.toFixed(3)} DT</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/factures")}
            className="px-6 py-3 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-sm"
          >
            <Save size={16} />
            <span>{isEditMode 
              ? (language === 'ar' ? 'حفظ التغييرات' : 'Enregistrer les modifications') 
              : (language === 'ar' ? 'إصدار الفاتورة' : 'Créer la Facture')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
