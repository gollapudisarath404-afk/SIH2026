import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  FileText,
  HelpCircle,
  Info,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageProvider.jsx";
import {
  checkDocumentReadiness,
  getDocumentChecklist,
} from "../services/documentService.js";
import { listSchemes } from "../services/schemeService.js";

export default function DocumentsPage() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const [schemes, setSchemes] = useState([]);
  const [schemeId, setSchemeId] = useState(Number(params.get("schemeId")) || "");
  const [docs, setDocs] = useState([]);
  const [available, setAvailable] = useState({});
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listSchemes()
      .then((data) => {
        setSchemes(data);
        if (!schemeId && data.length > 0) {
          setSchemeId(data[0].id);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!schemeId) return;
    setResult(null);
    getDocumentChecklist(schemeId)
      .then((data) => {
        setDocs(data.requiredDocuments || []);
        const init = {};
        (data.requiredDocuments || []).forEach((d) => {
          init[d.id] = false;
        });
        setAvailable(init);
      })
      .catch((err) => setError(err.message));
  }, [schemeId]);

  const handleCheck = async (e) => {
    if (e) e.preventDefault();
    if (!schemeId) return;

    setChecking(true);
    setError("");

    try {
      const payload = docs.map((doc) => ({
        id: doc.id,
        available: Boolean(available[doc.id]),
      }));
      const res = await checkDocumentReadiness(schemeId, payload);
      setResult(res);
    } catch (err) {
      setError(err.message || t("error"));
    } finally {
      setChecking(false);
    }
  };

  const toggleAll = (state) => {
    const next = {};
    docs.forEach((d) => {
      next[d.id] = state;
    });
    setAvailable(next);
  };

  const selectedScheme = schemes.find((s) => s.id === Number(schemeId));
  const availableCount = Object.values(available).filter(Boolean).length;
  const progressPercent = docs.length > 0 ? Math.round((availableCount / docs.length) * 100) : 0;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
          <FileCheck2 className="h-4 w-4" />
          <span>{t("docReadinessTitle")}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">
          {t("documents")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("docReadinessSubtitle")}
        </p>
      </div>

      {/* Scheme Selector */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-subtle space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          {t("selectScheme")}
        </label>
        <select
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm font-bold text-navy-900 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
          value={schemeId}
          onChange={(e) => setSchemeId(Number(e.target.value))}
        >
          {schemes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.category})
            </option>
          ))}
        </select>
      </div>

      {/* Real-time Readiness Progress Bar */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-subtle space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600 uppercase tracking-wider">{t("completionRate")}</span>
          <span className="text-teal-700 text-sm font-extrabold">{progressPercent}% Ready ({availableCount}/{docs.length})</span>
        </div>

        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive Document Checklist Form */}
      <form onSubmit={handleCheck} className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-navy-900">
            {t("requiredDocuments")} ({docs.length})
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleAll(true)}
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Select All
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => toggleAll(false)}
              className="text-xs font-semibold text-slate-500 hover:underline"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {docs.map((doc) => {
            const isChecked = Boolean(available[doc.id]);
            return (
              <label
                key={doc.id}
                className={`flex items-center gap-3.5 rounded-2xl p-4 border transition-all cursor-pointer ${
                  isChecked
                    ? "bg-teal-50/50 border-teal-300 text-navy-950 font-semibold"
                    : "bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    setAvailable({ ...available, [doc.id]: e.target.checked })
                  }
                  className="h-5 w-5 rounded-md border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm">{doc.name}</span>
              </label>
            );
          })}

          {!docs.length ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No specific documents listed in this dataset.
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={checking || !docs.length}
          className="w-full sm:w-auto rounded-2xl bg-navy-800 hover:bg-navy-900 text-white px-8 py-3.5 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {checking ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Verifying Readiness...</span>
            </>
          ) : (
            <>
              <FileCheck2 className="h-4 w-4 text-teal-400" />
              <span>Verify Document Readiness</span>
            </>
          )}
        </button>
      </form>

      {error ? (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {/* Result Card */}
      {result ? (
        <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200/80 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {result.readyToApply ? (
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7" />
                </div>
              )}
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                    result.readyToApply
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {result.readyToApply ? t("ready") : t("missing")}
                </span>
                <h3 className="text-xl font-extrabold text-navy-900 mt-1">
                  Readiness Rate: {result.completionPercentage}%
                </h3>
              </div>
            </div>

            {selectedScheme?.officialLinks?.schemePortal ? (
              <a
                href={selectedScheme.officialLinks.schemePortal}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
              >
                <span>{t("visitPortal")}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-1.5 text-sm text-slate-700 font-medium">
            <p className="font-bold text-navy-900">{result.message}</p>
            <p className="text-xs text-slate-600">{result.nextStep}</p>
          </div>

          {result.missingDocuments?.length ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Documents Needed ({result.missingDocuments.length})</span>
              </h4>
              <ul className="grid gap-2 sm:grid-cols-2">
                {result.missingDocuments.map((doc, idx) => (
                  <li
                    key={idx}
                    className="rounded-xl bg-amber-50/60 p-3 text-xs font-semibold text-amber-950 border border-amber-200/80 flex items-center gap-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Helpful Info on Obtaining Government Certificates */}
      <div className="rounded-3xl bg-slate-100/80 p-6 border border-slate-200/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Info className="h-4 w-4 text-teal-600" />
          <span>{t("whereToGet")}</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {t("whereToGetTip")}
        </p>
      </div>
    </div>
  );
}
