import {
  ArrowRight,
  Award,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import { useLanguage } from "../context/LanguageProvider.jsx";
import { getRecommendations } from "../services/recommendationService.js";

export default function RecommendationsPage() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecommendations = () => {
    setLoading(true);
    setError("");
    getRecommendations(profile)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || t("error"));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadRecommendations();
  }, [profile]);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Profile-Powered Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">
            {t("recommendations")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("recommendationSubtitle")}
          </p>
        </div>

        <Link
          to="/user/profile"
          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle self-start sm:self-auto"
        >
          <User className="h-4 w-4 text-teal-600" />
          <span>Edit Profile</span>
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-teal-600 mb-2" />
          <p className="text-sm">{t("loading")}</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Top Recommendation Department Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-teal-900 to-navy-900 text-white p-6 md:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-teal-300 uppercase tracking-widest">
                Primary Opportunity Focus
              </span>
              <h2 className="text-2xl font-extrabold mt-1">
                {data.recommendedDepartment} Sector
              </h2>
              <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
                Based on your registered profile ({profile?.occupation}, {profile?.state}), schemes in {data.recommendedDepartment} offer the highest eligibility score.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-6 py-4 border border-white/15 text-center flex-shrink-0">
              <p className="text-2xl font-extrabold text-teal-300">
                {data.recommendedSchemes.length}
              </p>
              <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mt-0.5">
                Top Matches
              </p>
            </div>
          </div>

          {/* Primary Recommended Schemes Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-navy-900">
              Top Ranked Schemes for You
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              {data.recommendedSchemes.map((item) => (
                <div
                  key={item.schemeId}
                  className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-subtle hover:shadow-hover transition-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                        {item.department}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                        {item.score}% Match
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-navy-900 mt-3">
                      {item.schemeName}
                    </h4>

                    <div className="mt-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("matchReason")}</p>
                      <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">{item.reason}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/user/schemes/${item.schemeId}`}
                      className="text-xs font-bold text-navy-900 hover:text-teal-600 flex items-center gap-1"
                    >
                      <span>{t("view")}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      to={`/user/eligibility?schemeId=${item.schemeId}`}
                      className="rounded-xl bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 px-3.5 py-1.5 text-xs font-bold transition-colors"
                    >
                      {t("checkEligibility")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Other Relevant Opportunities */}
          {data.otherRelevantSchemes?.length ? (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-lg font-bold text-navy-900">
                {t("otherMatchingSchemes")}
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                {data.otherRelevantSchemes.map((item) => (
                  <Link
                    key={item.schemeId}
                    to={`/user/schemes/${item.schemeId}`}
                    className="group rounded-2xl bg-white p-5 border border-slate-200/80 hover:border-teal-400 hover:shadow-subtle transition-card flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.department}
                      </span>
                      <h4 className="text-sm font-bold text-navy-900 mt-1 group-hover:text-teal-700 transition-colors line-clamp-2">
                        {item.schemeName}
                      </h4>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                      <span className="font-bold text-teal-700">{item.score}% Match</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
