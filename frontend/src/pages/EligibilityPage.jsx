import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import { useLanguage } from "../context/LanguageProvider.jsx";
import {
  checkEligibility,
  getEligibilityQuestions,
} from "../services/eligibilityService.js";
import { listSchemes } from "../services/schemeService.js";

export default function EligibilityPage() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [params] = useSearchParams();
  const [schemes, setSchemes] = useState([]);
  const [schemeId, setSchemeId] = useState(Number(params.get("schemeId")) || "");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
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
    getEligibilityQuestions(schemeId)
      .then((q) => {
        setQuestions(q);
        const initial = {};
        q.forEach((item) => {
          initial[item.field] = "Yes";
        });
        setAnswers(initial);
      })
      .catch((err) => setError(err.message));
  }, [schemeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!schemeId) return;

    setEvaluating(true);
    setError("");

    const schemeAnswers = {};
    questions.forEach((q) => {
      if (
        [
          "age",
          "gender",
          "state",
          "occupation",
          "annualIncome",
          "category",
          "disability",
        ].includes(q.field)
      ) {
        return;
      }
      const val = answers[q.field];
      schemeAnswers[q.field] = val === "Yes" || val === true;
    });

    try {
      const data = await checkEligibility(schemeId, {
        userProfile: profile,
        schemeAnswers,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || t("error"));
    } finally {
      setEvaluating(false);
    }
  };

  const selectedScheme = schemes.find((s) => s.id === Number(schemeId));
  const specificQuestions = questions.filter(
    (q) =>
      ![
        "age",
        "gender",
        "state",
        "occupation",
        "annualIncome",
        "category",
        "disability",
      ].includes(q.field)
  );

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
          <CheckCircle className="h-4 w-4" />
          <span>{t("eligibilityTitle")}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">
          {t("eligibility")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("eligibilitySubtitle")}
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
              {s.name} ({s.category} · {s.governmentLevel})
            </option>
          ))}
        </select>

        {selectedScheme ? (
          <div className="rounded-2xl bg-teal-50/60 p-4 border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                {selectedScheme.category}
              </span>
              <p className="text-sm font-bold text-navy-900 mt-0.5">{selectedScheme.name}</p>
            </div>
            <Link
              to={`/user/schemes/${selectedScheme.id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline"
            >
              <span>{t("view")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : null}
      </div>

      {/* Profile Check Info Box */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <User className="h-4 w-4 text-teal-600" />
            <span>Profile Data Used in Evaluation</span>
          </div>
          <Link
            to="/user/profile"
            className="text-xs font-semibold text-teal-700 hover:underline"
          >
            Update Profile
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Age</p>
            <p className="text-sm font-bold text-navy-900 mt-0.5">{profile?.age || 30} yrs</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Occupation</p>
            <p className="text-sm font-bold text-navy-900 mt-0.5">{profile?.occupation || "Citizen"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Annual Income</p>
            <p className="text-sm font-bold text-navy-900 mt-0.5">₹{(profile?.annualIncome || 0).toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-[11px] text-slate-400 font-semibold uppercase">State / Category</p>
            <p className="text-sm font-bold text-navy-900 mt-0.5">{profile?.state || "AP"} · {profile?.category || "General"}</p>
          </div>
        </div>
      </div>

      {/* Scheme-Specific Questions Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-6">
        <h3 className="text-base font-bold text-navy-900">
          Scheme Specific Eligibility Checkpoints
        </h3>

        {specificQuestions.length > 0 ? (
          <div className="space-y-4">
            {specificQuestions.map((q) => (
              <div key={q.field} className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">{q.question}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {["Yes", "No"].map((opt) => {
                    const active = answers[q.field] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [q.field]: opt })}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? opt === "Yes"
                              ? "bg-teal-600 text-white shadow-sm"
                              : "bg-rose-600 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            This scheme evaluates automatically using your core citizen profile attributes.
          </p>
        )}

        <button
          type="submit"
          disabled={evaluating}
          className="w-full sm:w-auto rounded-2xl bg-navy-800 hover:bg-navy-900 text-white px-8 py-3.5 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {evaluating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Evaluating...</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-teal-400" />
              <span>{t("evaluateNow")}</span>
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
          {/* Result Header Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {result.eligible ? (
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <XCircle className="h-7 w-7" />
                </div>
              )}
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                    result.status === "Eligible"
                      ? "bg-emerald-50 text-emerald-700"
                      : result.status === "Possibly eligible"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {result.status || (result.eligible ? t("eligible") : t("notEligible"))}
                </span>
                <h3 className="text-xl font-extrabold text-navy-900 mt-1">
                  Evaluation: {result.overallScore}% Rule Match
                </h3>
              </div>
            </div>

            <Link
              to={`/user/documents?schemeId=${schemeId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
            >
              <span>{t("documents")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-sm text-slate-700 font-medium">
            {result.recommendation}
          </div>

          {/* Matched & Failed Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Matched */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>{t("matchedConditions")} ({result.matchedConditions?.length || 0})</span>
              </h4>
              <ul className="space-y-2">
                {(result.matchedConditions || []).map((item, idx) => (
                  <li key={idx} className="rounded-xl bg-emerald-50/50 p-3 text-xs font-medium text-emerald-950 border border-emerald-100 flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
                {!result.matchedConditions?.length ? (
                  <p className="text-xs text-slate-400">No matched conditions recorded.</p>
                ) : null}
              </ul>
            </div>

            {/* Failed */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="h-4 w-4" />
                <span>{t("failedConditions")} ({result.failedConditions?.length || 0})</span>
              </h4>
              <ul className="space-y-2">
                {(result.failedConditions || []).map((item, idx) => (
                  <li key={idx} className="rounded-xl bg-rose-50/50 p-3 text-xs font-medium text-rose-950 border border-rose-100 flex items-start gap-2">
                    <XCircle className="h-3.5 w-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
                {!result.failedConditions?.length ? (
                  <p className="text-xs text-slate-400">No disqualifying conditions found.</p>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
