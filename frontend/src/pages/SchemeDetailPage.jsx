import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  FileText,
  Globe,
  HelpCircle,
  IndianRupee,
  Layers,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageProvider.jsx";
import { explainScheme } from "../services/aiService.js";
import { getSchemeById } from "../services/schemeService.js";

const tabs = [
  { id: "overview", labelKey: "overview", icon: BookOpen },
  { id: "benefits", labelKey: "benefits", icon: IndianRupee },
  { id: "eligibility", labelKey: "criteria", icon: CheckCircle2 },
  { id: "documents", labelKey: "requiredDocuments", icon: FileText },
  { id: "process", labelKey: "applicationProcess", icon: Layers },
  { id: "faqs", labelKey: "faqs", icon: HelpCircle },
];

export default function SchemeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, aiLanguage, language } = useLanguage();
  const [scheme, setScheme] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getSchemeById(Number(id))
      .then((data) => {
        setScheme(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || t("error"));
        setLoading(false);
      });
  }, [id]);

  const handleExplainWithAI = async () => {
    setExplaining(true);
    try {
      const data = await explainScheme({
        schemeId: Number(id),
        language: aiLanguage,
      });
      setExplanation(data.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setExplaining(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Sparkles className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-2" />
        <p className="text-sm font-medium">{t("loading")}</p>
      </div>
    );
  }

  if (!scheme || error) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center border border-slate-200 shadow-subtle max-w-lg mx-auto">
        <p className="text-sm text-rose-600 font-medium mb-4">{error || "Scheme details not found."}</p>
        <button
          onClick={() => navigate("/user/schemes")}
          className="rounded-xl bg-navy-800 px-4 py-2 text-xs font-semibold text-white hover:bg-navy-900"
        >
          Back to Schemes
        </button>
      </div>
    );
  }

  const portalLink =
    scheme.officialLinks?.schemePortal ||
    scheme.officialLinks?.myScheme ||
    "https://www.myscheme.gov.in";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* Main Header Banner */}
      <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            {scheme.category}
          </span>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            {scheme.governmentLevel || "Central"} Government
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            {scheme.status || "Active"}
          </span>
          {scheme.subCategory ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {scheme.subCategory}
            </span>
          ) : null}
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">
            {scheme.name}
          </h1>
          {scheme.shortName ? (
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {scheme.shortName}
            </p>
          ) : null}
        </div>

        <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-3xl">
          {scheme.description}
        </p>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-700">{t("ministry")}:</span> {scheme.ministry}
          </p>

          <a
            href={portalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm"
          >
            <span>{t("visitPortal")}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          to={`/user/eligibility?schemeId=${scheme.id}`}
          className="group rounded-2xl bg-white p-4 border border-slate-200/80 hover:border-teal-500/50 hover:shadow-hover transition-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-navy-900">{t("checkEligibility")}</p>
              <p className="text-[11px] text-slate-500">Instant rule evaluation</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to={`/user/documents?schemeId=${scheme.id}`}
          className="group rounded-2xl bg-white p-4 border border-slate-200/80 hover:border-teal-500/50 hover:shadow-hover transition-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-navy-900">{t("documents")}</p>
              <p className="text-[11px] text-slate-500">Readiness check</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to={`/user/assistant?schemeId=${scheme.id}`}
          className="group rounded-2xl bg-white p-4 border border-slate-200/80 hover:border-teal-500/50 hover:shadow-hover transition-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <MessageSquareText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-navy-900">{t("assistant")}</p>
              <p className="text-[11px] text-slate-500">Ask questions in EN / తెలుగు</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map(({ id: tabId, labelKey, icon: Icon }) => {
          const active = activeTab === tabId;
          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all flex-shrink-0 ${
                active
                  ? "border-teal-600 text-teal-700 bg-white shadow-subtle"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t(labelKey) || labelKey}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-200/80 shadow-subtle">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-navy-900 mb-3">{t("overview")}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{scheme.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-4 border-t border-slate-100">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("schemeType")}</p>
                <p className="text-sm font-bold text-navy-900 mt-1">{scheme.schemeType || "Welfare Support"}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("processingTime")}</p>
                <p className="text-sm font-bold text-navy-900 mt-1">{scheme.processingTime?.estimated || "15-30 days"}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("applicationWindow")}</p>
                <p className="text-sm font-bold text-navy-900 mt-1">{scheme.applicationWindow?.type || "Year Round"}</p>
              </div>
            </div>

            {scheme.beneficiaries?.length ? (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Beneficiaries</h4>
                <div className="flex flex-wrap gap-2">
                  {scheme.beneficiaries.map((b, idx) => (
                    <span key={idx} className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Benefits Tab */}
        {activeTab === "benefits" && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-navy-900">{t("benefits")}</h3>
            <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200 p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <IndianRupee className="h-5 w-5" />
                <span>Benefit Specification</span>
              </div>
              <p className="text-sm md:text-base font-semibold text-emerald-950 leading-relaxed">
                {scheme.benefit?.description || "Benefit details are listed on the official portal."}
              </p>
              {scheme.benefit?.frequency ? (
                <p className="text-xs font-medium text-emerald-800">
                  <span className="font-bold">Disbursement Frequency:</span> {scheme.benefit.frequency}
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Eligibility Tab */}
        {activeTab === "eligibility" && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-navy-900">{t("criteria")}</h3>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Age Criteria</p>
                <p className="text-sm font-bold text-navy-900 mt-1">{scheme.eligibility?.age || "Any"}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Income Limit</p>
                <p className="text-sm font-bold text-navy-900 mt-1">
                  {scheme.eligibility?.incomeLimit ? `Up to ₹${scheme.eligibility.incomeLimit.toLocaleString()}` : "No limit"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender</p>
                <p className="text-sm font-bold text-navy-900 mt-1">{scheme.eligibility?.gender || "Any"}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Occupation</p>
                <p className="text-sm font-bold text-navy-900 mt-1">{scheme.eligibility?.occupation || "Any"}</p>
              </div>
            </div>

            {scheme.eligibility?.general?.length ? (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">General Conditions</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  {scheme.eligibility.general.map((cond, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-navy-900">{t("requiredDocuments")}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {(scheme.requiredDocuments || []).map((doc, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Application Process Tab */}
        {activeTab === "process" && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-navy-900">{t("applicationProcess")}</h3>
            <ol className="space-y-4">
              {(scheme.applicationProcess || []).map((step, idx) => (
                <li key={idx} className="flex items-start gap-3.5">
                  <div className="h-7 w-7 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === "faqs" && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-navy-900">{t("faqs")}</h3>
            <div className="space-y-4 divide-y divide-slate-100">
              {(scheme.faqs || []).map((faq, idx) => (
                <div key={idx} className="pt-4 first:pt-0 space-y-1.5">
                  <p className="text-sm font-bold text-navy-900 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">Q</span>
                    <span>{faq.question}</span>
                  </p>
                  <p className="text-sm text-slate-600 pl-7 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
              {!scheme.faqs?.length ? (
                <p className="text-xs text-slate-500">No FAQs currently listed for this scheme.</p>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* AI Explanation Widget */}
      <div className="rounded-3xl bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 md:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300 mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Grounded Gemini Intelligence</span>
            </div>
            <h3 className="text-xl font-bold">{t("explain")} ({aiLanguage})</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Get an instant, simplified citizen breakdown synthesized from verified dataset facts.
            </p>
          </div>

          <button
            onClick={handleExplainWithAI}
            disabled={explaining}
            className="rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 px-5 py-2.5 text-xs font-bold transition-all shadow-glow flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${explaining ? "animate-spin" : ""}`} />
            <span>{explaining ? t("loading") : t("explain")}</span>
          </button>
        </div>

        {explanation ? (
          <div className="mt-4 rounded-2xl bg-white/10 p-5 border border-white/15 text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
            {explanation}
          </div>
        ) : null}
      </div>
    </div>
  );
}
