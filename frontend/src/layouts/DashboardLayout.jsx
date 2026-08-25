import {
  Bell,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  GitCompare,
  Globe,
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldAlert,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import { useLanguage } from "../context/LanguageProvider.jsx";

const navItems = [
  { key: "dashboard", path: "/user/dashboard", icon: LayoutDashboard },
  { key: "schemes", path: "/user/schemes", icon: BookOpen },
  { key: "eligibility", path: "/user/eligibility", icon: CheckCircle },
  { key: "recommendations", path: "/user/recommendations", icon: Sparkles },
  { key: "assistant", path: "/user/assistant", icon: MessageSquareText },
  { key: "documents", path: "/user/documents", icon: FileText },
  { key: "comparison", path: "/user/comparison", icon: GitCompare },
  { key: "notifications", path: "/user/notifications", icon: Bell },
  { key: "profile", path: "/user/profile", icon: User },
];

export default function DashboardLayout() {
  const { t, language, setLanguage } = useLanguage();
  const { logout, session, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-navy-900 text-slate-100 flex flex-col justify-between transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen overflow-hidden md:translate-x-0 ${
          collapsed ? "md:w-20" : "md:w-72"
        } w-72 ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className={`p-4 border-b border-navy-800/80 flex items-center ${collapsed ? "md:justify-center justify-between" : "justify-between"} flex-shrink-0`}>
            <Link to="/user/dashboard" className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center shadow-glow flex-shrink-0">
                <Sparkles className="h-5 w-5 text-navy-950 font-bold" />
              </div>
              {!collapsed && (
                <div className="hidden md:block truncate">
                  <p className="font-bold text-base text-white tracking-tight leading-tight truncate">{t("brand")}</p>
                  <p className="text-[10px] text-teal-300/90 font-medium leading-tight mt-0.5 truncate">{t("tagline")}</p>
                </div>
              )}
              <div className="md:hidden">
                <p className="font-bold text-base text-white tracking-tight leading-tight">{t("brand")}</p>
                <p className="text-[10px] text-teal-300/90 font-medium leading-tight mt-0.5">{t("tagline")}</p>
              </div>
            </Link>
            
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-white transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            {/* Mobile Close */}
            <button
              className="p-1 rounded-lg hover:bg-navy-800 md:hidden text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-hidden flex-1 flex flex-col justify-center">
            {navItems.map(({ key, path, icon: Icon }) => {
              const active = location.pathname === path || (path !== "/user/dashboard" && location.pathname.startsWith(path));
              return (
                <NavLink
                  key={path}
                  to={path}
                  title={collapsed ? t(key) : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center ${collapsed ? "md:justify-center gap-0" : "gap-3"} px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-teal-600 text-white shadow-md font-semibold"
                      : "text-slate-300 hover:bg-navy-800/70 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-white" : "text-slate-400"}`} />
                  {!collapsed && <span className="hidden md:inline truncate">{t(key)}</span>}
                  <span className="md:hidden">{t(key)}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Profile Card & Language in Sidebar Footer */}
        <div className="p-3 border-t border-navy-800/80 bg-navy-950/50">
          <div className={`flex items-center ${collapsed ? "md:justify-center md:flex-col" : "justify-between"} gap-2.5 mb-2`}>
            <Link
              to="/user/profile"
              title={collapsed ? session?.name || "Profile" : undefined}
              className="flex items-center gap-2.5 overflow-hidden group hover:opacity-90 transition-opacity"
            >
              <div className="h-8 w-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-xs flex-shrink-0">
                {session?.name ? session.name[0].toUpperCase() : "U"}
              </div>
              {!collapsed && (
                <div className="hidden md:block truncate">
                  <p className="text-xs font-semibold text-white truncate">{session?.name || "Citizen User"}</p>
                  <p className="text-[10px] text-slate-400 truncate">{profile?.state || "India"}</p>
                </div>
              )}
              <div className="md:hidden truncate">
                <p className="text-xs font-semibold text-white truncate">{session?.name || "Citizen User"}</p>
                <p className="text-[10px] text-slate-400 truncate">{profile?.state || "India"}</p>
              </div>
            </Link>
            <button
              onClick={logout}
              title={t("logout")}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {!collapsed && (
            <div className="hidden md:flex pt-2 border-t border-navy-800/60 items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Globe className="h-3 w-3 text-teal-400" />
                Lang:
              </span>
              <div className="flex items-center gap-0.5 bg-navy-800 rounded-lg p-0.5">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                    language === "en" ? "bg-teal-600 text-white shadow-sm" : "hover:text-white"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("te")}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                    language === "te" ? "bg-teal-600 text-white shadow-sm" : "hover:text-white"
                  }`}
                >
                  తెలుగు
                </button>
              </div>
            </div>
          )}
          <div className="md:hidden pt-2 border-t border-navy-800/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Globe className="h-3 w-3 text-teal-400" />
              Lang:
            </span>
            <div className="flex items-center gap-0.5 bg-navy-800 rounded-lg p-0.5">
              <button
                onClick={() => setLanguage("en")}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  language === "en" ? "bg-teal-600 text-white shadow-sm" : "hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("te")}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  language === "te" ? "bg-teal-600 text-white shadow-sm" : "hover:text-white"
                }`}
              >
                తెలుగు
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-3.5 shadow-subtle">
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-xl border border-slate-200 md:hidden hover:bg-slate-100 text-slate-700"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Desktop Panel Toggle button in Top Bar */}
            <button
              className="hidden md:flex p-2 rounded-xl border border-slate-200/80 hover:bg-slate-100 text-slate-600 hover:text-navy-900 transition-colors shadow-subtle"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Show sidebar" : "Hide sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4 text-teal-600" /> : <PanelLeftClose className="h-4 w-4 text-slate-500" />}
            </button>
            <div>
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider hidden sm:block">
                {t("brand")}
              </p>
              <h2 className="text-base font-bold text-navy-900 truncate">
                {t(navItems.find((n) => location.pathname.startsWith(n.path))?.key || "dashboard")}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switch Button */}
            <button
              onClick={() => setLanguage(language === "en" ? "te" : "en")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
            >
              <Globe className="h-3.5 w-3.5 text-teal-600" />
              <span>{language === "en" ? "తెలుగు" : "English"}</span>
            </button>

            {/* Quick Schemes Search shortcut */}
            <Link
              to="/user/schemes"
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-navy-900 transition-all shadow-sm"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("browse")}</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
