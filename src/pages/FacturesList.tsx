import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Plus, Edit, Trash2, Printer, Search, Filter, RotateCcw, X, User } from "lucide-react";
import { Facture } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

export default function FacturesList() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Advanced Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedClient, setSelectedClient] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState<string>("");
  const [amountMax, setAmountMax] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { t, language } = useLanguage();

  useEffect(() => {
    fetchFactures();
  }, []);

  async function fetchFactures() {
    try {
      const res = await fetch("/api/factures");
      if (res.ok) {
        const data = await res.json();
        setFactures(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/factures/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setFactures(factures.filter(f => f.id !== deleteId));
        setDeleteId(null);
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

  const handlePrint = (id: string) => {
    window.open(`/api/factures/${id}/pdf`, "_blank");
  };

  // Unique list of clients for filter
  const uniqueClients = Array.from(
    new Set(factures.map(f => f.client_nom).filter(Boolean))
  ) as string[];

  // Advanced Filtering Logic
  const filteredFactures = factures.filter(facture => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = facture.numero?.toLowerCase().includes(q);
      const matchClient = facture.client_nom?.toLowerCase().includes(q);
      const matchLignes = facture.lignes?.some(l => l.description?.toLowerCase().includes(q));
      if (!matchNum && !matchClient && !matchLignes) {
        return false;
      }
    }

    if (selectedStatus !== "ALL") {
      if (facture.statut !== selectedStatus) return false;
    }

    if (selectedClient !== "ALL") {
      if (facture.client_nom !== selectedClient) return false;
    }

    if (dateFrom) {
      if (!facture.date_facture || facture.date_facture < dateFrom) return false;
    }

    if (dateTo) {
      if (!facture.date_facture || facture.date_facture > dateTo) return false;
    }

    if (amountMin !== "") {
      const minVal = parseFloat(amountMin);
      if (!isNaN(minVal) && (facture.total_ttc || 0) < minVal) return false;
    }

    if (amountMax !== "") {
      const maxVal = parseFloat(amountMax);
      if (!isNaN(maxVal) && (facture.total_ttc || 0) > maxVal) return false;
    }

    return true;
  });

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) +
    (selectedStatus !== "ALL" ? 1 : 0) +
    (selectedClient !== "ALL" ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (amountMin !== "" ? 1 : 0) +
    (amountMax !== "" ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedClient("ALL");
    setDateFrom("");
    setDateTo("");
    setAmountMin("");
    setAmountMax("");
  };

  if (loading) return (
    <div className="p-12 text-center text-stone-400 dark:text-stone-500 animate-pulse font-medium">
      {t("loading")}
    </div>
  );

  const totalEncaisse = factures.filter(f => f.statut === 'Payée').reduce((acc, curr) => acc + (curr.total_ttc || 0), 0);
  const totalAttente = factures.filter(f => ['Validée', 'Envoyée'].includes(f.statut)).reduce((acc, curr) => acc + (curr.total_ttc || 0), 0);
  const nbBrouillons = factures.filter(f => f.statut === 'Brouillon').length;

  const filteredTotalSum = filteredFactures.reduce((acc, f) => acc + (f.total_ttc || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-white tracking-tight mb-1">
            {t("factures.title")}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">{t("factures.desc")}</p>
        </div>
        <Link 
          to="/factures/new" 
          className="inline-flex items-center justify-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>{t("factures.new")}</span>
        </Link>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/60 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">{t("factures.total_encaisse")}</div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalEncaisse)}</div>
        </div>
        <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/60 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">{t("factures.en_attente")}</div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(totalAttente)}</div>
        </div>
        <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/60 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1">{t("factures.brouillons")}</div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-stone-100">{nbBrouillons}</div>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/80 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("common.search")}
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
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 animate-fadeIn">
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
                <option value="Brouillon">{t("factures.status.brouillon")}</option>
                <option value="Validée">{t("factures.status.validee")}</option>
                <option value="Envoyée">{t("factures.status.envoyee")}</option>
                <option value="Payée">{t("factures.status.payee")}</option>
                <option value="Annulée">{t("factures.status.annulee")}</option>
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

            {/* Min Amount */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                {t("common.amount_min")}
              </label>
              <input
                type="number"
                placeholder="0"
                value={amountMin}
                onChange={(e) => setAmountMin(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                {t("common.amount_max")}
              </label>
              <input
                type="number"
                placeholder="10000"
                value={amountMax}
                onChange={(e) => setAmountMax(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#1C1C1B] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-xl p-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>
        )}

        {/* Results Counter & Active Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/40 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {filteredFactures.length} / {factures.length}
              </span>{" "}
              <span>{t("common.results_count")}</span>
            </div>
            {filteredFactures.length > 0 && (
              <div className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 text-xs">
                {language === 'ar' ? 'المجموع المفلتر:' : 'Total filtré:'} {formatCurrency(filteredTotalSum)}
              </div>
            )}
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
              {amountMin !== "" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[11px] font-medium border border-stone-200 dark:border-stone-700">
                  ≥ {amountMin} DT
                  <button onClick={() => setAmountMin("")} className="hover:text-red-500"><X size={12}/></button>
                </span>
              )}
              {amountMax !== "" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[11px] font-medium border border-stone-200 dark:border-stone-700">
                  ≤ {amountMax} DT
                  <button onClick={() => setAmountMax("")} className="hover:text-red-500"><X size={12}/></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800/60 bg-stone-50/50 dark:bg-[#1C1C1B]">
                <th className="py-3.5 px-4 sm:px-6 text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-start">{t("factures.table.numero")}</th>
                <th className="py-3.5 px-4 sm:px-6 text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-start">{t("factures.table.date")}</th>
                <th className="py-3.5 px-4 sm:px-6 text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-start">{t("factures.table.client")}</th>
                <th className="py-3.5 px-4 sm:px-6 text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-start">{t("factures.table.statut")}</th>
                <th className="py-3.5 px-4 sm:px-6 text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-end">{t("factures.table.montant")}</th>
                <th className="py-3.5 px-4 sm:px-6 text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-end">{t("factures.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800/60 text-xs sm:text-sm">
              {filteredFactures.map((facture) => (
                <tr key={facture.id} className="hover:bg-stone-50/50 dark:hover:bg-[#1C1C1B]/50 transition-colors group">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                    <Link to={`/factures/${facture.id}`} className="hover:underline text-stone-900 dark:text-stone-100">
                      {facture.numero}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-stone-600 dark:text-stone-400 whitespace-nowrap">
                    {facture.date_facture ? new Date(facture.date_facture).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR') : '-'}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-stone-900 dark:text-stone-100 font-medium">
                    {facture.client_nom || (language === 'ar' ? 'عميل غير محدد' : 'Client non spécifié')}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-start whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                      facture.statut === 'Validée' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 border-blue-200' :
                      facture.statut === 'Envoyée' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 border-purple-200' :
                      facture.statut === 'Payée' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 border-emerald-200' :
                      facture.statut === 'Annulée' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200 dark:border-red-900/50' :
                      'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                    }`}>
                      {translateStatus(facture.statut)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-stone-900 dark:text-stone-100 text-end whitespace-nowrap">
                    {formatCurrency(facture.total_ttc)}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-end whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handlePrint(facture.id)}
                        title={language === 'ar' ? 'طباعة' : 'Imprimer'}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
                      >
                        <Printer size={15} />
                      </button>
                      <Link 
                        to={`/factures/${facture.id}/edit`}
                        title={t("common.edit")}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
                      >
                        <Edit size={15} />
                      </Link>
                      <button
                        onClick={() => setDeleteId(facture.id)}
                        title={t("common.delete")}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                      <Link 
                        to={`/factures/${facture.id}`} 
                        title="Voir"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 transition-colors"
                      >
                        <ChevronRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredFactures.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 dark:text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Filter size={32} className="text-stone-300 dark:text-stone-700" />
                      <p>{t("factures.table.empty")}</p>
                      {activeFiltersCount > 0 && (
                        <button onClick={resetFilters} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-1">
                          {t("common.reset_filters")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161615] rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {language === 'ar' ? 'تأكيد الحذف' : 'Confirmer la suppression'}
            </h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
              {language === 'ar' 
                ? 'هل أنت تأكد من إمكانية حذف هذه الفاتورة؟ هذا الإجراء غير قابل للتراجع.' 
                : 'Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.'}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setDeleteId(null)}
                className="px-5 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button 
                onClick={handleDelete}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
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
