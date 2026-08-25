import {
  BookOpen,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import SchemeCard from "../components/SchemeCard.jsx";
import { useLanguage } from "../context/LanguageProvider.jsx";
import {
  listCategories,
  listSchemes,
  listStates,
  searchSchemes,
} from "../services/schemeService.js";

export default function SchemesPage() {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      let data = [];
      if (query.trim()) {
        data = await searchSchemes(query.trim());
      } else {
        data = await listSchemes({
          category: selectedCategory || undefined,
          state: selectedState && selectedState !== "All India" ? selectedState : undefined,
        });
      }

      if (selectedLevel) {
        data = data.filter(
          (s) => (s.governmentLevel || "").toLowerCase() === selectedLevel.toLowerCase()
        );
      }

      setSchemes(data);
    } catch (err) {
      setError(err.message || t("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
    listStates().then(setStates).catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedState, selectedLevel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleClearFilters = () => {
    setQuery("");
    setSelectedCategory("");
    setSelectedState("");
    setSelectedLevel("");
  };

  const hasActiveFilters = Boolean(query || selectedCategory || selectedState || selectedLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">
            {t("schemes")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse verified Indian central and state government welfare schemes.
          </p>
        </div>

        {hasActiveFilters ? (
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle self-start md:self-auto"
          >
            <X className="h-4 w-4 text-slate-400" />
            <span>{t("clearFilters")}</span>
          </button>
        ) : null}
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-3xl bg-white p-5 md:p-6 border border-slate-200/80 shadow-subtle space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-navy-800 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-900 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">{t("search")}</span>
          </button>
        </form>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <button
            onClick={() => setSelectedCategory("")}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === ""
                ? "bg-navy-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t("all")}
          </button>
          {categories.map((item) => {
            const catName = item.name || item.id;
            const active = selectedCategory === catName;
            return (
              <button
                key={item.id || item.name}
                onClick={() => setSelectedCategory(active ? "" : catName)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  active
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100">
          {/* State / UT Dropdown */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2">
            <MapPin className="h-4 w-4 text-teal-600 flex-shrink-0" />
            <select
              className="w-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">{t("state")}: {t("all")}</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Level Dropdown */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2">
            <Layers className="h-4 w-4 text-indigo-600 flex-shrink-0" />
            <select
              className="w-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">{t("governmentLevel")}: {t("all")}</option>
              <option value="Central">{t("central")}</option>
              <option value="State">{t("stateGovt")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-slate-500">
          Showing <span className="text-navy-900 font-bold">{schemes.length}</span> schemes
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {/* Scheme Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-teal-600 mb-2" />
          <p className="text-sm">{t("loading")}</p>
        </div>
      ) : schemes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} t={t} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-12 text-center border border-slate-200/80 shadow-subtle max-w-md mx-auto">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-900">{t("empty")}</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or clearing your selected filters.</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            {t("clearFilters")}
          </button>
        </div>
      )}
    </div>
  );
}
