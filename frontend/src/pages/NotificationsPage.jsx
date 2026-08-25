import {
  AlertCircle,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Megaphone,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import { useLanguage } from "../context/LanguageProvider.jsx";
import { getNotifications } from "../services/notificationService.js";

const filterOptions = [
  { id: "all", label: "All Alerts", icon: Bell },
  { id: "recommendation", label: "Recommendations", icon: Sparkles },
  { id: "deadline", label: "Deadlines", icon: Calendar },
  { id: "document", label: "Documents", icon: FileText },
  { id: "announcement", label: "Announcements", icon: Megaphone },
];

export default function NotificationsPage() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = () => {
    setLoading(true);
    setError("");
    getNotifications(profile)
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
    loadNotifications();
  }, [profile]);

  const rawList = data?.notifications || [];
  const filteredList =
    activeFilter === "all"
      ? rawList
      : rawList.filter((item) => item.type === activeFilter);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
          <Bell className="h-4 w-4" />
          <span>Real-time Scheme Updates</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">
          {t("notifications")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("notificationSubtitle")}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterOptions.map(({ id, label, icon: Icon }) => {
          const active = activeFilter === id;
          return (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all flex-shrink-0 ${
                active
                  ? "bg-navy-800 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
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
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => {
            const isHigh = item.priority === "High";
            const isMedium = item.priority === "Medium";

            return (
              <div
                key={item.id}
                className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-subtle hover:shadow-hover transition-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isHigh
                          ? "bg-rose-50 text-rose-700"
                          : isMedium
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.priority} Priority
                    </span>
                    <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                      {item.type}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-navy-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{item.message}</p>
                </div>

                {item.schemeId ? (
                  <Link
                    to={`/user/schemes/${item.schemeId}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 text-navy-900 hover:text-teal-700 border border-slate-200 hover:border-teal-300 px-4 py-2 text-xs font-bold transition-colors flex-shrink-0 self-start sm:self-center"
                  >
                    <span>{t("view")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            );
          })}

          {!filteredList.length ? (
            <div className="rounded-3xl bg-white p-12 text-center border border-slate-200/80 shadow-subtle">
              <Bell className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-navy-900">No notifications in this filter category.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
