import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ChevronRight, Clock, MapPin, Edit, Trash2, Printer, Search, Filter, RotateCcw, X, Calendar, User, CheckCircle2 } from "lucide-react";
import { FicheTravail } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

export default function FichesList() {
  const [fiches, setFiches] = useState<FicheTravail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedClient, setSelectedClient] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { t, language } = useLanguage();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/fiches");
        const data = await res.json();
        setFiches(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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

  const handlePrint = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`/api/fiches/${id}/pdf`, "_blank");
  };

  // Get list of unique client names for dropdown
  const uniqueClients = Array.from(
    new Set(fiches.map(f => f.societe?.nom).filter(Boolean))
  ) as string[];

  // Filtering logic
  const filteredFiches = fiches.filter(fiche => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = fiche.numero?.toLowerCase().includes(q);
      const matchClient = fiche.societe?.nom?.toLowerCase().includes(q);
      const matchAddress = fiche.societe?.localisation?.toLowerCase().includes(q);
      const matchChauffeur = fiche.equipe?.nom_chauffeur?.toLowerCase().includes(q);
      const matchType = fiche.type_travail?.toLowerCase().includes(q);
      if (!matchNum && !matchClient && !matchAddress && !matchChauffeur && !matchType) {
        return false;
      }
    }

    if (selectedStatus !== "ALL") {
      if (selectedStatus === "Planifiée") {
        if (fiche.statut !== "Planifiée" && fiche.statut !== "Affectée") return false;
      } else if (fiche.statut !== selectedStatus) {
        return false;
      }
    }

    if (selectedClient !== "ALL") {
      if (fiche.societe?.nom !== selectedClient) return false;
    }

    if (dateFrom) {
      if (!fiche.date_prevue || fiche.date_prevue < dateFrom) return false;
    }

    if (dateTo) {
      if (!fiche.date_prevue || fiche.date_prevue > dateTo) return false;
    }

    return true;
  });

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) +
    (selectedStatus !== "ALL" ? 1 : 0) +
    (selectedClient !== "ALL" ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedClient("ALL");
    setDateFrom("");
    setDateTo("");
  };

  if (loading) return (
    <div className="p-12 text-center text-stone-400 dark:text-stone-500 font-medium tracking-wide animate-pulse">
      {t("loading")}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-white tracking-tight mb-1">
            {t("fiches.title")}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">{t("fiches.desc")}</p>
        </div>
        <Link 
          to="/fiches/new" 
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-white dark:text-stone-900 bg-stone-900 dark:bg-stone-100 rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>{t("fiches.new")}</span>
        </Link>
      </header>

      {/* Advanced Filtering Toolbar */}
      <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/80 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("fiches.search")}
              className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 rounded-xl py-2.5 pl-10 pr-9 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-stone-400 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Action Buttons: Toggle Filters & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                showFilters || activeFiltersCount > 0
                  ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100"
                  : "bg-stone-50 dark:bg-[#1C1C1B] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              <Filter size={16} />
              <span>{t("common.filters")}</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold inline-flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                title={t("common.reset_filters")}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 transition-colors"
              >
                <RotateCcw size={15} />
                <span className="hidden sm:inline">{t("common.reset_filters")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Expanded Filter Controls */}
        {showFilters && (
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-fadeIn">
            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                {t("common.status")}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-stone-400"
              >
                <option value="ALL">{t("common.filter_status")}</option>
                <option value="Brouillon">{t("fiches.status.brouillon")}</option>
                <option value="Planifiée">{t("fiches.status.planifiee")}</option>
                <option value="En cours">{t("fiches.status.en_cours")}</option>
                <option value="Terminée">{t("fiches.status.terminee")}</option>
                <option value="Annulée">{t("fiches.status.annulee")}</option>
              </select>
            </div>

            {/* Client Filter */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                {language === 'ar' ? 'العميل' : 'Client'}
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-stone-400"
              >
                <option value="ALL">{t("common.filter_client")}</option>
                {uniqueClients.map((client) => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>

            {/* Date Start */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                {t("common.date_from")}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            {/* Date End */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                {t("common.date_to")}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>
        )}

        {/* Results Counter & Active Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/40 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {filteredFiches.length} / {fiches.length}
            </span>
            <span>{t("common.results_count")}</span>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedStatus !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[11px] font-medium border border-stone-200 dark:border-stone-700">
                  {translateStatus(selectedStatus)}
                  <button onClick={() => setSelectedStatus("ALL")} className="hover:text-red-500"><X size={12}/></button>
                </span>
              )}
              {selectedClient !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[11px] font-medium border border-stone-200 dark:border-stone-700">
                  <User size={12} /> {selectedClient}
                  <button onClick={() => setSelectedClient("ALL")} className="hover:text-red-500"><X size={12}/></button>
                </span>
              )}
              {dateFrom && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[11px] font-medium border border-stone-200 dark:border-stone-700">
                  ≥ {dateFrom}
                  <button onClick={() => setDateFrom("")} className="hover:text-red-500"><X size={12}/></button>
                </span>
              )}
              {dateTo && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[11px] font-medium border border-stone-200 dark:border-stone-700">
                  ≤ {dateTo}
                  <button onClick={() => setDateTo("")} className="hover:text-red-500"><X size={12}/></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Fiches Table */}
      <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800/50 text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider bg-stone-50 dark:bg-[#1C1C1B]/50">
                <th className="py-3.5 px-4 sm:px-6 text-start font-medium">{t("fiches.table.numero")}</th>
                <th className="py-3.5 px-4 sm:px-6 text-start font-medium">{t("fiches.table.client")}</th>
                <th className="py-3.5 px-4 sm:px-6 text-start font-medium">{t("fiches.table.date")}</th>
                <th className="py-3.5 px-4 sm:px-6 text-start font-medium">{t("fiches.table.team")}</th>
                <th className="py-3.5 px-4 sm:px-6 text-start font-medium">{t("fiches.table.statut")}</th>
                <th className="py-3.5 px-4 sm:px-6 text-end font-medium">{t("fiches.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/50 text-xs sm:text-sm">
              {filteredFiches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-stone-500 dark:text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Filter size={32} className="text-stone-300 dark:text-stone-700" />
                      <p>{t("fiches.table.empty")}</p>
                      {activeFiltersCount > 0 && (
                        <button onClick={resetFilters} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-1">
                          {t("common.reset_filters")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFiches.map(fiche => (
                  <tr key={fiche.id} className="hover:bg-stone-50 dark:hover:bg-[#1C1C1B]/50 transition-colors group">
                    <td className="py-3.5 px-4 sm:px-6 text-start whitespace-nowrap">
                      <Link to={`/fiches/${fiche.id}`} className="font-semibold text-stone-900 dark:text-stone-100 hover:underline">
                        {fiche.numero}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-start">
                      <div className="font-medium text-stone-900 dark:text-stone-100">{fiche.societe?.nom || '-'}</div>
                      <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5"><MapPin size={12} className="shrink-0"/> <span className="truncate">{fiche.societe?.localisation || '-'}</span></div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-start text-xs sm:text-sm text-stone-600 dark:text-stone-400 whitespace-nowrap">
                      <div>{fiche.date_prevue ? new Date(fiche.date_prevue).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR') : '-'}</div>
                      <div className="text-xs flex items-center gap-1 mt-0.5 text-stone-400"><Clock size={12}/> {fiche.heure_debut_prevue}</div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-start text-xs sm:text-sm text-stone-600 dark:text-stone-400 whitespace-nowrap">
                      {fiche.equipe?.nom_chauffeur || '-'}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-start whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                        fiche.statut === 'Terminée' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                        fiche.statut === 'En cours' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
                        fiche.statut === 'Planifiée' || fiche.statut === 'Affectée' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
                        fiche.statut === 'Annulée' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                        'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}>
                        {translateStatus(fiche.statut)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-end whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => handlePrint(e, fiche.id)}
                          title={language === 'ar' ? 'طباعة' : 'Imprimer'}
                          className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 rounded-lg transition-colors"
                        >
                          <Printer size={16} />
                        </button>
                        <Link 
                          to={`/fiches/${fiche.id}/edit`} 
                          title={t("common.edit")}
                          className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            const msg = language === 'ar' ? 'هل أنت تأكد من إمكانية حذف أمر الشغل؟' : 'Voulez-vous vraiment supprimer cette fiche ?';
                            if(window.confirm(msg)) { 
                              fetch(`/api/fiches/${fiche.id}`, { method: 'DELETE' }).then(() => setFiches(fiches.filter(f => f.id !== fiche.id))); 
                            } 
                          }} 
                          title={t("common.delete")}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <Link 
                          to={`/fiches/${fiche.id}`} 
                          title="Voir"
                          className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                        >
                          <ChevronRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
