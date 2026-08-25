import {
  ArrowRight,
  CheckCircle,
  GitCompare,
  HelpCircle,
  Layers,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageProvider.jsx";
import { compareSchemes } from "../services/comparisonService.js";
import { listSchemes } from "../services/schemeService.js";

function FormatFieldCell({ value }) {
  if (value === null || value === undefined) return <span className="text-slate-400">—</span>;
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
        {value.map((item, idx) => (
          <li key={idx}>{String(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    if (value.description) {
      return <span className="text-xs font-medium text-slate-800">{value.description}</span>;
    }
    return (
      <div className="space-y-1 text-xs">
        {Object.entries(value).map(([k, v]) => (
          <p key={k}>
            <span className="font-bold text-slate-500 capitalize">{k}:</span> {String(v ?? "—")}
          </p>
        ))}
      </div>
    );
  }
  return <span className="text-xs font-medium text-slate-800">{String(value)}</span>;
}

export default function ComparisonPage() {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [scheme1Id, setScheme1Id] = useState("");
  const [scheme2Id, setScheme2Id] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listSchemes()
      .then((data) => {
        setSchemes(data);
        if (data.length >= 2) {
          setScheme1Id(data[0].id);
          setScheme2Id(data[1].id);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleCompare = async (e) => {
    if (e) e.preventDefault();
    if (!scheme1Id || !scheme2Id) return;

    if (Number(scheme1Id) === Number(scheme2Id)) {
      setError("Please choose two different schemes to compare.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await compareSchemes(Number(scheme1Id), Number(scheme2Id));
      setResult(data);
    } catch (err) {
      setError(err.message || t("error"));
    } finally {
      setLoading(false);
    }
  };

  const scheme1Obj = schemes.find((s) => s.id === Number(scheme1Id));
  const scheme2Obj = schemes.find((s) => s.id === Number(scheme2Id));

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
          <GitCompare className="h-4 w-4" />
          <span>{t("compareTitle")}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">
          {t("comparison")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("compareSubtitle")}
        </p>
      </div>

      {/* Selectors Bar */}
      <form onSubmit={handleCompare} className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Scheme 1 */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("scheme1")}
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm font-bold text-navy-900 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
              value={scheme1Id}
              onChange={(e) => setScheme1Id(e.target.value)}
            >
              <option value="">Select Scheme 1</option>
              {schemes.map((s) => (
                <option key={s.id} value={s.id} disabled={Number(scheme2Id) === s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
            {scheme1Obj ? (
              <p className="text-xs text-teal-700 font-medium pl-1">
                {scheme1Obj.category} · {scheme1Obj.governmentLevel} Government
              </p>
            ) : null}
          </div>

          {/* Scheme 2 */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("scheme2")}
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm font-bold text-navy-900 focus:bg-white focus:border-teal-500 focus:outline-none transition-colors"
              value={scheme2Id}
              onChange={(e) => setScheme2Id(e.target.value)}
            >
              <option value="">Select Scheme 2</option>
              {schemes.map((s) => (
                <option key={s.id} value={s.id} disabled={Number(scheme1Id) === s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
            {scheme2Obj ? (
              <p className="text-xs text-teal-700 font-medium pl-1">
                {scheme2Obj.category} · {scheme2Obj.governmentLevel} Government
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !scheme1Id || !scheme2Id}
          className="rounded-2xl bg-navy-800 hover:bg-navy-900 text-white px-8 py-3.5 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Comparing Schemes...</span>
            </>
          ) : (
            <>
              <GitCompare className="h-4 w-4 text-teal-400" />
              <span>{t("compare")}</span>
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

      {/* Comparison Results Card */}
      {result ? (
        <div className="space-y-6">
          {/* Summary Verdict Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-teal-900 text-white p-6 shadow-card space-y-2">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-widest">
                Target Persona
              </span>
              <h4 className="text-lg font-bold">{result.scheme1.name}</h4>
              <p className="text-xs text-slate-200 leading-relaxed pt-1">
                {result.summary.bestForScheme1}
              </p>
            </div>

            <div className="rounded-3xl bg-navy-900 text-white p-6 shadow-card space-y-2">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-widest">
                Target Persona
              </span>
              <h4 className="text-lg font-bold">{result.scheme2.name}</h4>
              <p className="text-xs text-slate-200 leading-relaxed pt-1">
                {result.summary.bestForScheme2}
              </p>
            </div>
          </div>

          {/* Similarities & Differences */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-subtle space-y-3">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>{t("similarities")}</span>
              </h4>
              <ul className="space-y-2">
                {result.summary.similarities.map((item, idx) => (
                  <li key={idx} className="rounded-xl bg-emerald-50/50 p-3 text-xs font-medium text-emerald-950 border border-emerald-100">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-subtle space-y-3">
              <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-amber-600" />
                <span>{t("differences")}</span>
              </h4>
              <ul className="space-y-2">
                {result.summary.differences.map((item, idx) => (
                  <li key={idx} className="rounded-xl bg-amber-50/50 p-3 text-xs font-medium text-amber-950 border border-amber-100">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="rounded-3xl bg-white border border-slate-200/80 shadow-subtle overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-navy-900">Detailed Feature Comparison</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-4 px-6 w-1/4">{t("field")}</th>
                    <th className="py-4 px-6 w-3/8 text-teal-800">{result.scheme1.name}</th>
                    <th className="py-4 px-6 w-3/8 text-navy-900">{result.scheme2.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {Object.entries(result.comparison).map(([fieldKey, compVal]) => (
                    <tr key={fieldKey} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider align-top bg-slate-50/30">
                        {fieldKey.replace(/([A-Z])/g, " $1")}
                      </td>
                      <td className="py-4 px-6 align-top border-r border-slate-100">
                        <FormatFieldCell value={compVal.scheme1} />
                      </td>
                      <td className="py-4 px-6 align-top">
                        <FormatFieldCell value={compVal.scheme2} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
