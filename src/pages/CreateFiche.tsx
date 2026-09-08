import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function CreateFiche() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [clientNom, setClientNom] = useState("");
  const [clientAdresse, setClientAdresse] = useState("");
  const [clientLocalisation, setClientLocalisation] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientTelephone, setClientTelephone] = useState("");
  
  const [equipeNom, setEquipeNom] = useState("");
  const [equipeVehicule, setEquipeVehicule] = useState("");

  const [datePrevue, setDatePrevue] = useState(new Date().toISOString().split('T')[0]);
  const [heureDepart, setHeureDepart] = useState("07:30");
  const [heureDebut, setHeureDebut] = useState("08:00");
  const [typeTravail, setTypeTravail] = useState("Maintenance");
  const [metrage, setMetrage] = useState("");
  const [cout, setCout] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [priorite, setPriorite] = useState("Normale");

  useEffect(() => {
    if (isEditMode) {
      fetch(`/api/fiches/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.societe) {
            setClientNom(data.societe.nom || "");
            setClientAdresse(data.societe.adresse || "");
            setClientLocalisation(data.societe.localisation || "");
            setClientContact(data.societe.contact || "");
            setClientTelephone(data.societe.telephone || "");
          }
          if (data.equipe) {
            setEquipeNom(data.equipe.nom_chauffeur || "");
            setEquipeVehicule(data.equipe.vehicule || "");
          }
          setDatePrevue(data.date_prevue || "");
          setHeureDepart(data.heure_depart_prevue || "");
          setHeureDebut(data.heure_debut_prevue || "");
          setTypeTravail(data.type_travail || "");
          setMetrage(data.metrage || "");
          setCout(data.cout ? String(data.cout) : "");
          setDescription(data.description || "");
          setInstructions(data.instructions || "");
          setPriorite(data.priorite || "Normale");
        });
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(isEditMode ? `/api/fiches/${id}` : "/api/fiches", {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_nom: clientNom,
          client_adresse: clientAdresse,
          client_localisation: clientLocalisation,
          client_contact: clientContact,
          client_telephone: clientTelephone,
          equipe_nom: equipeNom,
          equipe_vehicule: equipeVehicule,
          date_prevue: datePrevue,
          heure_depart_prevue: heureDepart,
          heure_debut_prevue: heureDebut,
          type_travail: typeTravail,
          description,
          instructions,
          priorite,
          metrage,
          cout
        })
      });

      if (res.ok) {
        const data = await res.json();
        navigate(`/fiches/${data.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <header className="space-y-3">
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft size={16} className={language === 'ar' ? 'rotate-180' : ''} />
          <span>{t("common.back")}</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-white tracking-tight">
          {isEditMode 
            ? (language === 'ar' ? 'تعديل أمر الشغل' : 'Modifier la fiche de travail') 
            : (language === 'ar' ? 'إنشاء أمر شغل جديد' : 'Créer un ordre de travail')}
        </h1>
      </header>

      <div className="space-y-6 sm:space-y-8">
        {/* Client & Lieu */}
        <section className="bg-white dark:bg-[#161615] p-5 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5 sm:space-y-6">
          <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest border-b border-stone-100 dark:border-stone-800/50 pb-3">
            {language === 'ar' ? 'العميل والموقع' : 'Client & Lieu'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {t("fiches.form.client")} *
              </label>
              <input type="text" required className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={clientNom} onChange={e => setClientNom(e.target.value)} placeholder={language === 'ar' ? 'مثال: شركة البناء والتعمير' : 'Ex: ABC Construction'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {language === 'ar' ? 'المسؤول' : 'Contact principal'}
              </label>
              <input type="text" className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={clientContact} onChange={e => setClientContact(e.target.value)} placeholder={language === 'ar' ? 'اسم المسؤول' : 'Nom du responsable'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {language === 'ar' ? 'الهاتف' : 'Téléphone'}
              </label>
              <input type="tel" className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={clientTelephone} onChange={e => setClientTelephone(e.target.value)} placeholder="00 000 000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {language === 'ar' ? 'عنوان المقر' : 'Adresse de facturation'}
              </label>
              <input type="text" className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={clientAdresse} onChange={e => setClientAdresse(e.target.value)} placeholder={language === 'ar' ? 'مقر الشركة' : 'Siège de l\'entreprise'} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {t("fiches.form.adresse")} *
              </label>
              <input type="text" required className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={clientLocalisation} onChange={e => setClientLocalisation(e.target.value)} placeholder={language === 'ar' ? 'مثال: حضيرة المنزه' : 'Ex: Chantier El Menzah'} />
            </div>
          </div>
        </section>

        {/* Equipe & Horaires */}
        <section className="bg-white dark:bg-[#161615] p-6 md:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest border-b border-stone-100 dark:border-stone-800/50 pb-3">
            {language === 'ar' ? 'الفريق والتوقيت' : 'Équipe & Horaires'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {t("fiches.form.equipe")} *
              </label>
              <input type="text" required className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={equipeNom} onChange={e => setEquipeNom(e.target.value)} placeholder={language === 'ar' ? 'مثال: أحمد' : 'Ex: Ahmed'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {language === 'ar' ? 'الشاحنة / الشاحنات (اختياري)' : 'Véhicule (Optionnel)'}
              </label>
              <input type="text" className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={equipeVehicule} onChange={e => setEquipeVehicule(e.target.value)} placeholder={language === 'ar' ? 'مثال: شاحنة 1234 تونس 100' : 'Ex: Fourgonette 1234 TU 100'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {t("fiches.form.date_prevue")}
              </label>
              <input type="date" required className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={datePrevue} onChange={e => setDatePrevue(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  {language === 'ar' ? 'وقت الانطلاق' : 'Départ prévu'}
                </label>
                <input type="time" required className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={heureDepart} onChange={e => setHeureDepart(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  {language === 'ar' ? 'وقت البدء' : 'Début prévu'}
                </label>
                <input type="time" required className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={heureDebut} onChange={e => setHeureDebut(e.target.value)} />
              </div>
            </div>
          </div>
        </section>

        {/* Travail Demandé */}
        <section className="bg-white dark:bg-[#161615] p-6 md:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <h2 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest border-b border-stone-100 dark:border-stone-800/50 pb-3">
            {t("fiches.form.nature_travaux")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {language === 'ar' ? 'نوع العمل' : 'Type de travail'}
              </label>
              <input type="text" required className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={typeTravail} onChange={e => setTypeTravail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {language === 'ar' ? 'الأولوية' : 'Priorité'}
              </label>
              <select className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={priorite} onChange={e => setPriorite(e.target.value)}>
                <option value="Normale">{language === 'ar' ? 'عادية' : 'Normale'}</option>
                <option value="Urgente">{language === 'ar' ? 'عاجلة' : 'Urgente'}</option>
                <option value="Très urgente">{language === 'ar' ? 'عاجلة جداً' : 'Très urgente'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {t("fiches.metrage")}
              </label>
              <input type="text" className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={metrage} onChange={e => setMetrage(e.target.value)} placeholder="Ex: 50 m2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                {t("fiches.cout")}
              </label>
              <input type="number" className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-stone-400" value={cout} onChange={e => setCout(e.target.value)} placeholder="Ex: 1500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              {language === 'ar' ? 'الوصف المفصل' : 'Description'}
            </label>
            <textarea required rows={3} className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none resize-none focus:ring-2 focus:ring-stone-400" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              {t("fiches.form.remarques")}
            </label>
            <textarea rows={2} className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-3 outline-none resize-none focus:ring-2 focus:ring-stone-400" value={instructions} onChange={e => setInstructions(e.target.value)} />
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm"
          >
            {t("common.cancel")}
          </button>
          <button 
            type="submit" 
            className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-8 py-3 rounded-xl font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-sm text-sm"
          >
            {t("fiches.form.save")}
          </button>
        </div>
      </div>
    </form>
  );
}
