import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle,
  FileCheck2,
  GitCompare,
  MessageSquareText,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SchemeCard from "../components/SchemeCard.jsx";
import { useAuth } from "../context/AuthProvider.jsx";
import { useLanguage } from "../context/LanguageProvider.jsx";
import { getNotifications } from "../services/notificationService.js";
import { getRecommendations } from "../services/recommendationService.js";
import { listSchemes } from "../services/schemeService.js";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { profile, session } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [recs, setRecs] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      listSchemes(),
      getRecommendations(profile),
      getNotifications(profile),
    ])
      .then(([schemeList, recData, noteData]) => {
        setSchemes(schemeList);
        setRecs(recData);
        setNotifications(noteData.notifications || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [profile]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Profile Summary */}
      <div className="rounded-3xl bg-gradient-to-r from-navy-900 via-navy-800 to-teal-900 text-white p-6 md:p-8 shadow-card relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300 border border-teal-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Citizen Welfare Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {session?.name || "Citizen"}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Based on your profile ({profile?.state || "All India"}, {profile?.occupation || "Citizen"}, Category: {profile?.category || "General"}), we have computed personalized matches and important updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/user/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 text-xs font-semibold text-white transition-colors"
            >
              <User className="h-4 w-4 text-teal-400" />
              <span>Edit Profile</span>
            </Link>
            <Link
              to="/user/eligibility"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 px-4 py-2.5 text-xs font-bold transition-colors shadow-glow"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{t("checkEligibility")}</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      {error ? (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("schemes")}</span>
            <div className="h-8 w-8 rounded-lg bg-navy-50 flex items-center justify-center text-navy-700">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-navy-900">{schemes.length}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Available across sectors</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("recommendations")}</span>
            <div className="h-8 w-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-teal-600">{recs?.recommendedSchemes?.length || 0}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Matched to your profile</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("notifications")}</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-600">{notifications.length}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Deadlines & policy updates</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Category</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-xl font-extrabold text-navy-900 truncate">{recs?.recommendedDepartment || "General"}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Best match sector</p>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div>
        <h2 className="text-lg font-bold text-navy-900 mb-4">Quick Assistance Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/user/eligibility"
            className="group rounded-2xl bg-white p-5 border border-slate-200/80 hover:border-teal-500 hover:shadow-hover transition-card"
          >
            <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-3 group-hover:scale-105 transition-transform">
              <CheckCircle className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-navy-900 text-sm">{t("eligibility")}</h3>
            <p className="text-xs text-slate-500 mt-1">Check rule-based match criteria</p>
          </Link>

          <Link
            to="/user/assistant"
            className="group rounded-2xl bg-white p-5 border border-slate-200/80 hover:border-teal-500 hover:shadow-hover transition-card"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-105 transition-transform">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-navy-900 text-sm">{t("assistant")}</h3>
            <p className="text-xs text-slate-500 mt-1">Ask questions in EN / తెలుగు</p>
          </Link>

          <Link
            to="/user/documents"
            className="group rounded-2xl bg-white p-5 border border-slate-200/80 hover:border-teal-500 hover:shadow-hover transition-card"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-navy-900 text-sm">{t("documents")}</h3>
            <p className="text-xs text-slate-500 mt-1">Check document readiness rate</p>
          </Link>

          <Link
            to="/user/comparison"
            className="group rounded-2xl bg-white p-5 border border-slate-200/80 hover:border-teal-500 hover:shadow-hover transition-card"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-105 transition-transform">
              <GitCompare className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-navy-900 text-sm">{t("comparison")}</h3>
            <p className="text-xs text-slate-500 mt-1">Compare two schemes side-by-side</p>
          </Link>
        </div>
      </div>

      {/* Main Section: Recommendations & Notifications */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recommended Schemes (2 Columns) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-900">{t("recommendations")}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Schemes tailored to your occupation, income, and region</p>
            </div>
            <Link
              to="/user/recommendations"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View All Matches</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(recs?.recommendedSchemes || []).slice(0, 4).map((item) => (
              <Link
                key={item.schemeId}
                to={`/user/schemes/${item.schemeId}`}
                className="group rounded-2xl bg-white p-5 border border-slate-200/80 hover:border-teal-500/50 hover:shadow-hover transition-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md">
                      {item.department}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {item.score}% Match
                    </span>
                  </div>
                  <h3 className="font-bold text-navy-900 text-base mt-2.5 group-hover:text-teal-700 transition-colors line-clamp-1">
                    {item.schemeName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                    {item.reason}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-navy-800 group-hover:text-teal-600">
                  <span>{t("view")}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {recs?.otherRelevantSchemes?.length ? (
            <div className="rounded-2xl bg-slate-100/70 p-4 border border-slate-200/60 mt-4">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Other Opportunities</p>
              <div className="flex flex-wrap gap-2">
                {recs.otherRelevantSchemes.map((item) => (
                  <Link
                    key={item.schemeId}
                    to={`/user/schemes/${item.schemeId}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-teal-700 border border-slate-200 hover:border-teal-400 transition-colors"
                  >
                    <span>{item.schemeName}</span>
                    <span className="text-[10px] font-bold text-slate-400">({item.score}%)</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {/* Notifications & Announcements Feed (1 Column) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900">{t("notifications")}</h2>
            <Link
              to="/user/notifications"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>{t("all")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-subtle divide-y divide-slate-100 space-y-3">
            {notifications.slice(0, 5).map((item) => {
              const isHigh = item.priority === "High";
              return (
                <div key={item.id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isHigh ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium capitalize">{item.type}</span>
                  </div>
                  <h4 className="text-xs font-bold text-navy-900 mt-1.5">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">{item.message}</p>
                  {item.schemeId ? (
                    <Link
                      to={`/user/schemes/${item.schemeId}`}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:underline"
                    >
                      <span>Check Scheme</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : null}
                </div>
              );
            })}
            {!notifications.length && !loading ? (
              <p className="text-xs text-slate-500 py-4 text-center">No alerts for your profile at this time.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
