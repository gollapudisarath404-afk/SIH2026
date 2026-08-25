import { ArrowRight, CheckCircle2, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function SchemeCard({ scheme, t }) {
  const benefitDesc = scheme.benefit?.description || "";
  const isCentral = scheme.governmentLevel?.toLowerCase() === "central";

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle hover:shadow-hover transition-card border-t-4 border-t-teal-600">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
            {scheme.category}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isCentral ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-800"
            }`}
          >
            {scheme.governmentLevel || "Central"}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-bold text-navy-800 group-hover:text-teal-700 transition-colors line-clamp-1">
          {scheme.name}
        </h3>
        
        {scheme.shortName ? (
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{scheme.shortName}</p>
        ) : null}

        <p className="mt-2.5 text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {scheme.description}
        </p>

        {benefitDesc ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-xs font-medium text-slate-500">{t("benefits") || "Benefits"}</p>
            <p className="text-xs font-semibold text-slate-800 line-clamp-2 mt-0.5">
              {benefitDesc}
            </p>
          </div>
        ) : null}

        {scheme.beneficiaries?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {scheme.beneficiaries.slice(0, 2).map((item, idx) => (
              <span key={idx} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {item}
              </span>
            ))}
            {scheme.beneficiaries.length > 2 ? (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                +{scheme.beneficiaries.length - 2}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/user/schemes/${scheme.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-teal-600 transition-colors"
        >
          {t("view")}
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          to={`/user/eligibility?schemeId=${scheme.id}`}
          className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-600 hover:text-white transition-colors"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {t("checkEligibility")}
        </Link>
      </div>
    </article>
  );
}
