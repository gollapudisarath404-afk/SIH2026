import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  FileCheck2,
  GitCompare,
  Globe,
  GraduationCap,
  HeartPulse,
  Home,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SchemeCard from "../components/SchemeCard.jsx";
import { useLanguage } from "../context/LanguageProvider.jsx";
import { listSchemes } from "../services/schemeService.js";

const categoryHighlights = [
  { id: "agriculture", name: "Agriculture", icon: Sprout, color: "from-emerald-500 to-teal-600", desc: "PM-KISAN, PMFBY, KCC loans" },
  { id: "education", name: "Education", icon: GraduationCap, color: "from-blue-500 to-indigo-600", desc: "NMMSS, Post-Matric, Pragati" },
  { id: "health", name: "Health", icon: HeartPulse, color: "from-rose-500 to-pink-600", desc: "Ayushman Bharat, PMMVY, Aarogyasri" },
  { id: "employment", name: "Employment", icon: Briefcase, color: "from-amber-500 to-orange-600", desc: "PM SVANidhi, PMEGP, Mudra Loans" },
  { id: "housing", name: "Housing", icon: Home, color: "from-purple-500 to-violet-600", desc: "PMAY-Gramin, PMAY-Urban 2.0" },
  { id: "social_security", name: "Social Security", icon: ShieldCheck, color: "from-teal-500 to-cyan-600", desc: "Atal Pension (APY), Sukanya Samriddhi" },
];

const featureSteps = [
  {
    step: "01",
    title: "Profile Matching",
    desc: "Input your age, occupation, state, and income. Our engine filters only eligible government schemes for you.",
    icon: Users,
  },
  {
    step: "02",
    title: "Deterministic Eligibility",
    desc: "Get instant, rule-based verification with clear breakdown of why you match or what criteria is needed.",
    icon: CheckCircle2,
  },
  {
    step: "03",
    title: "AI Scheme Assistant",
    desc: "Ask any question in English or Telugu. Grounded strictly in official government guidelines with zero hallucinations.",
    icon: MessageSquareText,
  },
];

export default function LandingPage() {
  const { t, language, setLanguage } = useLanguage();
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    listSchemes()
      .then((data) => setFeaturedSchemes(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center shadow-glow">
              <Sparkles className="h-5 w-5 text-white font-bold" />
            </div>
            <div>
              <p className="font-extrabold text-xl text-navy-900 tracking-tight leading-tight">{t("brand")}</p>
              <p className="text-xs text-teal-700 font-medium leading-tight">{t("tagline")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === "en" ? "te" : "en")}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-teal-600" />
              <span>{language === "en" ? "తెలుగు" : "English"}</span>
            </button>

            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-navy-800 hover:text-teal-600 transition-colors"
            >
              {t("login")}
            </Link>

            <Link
              to="/signup"
              className="rounded-full bg-gradient-to-r from-navy-800 to-navy-900 px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:bg-navy-950"
            >
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 bg-gradient-to-b from-teal-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-100/80 px-4 py-1.5 text-xs font-bold text-teal-900 mb-6 shadow-sm">
            <Award className="h-4 w-4 text-teal-700" />
            <span>Official Government Welfare Scheme Intelligence Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-navy-950 tracking-tight max-w-4xl mx-auto leading-tight">
            {t("tagline")}
          </h1>

          <p className="mt-5 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t("heroSubtitle")}
          </p>

          {/* Quick Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 rounded-2xl bg-white p-2.5 shadow-card border border-slate-200/80">
              <input
                type="text"
                className="flex-1 px-4 py-2.5 text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/login?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
              />
              <Link
                to={searchQuery ? `/login?q=${encodeURIComponent(searchQuery)}` : "/signup"}
                className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <span>{t("search")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Key Metric Badges */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white p-4 border border-slate-200/70 shadow-subtle text-center">
              <p className="text-2xl md:text-3xl font-extrabold text-navy-900">100%</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Grounded Dataset</p>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-slate-200/70 shadow-subtle text-center">
              <p className="text-2xl md:text-3xl font-extrabold text-teal-600">₹25L+</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Max Health Cover</p>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-slate-200/70 shadow-subtle text-center">
              <p className="text-2xl md:text-3xl font-extrabold text-saffron-600">Central & State</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Multi-level Schemes</p>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-slate-200/70 shadow-subtle text-center">
              <p className="text-2xl md:text-3xl font-extrabold text-indigo-600">Bilingual</p>
              <p className="text-xs font-medium text-slate-500 mt-1">English & తెలుగు</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scheme Categories Grid */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-navy-900">{t("category")} Highlights</h2>
            <p className="text-slate-600 mt-2 text-sm">
              Discover verified welfare opportunities grouped by major citizen impact areas.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryHighlights.map(({ id, name, icon: Icon, color, desc }) => (
              <Link
                key={id}
                to="/signup"
                className="group rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 hover:bg-white hover:border-teal-500/40 hover:shadow-hover transition-card"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${color} flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 group-hover:text-teal-700 transition-colors">
                  {name}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 font-medium">{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-teal-700">
                  <span>{t("browse")}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Workflow */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Simple 3-Step Process</span>
            <h2 className="text-3xl font-bold text-navy-900 mt-1">How SchemeSaathi AI Works</h2>
            <p className="text-slate-600 mt-2 text-sm">
              Connecting every citizen to rightful government benefits through transparent intelligence.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {featureSteps.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="rounded-2xl bg-white p-8 border border-slate-200/80 shadow-subtle relative">
                <span className="text-4xl font-extrabold text-teal-600/20 absolute top-6 right-6 font-mono">{step}</span>
                <div className="h-12 w-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-navy-900">{title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Schemes Preview */}
      {featuredSchemes.length ? (
        <section className="py-16 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Featured Schemes</span>
                <h2 className="text-3xl font-bold text-navy-900 mt-1">Popular Welfare Programs</h2>
              </div>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                <span>{t("exploreAll")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {featuredSchemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} t={t} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Call to Action Banner */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to find your eligible government benefits?
          </h2>
          <p className="mt-4 text-slate-300 max-w-xl mx-auto text-sm leading-relaxed">
            Create your citizen profile in under 1 minute and explore matching welfare schemes with step-by-step guidance.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="rounded-full bg-teal-500 px-8 py-3.5 text-sm font-bold text-navy-950 shadow-glow hover:bg-teal-400 transition-colors"
            >
              {t("getStarted")}
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-slate-600 px-8 py-3.5 text-sm font-semibold text-slate-200 hover:bg-navy-800 transition-colors"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 py-10 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div>
            <p className="font-bold text-white text-sm">{t("brand")}</p>
            <p className="mt-1 text-slate-400">{t("tagline")}</p>
          </div>
          <p className="text-center md:text-right max-w-md leading-relaxed text-slate-400">
            {t("disclaimer")}
          </p>
        </div>
      </footer>
    </div>
  );
}
